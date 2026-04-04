import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useItinerary } from "../hooks/useItinerary";

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  tierGenerated: string;
  createdAt: { seconds: number };
}

export default function MyTrips() {
  const { user, signInWithGoogle } = useAuth();
  const { listTrips } = useItinerary();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

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
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>My Trips</h1>
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
        <span className="spinner" style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)", width: 32, height: 32 }} />
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>My Trips</h1>
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
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>My Trips</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {trips.map((trip) => (
          <div
            key={trip.id}
            style={{
              padding: "16px 20px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{trip.destination}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                {trip.startDate} to {trip.endDate}
                <span style={{
                  marginLeft: 8,
                  padding: "2px 8px",
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                }}>
                  {trip.tierGenerated}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {new Date(trip.createdAt.seconds * 1000).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
