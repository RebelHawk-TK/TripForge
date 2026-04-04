"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateItinerary = generateItinerary;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const logger = __importStar(require("firebase-functions/logger"));
const anthropic = new sdk_1.default();
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
    "estimatedCost": 0
  }]
}

Be specific — real restaurant names, real attractions, real neighborhoods.`;
function extractJSON(raw) {
    let text = raw.trim();
    // Strip markdown code fences
    text = text.replace(/^```[\w]*\s*\n?/, "").replace(/\n?\s*```\s*$/, "").trim();
    // Try direct parse
    try {
        return JSON.parse(text);
    }
    catch (e) {
        logger.warn("Direct parse failed:", e.message);
    }
    // Extract between first { and last }
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        const extracted = text.substring(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(extracted);
        }
        catch (e) {
            logger.warn("Extracted parse failed:", e.message);
            // Fix trailing commas
            const cleaned = extracted
                .replace(/,\s*}/g, "}")
                .replace(/,\s*]/g, "]");
            try {
                return JSON.parse(cleaned);
            }
            catch (e2) {
                logger.warn("Cleaned parse failed:", e2.message);
                // Log the area around the error position
                const match = e.message.match(/position (\d+)/);
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
async function generateItinerary(params) {
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
            if (ch === "{")
                openBraces++;
            if (ch === "}")
                openBraces--;
            if (ch === "[")
                openBrackets++;
            if (ch === "]")
                openBrackets--;
        }
        // Close unclosed structures
        let suffix = "";
        for (let i = 0; i < openBrackets; i++)
            suffix += "}]";
        for (let i = 0; i < openBraces - openBrackets; i++)
            suffix += "}";
        if (suffix) {
            textToparse = textToparse + suffix;
            logger.info(`Added closing suffix: ${suffix}`);
        }
    }
    return extractJSON(textToparse);
}
//# sourceMappingURL=anthropic.js.map