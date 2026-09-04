import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { isAllowed } from "./access";

// Firebase Hosting only forwards a cookie named exactly "__session" to
// functions, so the gated vault uses that name for its session cookie.
const COOKIE_NAME = "__session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5; // 5 days

/**
 * POST /__session/login  { idToken }
 * Verifies the caller's Firebase ID token, confirms they're approved, then
 * mints an httpOnly __session cookie so the browser can fetch gated /vault/**
 * docs directly. Same-origin (served under travelforge.ai via a Hosting rewrite).
 */
export const sessionLoginFn = onRequest(
  { region: "us-central1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "method-not-allowed" });
      return;
    }
    const idToken = (req.body && req.body.idToken) || "";
    if (!idToken || typeof idToken !== "string") {
      res.status(400).json({ error: "idToken-required" });
      return;
    }
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      if (!(await isAllowed(decoded.uid, decoded.email))) {
        res.status(403).json({ error: "not-approved" });
        return;
      }
      const sessionCookie = await admin.auth().createSessionCookie(idToken, {
        expiresIn: SESSION_MAX_AGE_MS,
      });
      res.cookie(COOKIE_NAME, sessionCookie, {
        maxAge: SESSION_MAX_AGE_MS,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });
      res.status(200).json({ ok: true });
    } catch (err) {
      logger.warn("sessionLogin failed", err);
      res.status(401).json({ error: "invalid-token" });
    }
  }
);

/** POST /__session/logout — clears the session cookie. */
export const sessionLogoutFn = onRequest(
  { region: "us-central1" },
  async (_req, res) => {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    res.status(200).json({ ok: true });
  }
);
