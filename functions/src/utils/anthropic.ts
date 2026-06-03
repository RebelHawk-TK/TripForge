import Anthropic from "@anthropic-ai/sdk";
import * as logger from "firebase-functions/logger";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a travel planning AI. Generate itineraries as structured JSON.

CRITICAL RULES:
- Return ONLY a valid JSON object. No markdown, no code fences, no explanation.
- Do NOT use trailing commas in arrays or objects.
- Start your response with { and end with }
- Keep descriptions brief (1 sentence max) to stay within limits.

JSON schema:
{
  "days": [{
    "dayNumber": 1,
    "date": "2026-04-10",
    "morning": { "name": "Activity Name", "description": "Brief.", "location": "Area", "estimatedCost": 0 },
    "afternoon": { "name": "...", "description": "...", "location": "...", "estimatedCost": 0 },
    "evening": { "name": "...", "description": "...", "location": "...", "estimatedCost": 0 },
    "lodging": { "name": "Hotel Name", "description": "Brief.", "location": "Neighborhood", "estimatedCost": 150 },
    "estimatedCost": 0
  }]
}

Be specific — real restaurant names, real hotel names, real attractions, real neighborhoods. For lodging, recommend a specific hotel or Airbnb area for each night.

If arrival time is provided, adjust Day 1 accordingly — skip morning/afternoon activities if arriving late. Use "Arrive & check in" as the activity for time slots before the traveler arrives.
If departure time is provided, adjust the last day accordingly — skip afternoon/evening activities if departing early. Use "Check out & depart" as the activity for time slots after departure.`;

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

function extractJSON(raw: string): Record<string, unknown> {
  let text = raw.trim();

  // Strip markdown code fences
  text = text.replace(/^```[\w]*\s*\n?/, "").replace(/\n?\s*```\s*$/, "").trim();

  // Try direct parse
  try {
    return JSON.parse(text);
  } catch (e) {
    logger.warn("Direct parse failed:", (e as Error).message);
  }

  // Extract between first { and last }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const extracted = text.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(extracted);
    } catch (e) {
      logger.warn("Extracted parse failed:", (e as Error).message);

      // Fix trailing commas
      const cleaned = extracted
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");
      try {
        return JSON.parse(cleaned);
      } catch (e2) {
        logger.warn("Cleaned parse failed:", (e2 as Error).message);
        // Log the area around the error position
        const match = (e as Error).message.match(/position (\d+)/);
        if (match) {
          const pos = parseInt(match[1]);
          logger.error(`JSON error at position ${pos}. Context: ...${extracted.substring(Math.max(0, pos - 50), pos + 50)}...`);
        }
        // Log last 200 chars to see if truncated
        logger.error("Last 200 chars of response:", extracted.substring(extracted.length - 200));
      }
    }
  }

  throw new Error(`Could not parse JSON. Raw length: ${raw.length}. Last 100 chars: ${raw.substring(raw.length - 100)}`);
}

export async function generateItinerary(params: GenerateParams): Promise<Record<string, unknown>> {
  const model = "claude-haiku-4-5-20251001";

  const tierInstructions = {
    free: "Activity name and location only. Very concise.",
    basic: "Brief descriptions and estimated costs.",
    enhanced: "Brief descriptions, costs, and specific venue recommendations.",
  };

  const userPrompt = `Plan a ${params.days}-day trip to ${params.destination}.
Budget: $${params.budgetPerDay}/day per person
Travelers: ${params.travelers} (${params.travelerType})
Preferences: ${JSON.stringify(params.preferences)}
Dates: ${params.startDate} to ${params.endDate}

${tierInstructions[params.tier]}

Respond with ONLY valid JSON. Start with { end with }. No markdown fences. No other text.`;

  logger.info("Calling Claude API...");
  const message = await anthropic.messages.create({
    model,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  const stopReason = message.stop_reason;

  logger.info(`Claude response: ${rawText.length} chars, stop_reason=${stopReason}`);

  // Haiku 4.5 pricing: $1/M input tokens, $5/M output tokens
  const { input_tokens, output_tokens } = message.usage;
  const costUsd = (input_tokens * 1 + output_tokens * 5) / 1_000_000;
  logger.info(
    `Token usage: ${input_tokens} in, ${output_tokens} out, $${costUsd.toFixed(5)} (tier=${params.tier})`
  );

  if (stopReason === "max_tokens") {
    logger.error("Response truncated by max_tokens! Last 100 chars:", rawText.substring(rawText.length - 100));
  }

  if (!rawText) {
    throw new Error("AI returned empty response");
  }

  // If response was truncated, try to close the JSON
  let textToparse = rawText;
  if (stopReason === "max_tokens") {
    // Count open braces and brackets to close them
    let openBraces = 0;
    let openBrackets = 0;
    for (const ch of textToparse) {
      if (ch === "{") openBraces++;
      if (ch === "}") openBraces--;
      if (ch === "[") openBrackets++;
      if (ch === "]") openBrackets--;
    }
    // Close unclosed structures
    let suffix = "";
    for (let i = 0; i < openBrackets; i++) suffix += "}]";
    for (let i = 0; i < openBraces - openBrackets; i++) suffix += "}";
    if (suffix) {
      textToparse = textToparse + suffix;
      logger.info(`Added closing suffix: ${suffix}`);
    }
  }

  return extractJSON(textToparse);
}
