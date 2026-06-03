"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADMIN_EMAILS = void 0;
exports.isAdminEmail = isAdminEmail;
exports.assertAdmin = assertAdmin;
const https_1 = require("firebase-functions/v2/https");
// Accounts allowed to approve users and access the admin dashboard.
exports.ADMIN_EMAILS = ["tom@brigitteandtom.com"];
function isAdminEmail(email) {
    return !!email && exports.ADMIN_EMAILS.includes(email);
}
function assertAdmin(request) {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be signed in.");
    }
    const email = request.auth.token.email || "";
    if (!isAdminEmail(email)) {
        throw new https_1.HttpsError("permission-denied", "Admin access required.");
    }
    return email;
}
//# sourceMappingURL=auth.js.map