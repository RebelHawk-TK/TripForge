import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useItinerary } from "../hooks/useItinerary";
import ItineraryDisplay from "../components/ItineraryDisplay";

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  tierGenerated: string;
  days: unknown[];
  createdAt: { seconds: number };
}

function titleCase(str: string) {
  return str.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

export default function MyTrips() {
  const { user, signInWithGoogle } = useAuth();
  const { listTrips } = useItinerary();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    listTrips().then((data) => {
      setTrips(data as Trip[]);
      setLoading(false);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, fontWeight: 700, marginBottom: 12 }}>My Trips</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
          Sign in to see your saved itineraries.
        </p>
        <button className="btn btn-primary btn-large" onClick={signInWithGoogle}>
          Sign In with Google
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <span className="spinner" style={{ borderColor: "var(--border)", borderTopColor: "var(--teal)", width: 32, height: 32 }} />
      </div>
    );
  }

  if (selectedTrip) {
    return (
      <div className="container" style={{ padding: "40px 24px" }}>
        <button
          className="btn btn-secondary"
          onClick={() => { setSelectedTrip(null); window.scrollTo(0, 0); }}
          style={{ marginBottom: 24 }}
        >
          &larr; Back to My Trips
        </button>
        <ItineraryDisplay itinerary={{
          id: selectedTrip.id,
          destination: selectedTrip.destination,
          days: selectedTrip.days as any,
        }} />
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, fontWeight: 700, marginBottom: 12 }}>My Trips</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
          No trips yet. Plan your first one!
        </p>
        <Link to="/generate" className="btn btn-primary btn-large">
          Plan a Trip
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: 800 }}>
      <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, fontWeight: 700, marginBottom: 24 }}>My Trips</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {trips.map((trip) => (
          <div
            key={trip.id}
            onClick={() => { setSelectedTrip(trip); window.scrollTo(0, 0); }}
            style={{
              padding: "16px 20px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              background: "var(--white)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow)";
              e.currentTarget.style.borderColor = "var(--teal)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, color: "var(--brown)" }}>
                {titleCase(trip.destination)}
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                {trip.startDate} to {trip.endDate}
                <span style={{
                  marginLeft: 8,
                  padding: "2px 8px",
                  background: "var(--teal-light)",
                  color: "var(--teal)",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                }}>
                  {trip.tierGenerated}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {new Date(trip.createdAt.seconds * 1000).toLocaleDateString()}
              </div>
              <span style={{ color: "var(--text-secondary)", fontSize: 18 }}>&rsaquo;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
