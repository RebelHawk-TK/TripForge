import * as admin from "firebase-admin";

admin.initializeApp();

// Itinerary generation (also handles first-time user creation)
export { generateItineraryFn as generateItinerary } from "./itinerary/generate";

// Admin: user approval dashboard
export { listUsersFn as listUsers, setUserApprovalFn as setUserApproval } from "./admin/users";
