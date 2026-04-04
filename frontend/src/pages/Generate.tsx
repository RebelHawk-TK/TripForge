import { useState } from "react";
import { useSearchParams } from "react-router-dom";
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

const ACTIVITY_OPTIONS = [
  { id: "adventure", label: "Adventure & Outdoors", icon: "\u26F0\uFE0F", desc: "Hiking, zip-lining, water sports" },
  { id: "culture", label: "Museums & Culture", icon: "\uD83C\uDFDB\uFE0F", desc: "Art, history, galleries, architecture" },
  { id: "dining", label: "Food & Dining", icon: "\uD83C\uDF7D\uFE0F", desc: "Local cuisine, fine dining, food tours" },
  { id: "relaxation", label: "Relaxation & Wellness", icon: "\uD83E\uDDD8", desc: "Spas, beaches, slow pace, yoga" },
  { id: "nightlife", label: "Nightlife & Entertainment", icon: "\uD83C\uDF1F", desc: "Bars, live music, shows, clubs" },
  { id: "shopping", label: "Shopping & Markets", icon: "\uD83D\uDECD\uFE0F", desc: "Local markets, boutiques, souvenirs" },
  { id: "photography", label: "Photography & Scenic", icon: "\uD83D\uDCF7", desc: "Viewpoints, iconic landmarks, sunsets" },
  { id: "family", label: "Kid-Friendly Activities", icon: "\uD83C\uDFA0", desc: "Theme parks, zoos, interactive museums" },
  { id: "history", label: "Historical Sites", icon: "\uD83C\uDFF0", desc: "Ruins, monuments, walking tours" },
  { id: "nature", label: "Nature & Wildlife", icon: "\uD83C\uDF3F", desc: "National parks, safaris, botanical gardens" },
  { id: "sports", label: "Sports & Recreation", icon: "\u26BD", desc: "Golf, surfing, cycling, local games" },
  { id: "local", label: "Off the Beaten Path", icon: "\uD83D\uDDFA\uFE0F", desc: "Neighborhoods locals love, hidden gems" },
];

const PACE_OPTIONS = [
  { id: "packed", label: "Packed schedule", desc: "See as much as possible" },
  { id: "moderate", label: "Moderate pace", desc: "Mix of activities and downtime" },
  { id: "relaxed", label: "Relaxed & slow", desc: "No rushing, plenty of free time" },
];

const VIBE_OPTIONS = [
  { id: "boutique", label: "Boutique & Local", icon: "\u2728", desc: "Independent hotels, local restaurants, unique character" },
  { id: "chain", label: "Trusted Chains", icon: "\uD83C\uDFE8", desc: "Marriott, Hilton, familiar restaurants, consistent quality" },
  { id: "mix", label: "Mix of Both", icon: "\uD83D\uDD00", desc: "Chains for hotels, local spots for dining" },
];

export default function Generate() {
  const { user, signInWithGoogle } = useAuth();
  const { generate } = useItinerary();
  const [searchParams] = useSearchParams();

  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState(150);
  const [travelers, setTravelers] = useState(2);
  const [travelerType, setTravelerType] = useState("couple");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activities, setActivities] = useState<string[]>([]);
  const [pace, setPace] = useState("moderate");
  const [vibe, setVibe] = useState("mix");
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ItineraryResult | null>(null);

  const toggleActivity = (id: string) => {
    setActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

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
      const selectedActivities = ACTIVITY_OPTIONS
        .filter((a) => activities.includes(a.id))
        .map((a) => a.label);
      const selectedPace = PACE_OPTIONS.find((p) => p.id === pace)?.label || "Moderate pace";
      const selectedVibe = VIBE_OPTIONS.find((v) => v.id === vibe)?.label || "Mix of Both";

      const data = await generate({
        destination,
        days,
        budgetPerDay: budget,
        travelers,
        travelerType,
        startDate,
        endDate,
        preferences: {
          activities: selectedActivities,
          pace: selectedPace,
          accommodationStyle: selectedVibe,
          specialRequests: specialRequests || undefined,
        },
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
    <div className="container" style={{ padding: "40px 24px", maxWidth: 700 }}>
      <h1 style={{ fontFamily: "var(--heading)", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
        Plan your trip
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
        Tell us what you love and we'll build a day-by-day itinerary around your interests.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Destination */}
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

        {/* Dates */}
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

        {/* Trip details */}
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

        {/* Travel style */}
        <div>
          <label htmlFor="travelerType">Who's going?</label>
          <select
            id="travelerType"
            value={travelerType}
            onChange={(e) => setTravelerType(e.target.value)}
          >
            <option value="solo">Solo traveler</option>
            <option value="couple">Couple</option>
            <option value="family">Family with kids</option>
            <option value="group">Group of friends</option>
          </select>
        </div>

        {/* Activities — the main new section */}
        <div>
          <label style={{ marginBottom: 12 }}>
            What do you want to do? <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>(select all that apply)</span>
          </label>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 10,
          }}>
            {ACTIVITY_OPTIONS.map((activity) => {
              const selected = activities.includes(activity.id);
              return (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => toggleActivity(activity.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: "var(--radius)",
                    border: selected ? "2px solid var(--teal)" : "1px solid var(--border)",
                    background: selected ? "var(--teal-light)" : "var(--white)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{activity.icon}</span>
                  <div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: selected ? "var(--teal)" : "var(--brown)",
                    }}>
                      {activity.label}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                      {activity.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pace */}
        <div>
          <label style={{ marginBottom: 12 }}>Trip pace</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {PACE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPace(option.id)}
                style={{
                  flex: "1 1 180px",
                  padding: "12px 16px",
                  borderRadius: "var(--radius)",
                  border: pace === option.id ? "2px solid var(--gold)" : "1px solid var(--border)",
                  background: pace === option.id ? "var(--gold-light)" : "var(--white)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: pace === option.id ? "var(--gold-hover)" : "var(--brown)",
                }}>
                  {option.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                  {option.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Hotels & dining vibe */}
        <div>
          <label style={{ marginBottom: 12 }}>Hotels & restaurants</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {VIBE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setVibe(option.id)}
                style={{
                  flex: "1 1 180px",
                  padding: "12px 16px",
                  borderRadius: "var(--radius)",
                  border: vibe === option.id ? "2px solid var(--teal)" : "1px solid var(--border)",
                  background: vibe === option.id ? "var(--teal-light)" : "var(--white)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: vibe === option.id ? "var(--teal)" : "var(--brown)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  <span>{option.icon}</span> {option.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                  {option.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Special requests */}
        <div>
          <label htmlFor="specialRequests">
            Anything else? <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>(optional)</span>
          </label>
          <textarea
            id="specialRequests"
            placeholder="Dietary restrictions, accessibility needs, must-see spots, things to avoid..."
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={3}
            style={{ resize: "vertical" }}
          />
        </div>

        {/* Selected summary */}
        {activities.length > 0 && (
          <div style={{
            padding: "14px 16px",
            background: "var(--teal-light)",
            borderRadius: "var(--radius)",
            fontSize: 14,
            color: "var(--teal)",
          }}>
            Your trip will focus on: {ACTIVITY_OPTIONS
              .filter((a) => activities.includes(a.id))
              .map((a) => a.label)
              .join(", ")}
          </div>
        )}

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
            "Generate My Itinerary"
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
