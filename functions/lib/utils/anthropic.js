"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateItinerary = generateItinerary;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const anthropic = new sdk_1.default();
const SYSTEM_PROMPT = `You are a travel planning AI. Generate itineraries as structured JSON.
Each day has: morning, afternoon, evening activities with names, descriptions,
estimated costs, and coordinates. Be specific — real restaurant names, real
attractions, real neighborhoods. Adjust for budget and traveler preferences.

Return ONLY valid JSON (no markdown, no explanation) matching this schema:
{
  "days": [{
    "dayNumber": 1,
    "date": "2026-04-10",
    "morning": { "name": "...", "description": "...", "location": "...", "estimatedCost": 0 },
    "afternoon": { "name": "...", "description": "...", "location": "...", "estimatedCost": 0 },
    "evening": { "name": "...", "description": "...", "location": "...", "estimatedCost": 0 },
    "estimatedCost": 0
  }]
}`;
async function generateItinerary(params) {
    const model = params.tier === "free"
        ? "claude-haiku-4-5-20251001"
        : "claude-sonnet-4-6-20260320";
    const tierInstructions = {
        free: "Single-line items only (activity name + location). No descriptions or costs.",
        basic: "Full descriptions + estimated costs per activity.",
        enhanced: "Full descriptions + costs + specific booking recommendations with venue names and addresses.",
    };
    const message = await anthropic.messages.create({
        model,
        max_tokens: params.tier === "free" ? 1024 : 4096,
        system: SYSTEM_PROMPT,
        messages: [
            {
                role: "user",
                content: `Plan a ${params.days}-day trip to ${params.destination}.
Budget: $${params.budgetPerDay}/day per person
Travelers: ${params.travelers} (${params.travelerType})
Preferences: ${JSON.stringify(params.preferences)}
Dates: ${params.startDate} to ${params.endDate}

${tierInstructions[params.tier]}`,
            },
        ],
    });
    let text = message.content[0].type === "text" ? message.content[0].text : "";
    // Strip markdown code fences if Claude wraps the JSON
    text = text.trim();
    if (text.startsWith("```")) {
        text = text.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }
    return JSON.parse(text);
}
//# sourceMappingURL=anthropic.js.map