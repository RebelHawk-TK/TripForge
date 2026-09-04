import * as admin from "firebase-admin";
import { isAdminEmail } from "../admin/auth";

/**
 * Shared authorization check for the private travel-doc vault.
 * Allowed = an admin email, OR a user whose `users/{uid}` doc is approved.
 * Mirrors the approval gate used by generateItinerary.
 */
export async function isAllowed(
  uid: string,
  email: string | null | undefined
): Promise<boolean> {
  if (isAdminEmail(email)) return true;
  const doc = await admin.firestore().doc(`users/${uid}`).get();
  return doc.exists && doc.data()?.approved === true;
}

/** Parse a single cookie value out of a raw Cookie header. */
export function readCookie(
  cookieHeader: string | undefined,
  name: string
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}
