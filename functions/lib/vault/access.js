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
exports.isAllowed = isAllowed;
exports.readCookie = readCookie;
const admin = __importStar(require("firebase-admin"));
const auth_1 = require("../admin/auth");
/**
 * Shared authorization check for the private travel-doc vault.
 * Allowed = an admin email, OR a user whose `users/{uid}` doc is approved.
 * Mirrors the approval gate used by generateItinerary.
 */
async function isAllowed(uid, email) {
    if ((0, auth_1.isAdminEmail)(email))
        return true;
    const doc = await admin.firestore().doc(`users/${uid}`).get();
    return doc.exists && doc.data()?.approved === true;
}
/** Parse a single cookie value out of a raw Cookie header. */
function readCookie(cookieHeader, name) {
    if (!cookieHeader)
        return null;
    for (const part of cookieHeader.split(";")) {
        const idx = part.indexOf("=");
        if (idx === -1)
            continue;
        if (part.slice(0, idx).trim() === name) {
            return decodeURIComponent(part.slice(idx + 1).trim());
        }
    }
    return null;
}
//# sourceMappingURL=access.js.map