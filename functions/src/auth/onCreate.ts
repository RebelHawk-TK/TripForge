import { beforeUserCreated } from "firebase-functions/v2/identity";
import * as admin from "firebase-admin";

/**
 * Initialize a user document in Firestore when a new account is created.
 */
export const onUserCreate = beforeUserCreated(async (event) => {
  const user = event.data;
  if (!user) return;

  await admin.firestore().doc(`users/${user.uid}`).set({
    email: user.email || "",
    name: user.displayName || "",
    tier: "free",
    preferences: {},
    dailyItineraryCount: 0,
    dailyCountResetAt: admin.firestore.Timestamp.now(),
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  });
});
