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
const auth_1 = require("../admin/auth");
exports.generateItineraryFn = (0, https_1.onCall)({ maxInstances: 10, timeoutSeconds: 120, secrets: ["ANTHROPIC_API_KEY"] }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be signed in.");
    }
    const uid = request.auth.uid;
    const { destination, days, budgetPerDay, travelers, travelerType, preferences, startDate, endDate, } = request.data;
    if (!destination || !days || !startDate || !endDate) {
        throw new https_1.HttpsError("invalid-argument", "destination, days, startDate, and endDate are required.");
    }
    // Get or create user doc + approval gate
    const db = admin.firestore();
    const email = request.auth.token.email || "";
    const userIsAdmin = (0, auth_1.isAdminEmail)(email);
    let tier = "free";
    try {
        const userRef = db.doc(`users/${uid}`);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            // New sign-ups are pending until an admin approves them (admins auto-approved).
            await userRef.set({
                email,
                name: request.auth.token.name || "",
                tier: "free",
                approved: userIsAdmin,
                preferences: {},
                dailyItineraryCount: 0,
                dailyCountResetAt: admin.firestore.Timestamp.now(),
                createdAt: admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now(),
            });
            if (!userIsAdmin) {
                throw new https_1.HttpsError("permission-denied", "Thanks for signing up! Your account is pending approval — you'll be able to generate itineraries once it's approved.");
            }
        }
        else {
            const data = userDoc.data();
            tier = (data?.tier || "free");
            if (!userIsAdmin && data?.approved !== true) {
                // Backfill the field so the user appears in the admin approval list.
                if (data?.approved === undefined) {
                    await userRef.update({ approved: false });
                }
                throw new https_1.HttpsError("permission-denied", "Your account is pending approval — you'll be able to generate itineraries once it's approved.");
            }
        }
    }
    catch (err) {
        if (err instanceof https_1.HttpsError)
            throw err;
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
            // Fail closed: if we can't verify the daily limit, don't generate (and don't spend on the API).
            logger.error("Rate limit check error:", err);
            throw new https_1.HttpsError("unavailable", "Couldn't verify your daily limit right now. Please try again in a moment.");
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