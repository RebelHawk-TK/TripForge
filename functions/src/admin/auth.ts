import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";

// Accounts allowed to approve users and access the admin dashboard.
export const ADMIN_EMAILS = ["tom@brigitteandtom.com"];

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}

export function assertAdmin(request: CallableRequest): string {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be signed in.");
  }
  const email = request.auth.token.email || "";
  if (!isAdminEmail(email)) {
    throw new HttpsError("permission-denied", "Admin access required.");
  }
  return email;
}
