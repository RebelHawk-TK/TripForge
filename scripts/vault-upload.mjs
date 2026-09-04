// Upload a private travel document into the gated vault.
//
// Usage (run from the functions/ dir so firebase-admin resolves, and with
// gcloud application-default credentials available):
//   cd functions && node ../scripts/vault-upload.mjs <file> ["Title"] [destName]
//
// - Uploads <file> to gs://<bucket>/vault/<destName>
// - Creates/updates a Firestore vaultDocs/<destName-slug> metadata record
//
// The file is NOT public — it is served only through the serveVaultDoc function.
import { readFileSync } from "node:fs";
import { basename, extname, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// firebase-admin is installed under functions/, so resolve it from there
// rather than from this script's own folder.
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "..", "functions", "package.json"));
const admin = require("firebase-admin");

const PROJECT_ID = "travelforge-app";
const BUCKET = "travelforge-app.firebasestorage.app";

const [, , filePath, titleArg, destArg] = process.argv;
if (!filePath) {
  console.error('Usage: node vault-upload.mjs <file> ["Title"] [destName]');
  process.exit(1);
}

const destName = destArg || basename(filePath);
const title = titleArg || destName;

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".pdf": "application/pdf",
  ".json": "application/json",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};
const contentType =
  CONTENT_TYPES[extname(destName).toLowerCase()] || "application/octet-stream";

admin.initializeApp({ projectId: PROJECT_ID, storageBucket: BUCKET });

const storagePath = `vault/${destName}`;
const bytes = readFileSync(filePath);

const bucket = admin.storage().bucket();
await bucket.file(storagePath).save(bytes, {
  contentType,
  resumable: false,
  metadata: { cacheControl: "private, no-store" },
});

const docId = destName.replace(/[^a-zA-Z0-9._-]/g, "-");
await admin.firestore().collection("vaultDocs").doc(docId).set(
  {
    title,
    storagePath: destName, // path relative to the vault/ prefix
    contentType,
    createdAt: admin.firestore.Timestamp.now(),
    createdBy: "cli",
  },
  { merge: true }
);

console.log(`Uploaded ${filePath}`);
console.log(`  storage : gs://${BUCKET}/${storagePath}`);
console.log(`  link    : https://travelforge.ai/vault/${destName}`);
console.log(`  metadata: vaultDocs/${docId} ("${title}")`);
process.exit(0);
