import * as admin from "firebase-admin";

const FREE_TIER_DAILY_LIMIT = 3;

/**
 * Check and increment daily itinerary count for free-tier users.
 * Returns true if the user is allowed to generate, false if rate limited.
 */
export async function checkRateLimit(uid: string): Promise<boolean> {
  const db = admin.firestore();
  const userRef = db.doc(`users/${uid}`);

  return db.runTransaction(async (tx) => {
    const userDoc = await tx.get(userRef);
    if (!userDoc.exists) return false;

    const data = userDoc.data()!;
    if (data.tier !== "free") return true; // paid users have no limit

    const now = new Date();
    const resetAt = data.dailyCountResetAt?.toDate();
    const count = data.dailyItineraryCount || 0;

    // Reset if it's a new day
    if (!resetAt || resetAt.toDateString() !== now.toDateString()) {
      tx.update(userRef, {
        dailyItineraryCount: 1,
        dailyCountResetAt: admin.firestore.Timestamp.now(),
      });
      return true;
    }

    if (count >= FREE_TIER_DAILY_LIMIT) return false;

    tx.update(userRef, {
      dailyItineraryCount: count + 1,
    });
    return true;
  });
}
