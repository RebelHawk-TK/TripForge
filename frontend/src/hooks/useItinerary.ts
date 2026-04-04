import { httpsCallable } from "firebase/functions";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { functions, db } from "../firebase";
import { useAuth } from "./useAuth";

interface GenerateParams {
  destination: string;
  days: number;
  budgetPerDay?: number;
  travelers?: number;
  travelerType?: string;
  preferences?: Record<string, unknown>;
  startDate: string;
  endDate: string;
}

export function useItinerary() {
  const { user } = useAuth();

  const generate = async (params: GenerateParams) => {
    const fn = httpsCallable(functions, "generateItinerary");
    const result = await fn(params);
    return result.data;
  };

  const listTrips = async () => {
    if (!user) return [];
    const q = query(
      collection(db, `users/${user.uid}/itineraries`),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  return { generate, listTrips };
}
