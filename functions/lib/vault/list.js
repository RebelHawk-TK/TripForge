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
exports.listVaultDocsFn = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const access_1 = require("./access");
/**
 * listVaultDocs — returns metadata for every private travel doc, for any
 * approved user. The actual file bytes are still gated by serveVaultDoc; this
 * only exposes titles + paths to build the library listing.
 */
exports.listVaultDocsFn = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be signed in.");
    }
    if (!(await (0, access_1.isAllowed)(request.auth.uid, request.auth.token.email))) {
        throw new https_1.HttpsError("permission-denied", "Your account is pending approval.");
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
//# sourceMappingURL=list.js.map