import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { isAllowed, readCookie } from "./access";

const COOKIE_NAME = "__session";
const VAULT_PREFIX = "vault/";

// Shown when the caller has no valid session — points them at the sign-in page.
function needSignInHtml(): string {
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
export const serveVaultDocFn = onRequest(
  { region: "us-central1" },
  async (req, res) => {
    const sessionCookie = readCookie(req.headers.cookie, COOKIE_NAME);
    if (!sessionCookie) {
      res.status(401).type("html").send(needSignInHtml());
      return;
    }

    let decoded;
    try {
      decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    } catch {
      res.status(401).type("html").send(needSignInHtml());
      return;
    }

    if (!(await isAllowed(decoded.uid, decoded.email))) {
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
      res.setHeader(
        "Content-Type",
        meta.contentType || "application/octet-stream"
      );
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("X-Robots-Tag", "noindex");
      file
        .createReadStream()
        .on("error", (err) => {
          logger.error("vault stream error", err);
          if (!res.headersSent) res.status(500).end();
        })
        .pipe(res);
    } catch (err) {
      logger.error("serveVaultDoc failed", err);
      res.status(500).send("Server error");
    }
  }
);
