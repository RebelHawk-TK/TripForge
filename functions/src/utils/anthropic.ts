import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a travel planning AI. Generate itineraries as structured JSON.

CRITICAL RULES:
- Return ONLY a valid JSON object. No markdown, no code fences, no explanation before or after.
- Do NOT use trailing commas in arrays or objects.
- Do NOT include any text outside the JSON object.
- Start your response with { and end with }
- Keep descriptions brief (1-2 sentences max) to stay within response limits.

JSON schema:
{
  "days": [{
    "dayNumber": 1,
    "date": "2026-04-10",
    "morning": { "name": "Activity Name", "description": "Brief description.", "location": "Neighborhood or address", "estimatedCost": 0 },
    "afternoon": { "name": "...", "description": "...", "location": "...", "estimatedCost": 0 },
    "evening": { "name": "...", "description": "...", "location": "...", "estimatedCost": 0 },
    "estimatedCost": 0
  }]
}

Be specific — use real restaurant names, real attractions, real neighborhoods. Adjust for budget and traveler preferences.`;

interface GenerateParams {
  destination: string;
  days: number;
  budgetPerDay: number;
  travelers: number;
  travelerType: string;
  preferences: Record<string, unknown>;
  startDate: string;
  endDate: string;
  tier: "free" | "basic" | "enhanced";
}

/**
 * Extract valid JSON from text that may contain markdown fences or extra content.
 */
function extractJSON(raw: string): Record<string, unknown> {
  let text = raw.trim();

  // Strip markdown code fences
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Fall through to extraction
  }

  // Try to extract the JSON object from surrounding text
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      // Fall through
    }
  }

  // Try fixing common issues: trailing commas
  const cleaned = text
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]");
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fall through
  }

  // Try extracting + cleaning
  const match2 = cleaned.match(/\{[\s\S]*\}/);
  if (match2) {
    try {
      return JSON.parse(match2[0]);
    } catch {
      // Fall through
    }
  }

  throw new Error(`Could not parse JSON from AI response. Raw length: ${raw.length}, starts with: ${raw.substring(0, 100)}`);
}

export async function generateItinerary(params: GenerateParams): Promise<Record<string, unknown>> {
  // Use Haiku for all tiers — fast, cheap, reliable
  // Upgrade to Sonnet when API access is confirmed
  const model = "claude-haiku-4-5-20251001";

  const tierInstructions = {
    free: "Keep it concise — activity name, location, and brief 1-sentence description only.",
    basic: "Include descriptions and estimated costs per activity.",
    enhanced: "Include descriptions, costs, and specific booking recommendations with venue names and addresses.",
  };

  const userPrompt = `Plan a ${params.days}-day trip to ${params.destination}.
Budget: $${params.budgetPerDay}/day per person
Travelers: ${params.travelers} (${params.travelerType})
Preferences: ${JSON.stringify(params.preferences)}
Dates: ${params.startDate} to ${params.endDate}

${tierInstructions[params.tier]}

Remember: respond with ONLY the JSON object, starting with { and ending with }. No other text.`;

  const message = await anthropic.messages.create({
    model,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : "";

  if (!rawText) {
    throw new Error("AI returned empty response");
  }

  return extractJSON(rawText);
}
