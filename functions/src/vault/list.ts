import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { isAllowed } from "./access";

/**
 * listVaultDocs — returns metadata for every private travel doc, for any
 * approved user. The actual file bytes are still gated by serveVaultDoc; this
 * only exposes titles + paths to build the library listing.
 */
export const listVaultDocsFn = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be signed in.");
  }
  if (!(await isAllowed(request.auth.uid, request.auth.token.email))) {
    throw new HttpsError(
      "permission-denied",
      "Your account is pending approval."
    );
  }
  const snap = await admin
    .firestore()
    .collection("vaultDocs")
    .orderBy("createdAt", "desc")
    .get();
  const docs = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title || d.id,
      path: data.storagePath || "",
      contentType: data.contentType || "",
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
    };
  });
  return { docs };
});
