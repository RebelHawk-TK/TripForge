import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { assertAdmin, isAdminEmail } from "./auth";

// List all users (admin only) — powers the approval dashboard.
export const listUsersFn = onCall(async (request) => {
  assertAdmin(request);
  const db = admin.firestore();
  const snap = await db.collection("users").limit(500).get();
  const users = snap.docs.map((d) => {
    const u = d.data();
    return {
      uid: d.id,
      email: u.email || "",
      name: u.name || "",
      approved: u.approved === true || isAdminEmail(u.email),
      denied: u.denied === true,
      tier: u.tier || "free",
      createdAt: u.createdAt?.toDate?.()?.toISOString() || null,
    };
  });
  return { users };
});

// Approve or revoke a user (admin only).
export const setUserApprovalFn = onCall(async (request) => {
  const adminEmail = assertAdmin(request);
  const { uid, approved, denied } = request.data || {};
  if (typeof uid !== "string" || typeof approved !== "boolean") {
    throw new HttpsError(
      "invalid-argument",
      "uid (string) and approved (boolean) are required."
    );
  }
  // Reject = explicitly denied (drops out of the pending list). Approving always clears denial.
  const isDenied = approved ? false : denied === true;
  const db = admin.firestore();
  await db.doc(`users/${uid}`).update({
    approved,
    denied: isDenied,
    approvedAt: admin.firestore.Timestamp.now(),
    approvedBy: adminEmail,
  });
  return { uid, approved, denied: isDenied };
});
