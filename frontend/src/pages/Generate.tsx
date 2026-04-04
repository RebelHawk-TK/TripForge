import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useItinerary } from "../hooks/useItinerary";
import ItineraryDisplay from "../components/ItineraryDisplay";

interface ItineraryResult {
  id: string;
  destination: string;
  days: Array<{
    dayNumber: number;
    date: string;
    morning: { name: string; description?: string; location: string; estimatedCost?: number };
    afternoon: { name: string; description?: string; location: string; estimatedCost?: number };
    evening: { name: string; description?: string; location: string; estimatedCost?: number };
    estimatedCost?: number;
  }>;
}

export default function Generate() {
  const { user, signInWithGoogle } = useAuth();
  const { generate } = useItinerary();

  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState(150);
  const [travelers, setTravelers] = useState(2);
  const [travelerType, setTravelerType] = useState("couple");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ItineraryResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      await signInWithGoogle();
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await generate({
        destination,
        days,
        budgetPerDay: budget,
        travelers,
        travelerType,
        startDate,
        endDate,
      });
      setResult(data as ItineraryResult);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="container" style={{ padding: "40px 24px" }}>
        <button
          className="btn btn-secondary"
          onClick={() => setResult(null)}
          style={{ marginBottom: 24 }}
        >
          &larr; Plan another trip
        </button>
        <ItineraryDisplay itinerary={result} />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: 640 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
        Plan your trip
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
        Tell us where you're going and we'll build a day-by-day itinerary in seconds.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label htmlFor="destination">Where are you going?</label>
          <input
            id="destination"
            type="text"
            placeholder="Paris, Tokyo, Asheville..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label htmlFor="startDate">Start date</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="endDate">End date</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div>
            <label htmlFor="days">Days</label>
            <input
              id="days"
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="budget">$/day per person</label>
            <input
              id="budget"
              type="number"
              min={10}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="travelers">Travelers</label>
            <input
              id="travelers"
              type="number"
              min={1}
              max={20}
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label htmlFor="travelerType">Travel style</label>
          <select
            id="travelerType"
            value={travelerType}
            onChange={(e) => setTravelerType(e.target.value)}
          >
            <option value="solo">Solo</option>
            <option value="couple">Couple</option>
            <option value="family">Family</option>
            <option value="group">Group of friends</option>
          </select>
        </div>

        {error && (
          <div style={{
            padding: "12px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "var(--radius)",
            color: "var(--error)",
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-large"
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Building your itinerary...
            </>
          ) : user ? (
            "Generate Itinerary"
          ) : (
            "Sign in to Generate"
          )}
        </button>

        {!user && (
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
            Free account required. 3 itineraries per day on the free tier.
          </p>
        )}
      </form>
    </div>
  );
}
