import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { generateItinerary } from "../utils/anthropic";
import { checkRateLimit } from "../utils/rateLimit";

export const generateItineraryFn = onCall(
  { maxInstances: 10, timeoutSeconds: 60, secrets: ["ANTHROPIC_API_KEY"] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in.");
    }

    const uid = request.auth.uid;
    const {
      destination,
      days,
      budgetPerDay,
      travelers,
      travelerType,
      preferences,
      startDate,
      endDate,
    } = request.data;

    if (!destination || !days || !startDate || !endDate) {
      throw new HttpsError(
        "invalid-argument",
        "destination, days, startDate, and endDate are required."
      );
    }

    // Get or create user doc
    const db = admin.firestore();
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
    const tier = (userDoc.data()?.tier || "free") as
      | "free"
      | "basic"
      | "enhanced";

    // Rate limit free tier
    if (tier === "free") {
      const allowed = await checkRateLimit(uid);
      if (!allowed) {
        throw new HttpsError(
          "resource-exhausted",
          "Free tier limit reached (3/day). Upgrade for unlimited itineraries."
        );
      }
    }

    // Generate via Claude
    const result = await generateItinerary({
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

    // Save to Firestore
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
);
