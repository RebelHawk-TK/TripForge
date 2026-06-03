import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { generateItinerary } from "../utils/anthropic";
import { checkRateLimit } from "../utils/rateLimit";
import * as logger from "firebase-functions/logger";
import { isAdminEmail } from "../admin/auth";

export const generateItineraryFn = onCall(
  { maxInstances: 10, timeoutSeconds: 120, secrets: ["ANTHROPIC_API_KEY"] },
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

    // Get or create user doc + approval gate
    const db = admin.firestore();
    const email = request.auth.token.email || "";
    const userIsAdmin = isAdminEmail(email);
    let tier: "free" | "basic" | "enhanced" = "free";

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
          throw new HttpsError(
            "permission-denied",
            "Thanks for signing up! Your account is pending approval — you'll be able to generate itineraries once it's approved."
          );
        }
      } else {
        const data = userDoc.data();
        tier = (data?.tier || "free") as typeof tier;
        if (!userIsAdmin && data?.approved !== true) {
          // Backfill the field so the user appears in the admin approval list.
          if (data?.approved === undefined) {
            await userRef.update({ approved: false });
          }
          throw new HttpsError(
            "permission-denied",
            "Your account is pending approval — you'll be able to generate itineraries once it's approved."
          );
        }
      }
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      logger.error("Firestore user doc error:", err);
      throw new HttpsError(
        "internal",
        "Couldn't access your account. Please try again."
      );
    }

    // Rate limit free tier
    if (tier === "free") {
      try {
        const allowed = await checkRateLimit(uid);
        if (!allowed) {
          throw new HttpsError(
            "resource-exhausted",
            "Free tier limit reached (3/day). Upgrade for unlimited itineraries."
          );
        }
      } catch (err) {
        if (err instanceof HttpsError) throw err;
        // Fail closed: if we can't verify the daily limit, don't generate (and don't spend on the API).
        logger.error("Rate limit check error:", err);
        throw new HttpsError(
          "unavailable",
          "Couldn't verify your daily limit right now. Please try again in a moment."
        );
      }
    }

    // Generate via Claude
    let result: Record<string, unknown>;
    try {
      logger.info(`Generating itinerary: ${destination}, ${days} days, tier=${tier}`);
      result = await generateItinerary({
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
    } catch (err) {
      logger.error("Itinerary generation failed:", err);
      const message = err instanceof Error ? err.message : String(err);

      if (message.includes("Could not parse JSON")) {
        throw new HttpsError(
          "internal",
          "Our AI generated an unusual response. Please try again — it usually works on the second attempt."
        );
      }
      if (message.includes("rate_limit") || message.includes("overloaded")) {
        throw new HttpsError(
          "unavailable",
          "Our AI is temporarily busy. Please try again in a moment."
        );
      }
      throw new HttpsError(
        "internal",
        "Something went wrong generating your itinerary. Please try again."
      );
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
    } catch (err) {
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
  }
);
