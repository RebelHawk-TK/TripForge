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
exports.serveVaultDocFn = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const logger = __importStar(require("firebase-functions/logger"));
const access_1 = require("./access");
const COOKIE_NAME = "__session";
const VAULT_PREFIX = "vault/";
// Shown when the caller has no valid session — points them at the sign-in page.
function needSignInHtml() {
    return `<!doctype html><html><head><meta charset="utf-8">
<meta name="robots" content="noindex"><title>Sign in required</title>
<style>body{font-family:system-ui,sans-serif;max-width:32rem;margin:12vh auto;padding:0 1.5rem;color:#2b2b2b;line-height:1.5}
a{color:#0f766e}</style></head><body>
<h1>Sign in required</h1>
<p>This document is private. Please <a href="/library">sign in on the vault page</a>,
then reopen this link.</p></body></html>`;
}
/**
 * GET /vault/<path> — serves a private document only to a signed-in, approved
 * user. Verifies the __session cookie, checks approval, then streams the file
 * from the private `vault/` prefix of the default Storage bucket. The bytes
 * never leave Storage without passing this gate (Storage rules deny all client
 * access to vault/**).
 */
exports.serveVaultDocFn = (0, https_1.onRequest)({ region: "us-central1" }, async (req, res) => {
    const sessionCookie = (0, access_1.readCookie)(req.headers.cookie, COOKIE_NAME);
    if (!sessionCookie) {
        res.status(401).type("html").send(needSignInHtml());
        return;
    }
    let decoded;
    try {
        decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    }
    catch {
        res.status(401).type("html").send(needSignInHtml());
        return;
    }
    if (!(await (0, access_1.isAllowed)(decoded.uid, decoded.email))) {
        res.status(403).type("html").send("<h1>Not authorized</h1>");
        return;
    }
    // Resolve the requested path, stripping the /vault/ prefix. Reject traversal.
    const rawPath = decodeURIComponent(req.path || "").replace(/^\/+/, "");
    const rel = rawPath.startsWith(VAULT_PREFIX)
        ? rawPath.slice(VAULT_PREFIX.length)
        : rawPath;
    if (!rel || rel.includes("..") || rel.endsWith("/")) {
        res.status(400).send("Bad request");
        return;
    }
    try {
        const file = admin.storage().bucket().file(VAULT_PREFIX + rel);
        const [exists] = await file.exists();
        if (!exists) {
            res.status(404).type("html").send("<h1>Not found</h1>");
            return;
        }
        const [meta] = await file.getMetadata();
        res.setHeader("Content-Type", meta.contentType || "application/octet-stream");
        res.setHeader("Cache-Control", "private, no-store");
        res.setHeader("X-Robots-Tag", "noindex");
        file
            .createReadStream()
            .on("error", (err) => {
            logger.error("vault stream error", err);
            if (!res.headersSent)
                res.status(500).end();
        })
            .pipe(res);
    }
    catch (err) {
        logger.error("serveVaultDoc failed", err);
        res.status(500).send("Server error");
    }
});
//# sourceMappingURL=serve.js.map