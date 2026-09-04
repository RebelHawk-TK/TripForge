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
exports.sessionLogoutFn = exports.sessionLoginFn = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const logger = __importStar(require("firebase-functions/logger"));
const access_1 = require("./access");
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
exports.sessionLoginFn = (0, https_1.onRequest)({ region: "us-central1" }, async (req, res) => {
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
        if (!(await (0, access_1.isAllowed)(decoded.uid, decoded.email))) {
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
    }
    catch (err) {
        logger.warn("sessionLogin failed", err);
        res.status(401).json({ error: "invalid-token" });
    }
});
/** POST /__session/logout — clears the session cookie. */
exports.sessionLogoutFn = (0, https_1.onRequest)({ region: "us-central1" }, async (_req, res) => {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    res.status(200).json({ ok: true });
});
//# sourceMappingURL=session.js.map