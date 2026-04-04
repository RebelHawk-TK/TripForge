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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateItineraryFn = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const anthropic_1 = require("../utils/anthropic");
const rateLimit_1 = require("../utils/rateLimit");
const logger = __importStar(require("firebase-functions/logger"));
exports.generateItineraryFn = (0, https_1.onCall)({ maxInstances: 10, timeoutSeconds: 120, secrets: ["ANTHROPIC_API_KEY"] }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be signed in.");
    }
    const uid = request.auth.uid;
    const { destination, days, budgetPerDay, travelers, travelerType, preferences, startDate, endDate, } = request.data;
    if (!destination || !days || !startDate || !endDate) {
        throw new https_1.HttpsError("invalid-argument", "destination, days, startDate, and endDate are required.");
    }
    // Get or create user doc
    const db = admin.firestore();
    let tier = "free";
    try {
        const userRef = db.doc(`users/${uid}`);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            await userRef.set({
                email: request.auth.token.email || "",
                name: request.auth.token.name || "",
                tier: "free",
                preferences: {},
                dailyItineraryCount: 0,
                dailyCountResetAt: admin.firestore.Timestamp.now(),
                createdAt: admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now(),
            });
        }
        else {
            tier = (userDoc.data()?.tier || "free");
        }
    }
    catch (err) {
        logger.error("Firestore user doc error:", err);
        throw new https_1.HttpsError("internal", "Couldn't access your account. Please try again.");
    }
    // Rate limit free tier
    if (tier === "free") {
        try {
            const allowed = await (0, rateLimit_1.checkRateLimit)(uid);
            if (!allowed) {
                throw new https_1.HttpsError("resource-exhausted", "Free tier limit reached (3/day). Upgrade for unlimited itineraries.");
            }
        }
        catch (err) {
            if (err instanceof https_1.HttpsError)
                throw err;
            logger.error("Rate limit check error:", err);
            // Don't block on rate limit errors — let them through
        }
    }
    // Generate via Claude
    let result;
    try {
        logger.info(`Generating itinerary: ${destination}, ${days} days, tier=${tier}`);
        result = await (0, anthropic_1.generateItinerary)({
            destination,
            days,
            budgetPerDay: budgetPerDay || 100,
            travelers: travelers || 1,
            travelerType: travelerType || "solo",
            preferences: preferences || {},
            startDate,
            endDate,
            tier,
        });
        logger.info(`Itinerary generated successfully for ${destination}`);
    }
    catch (err) {
        logger.error("Itinerary generation failed:", err);
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("Could not parse JSON")) {
            throw new https_1.HttpsError("internal", "Our AI generated an unusual response. Please try again — it usually works on the second attempt.");
        }
        if (message.includes("rate_limit") || message.includes("overloaded")) {
            throw new https_1.HttpsError("unavailable", "Our AI is temporarily busy. Please try again in a moment.");
        }
        throw new https_1.HttpsError("internal", "Something went wrong generating your itinerary. Please try again.");
    }
    // Save to Firestore
    try {
        const itineraryRef = db.collection(`users/${uid}/itineraries`).doc();
        const itineraryData = {
            destination,
            startDate,
            endDate,
            budgetPerDay: budgetPerDay || 100,
            travelers: travelers || 1,
            travelerType: travelerType || "solo",
            preferences: preferences || {},
            tierGenerated: tier,
            days: result.days,
            createdAt: admin.firestore.Timestamp.now(),
        };
        await itineraryRef.set(itineraryData);
        return {
            id: itineraryRef.id,
            ...itineraryData,
        };
    }
    catch (err) {
        logger.error("Firestore save error:", err);
        // Return the itinerary even if save fails — don't lose the AI output
        return {
            id: "unsaved",
            destination,
            startDate,
            endDate,
            days: result.days,
            _saveError: "Itinerary generated but couldn't be saved. It won't appear in My Trips.",
        };
    }
});
//# sourceMappingURL=generate.js.map