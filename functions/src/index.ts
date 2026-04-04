import * as admin from "firebase-admin";

admin.initializeApp();

// Itinerary generation
export { generateItineraryFn as generateItinerary } from "./itinerary/generate";

// Auth triggers
export { onUserCreate } from "./auth/onCreate";
