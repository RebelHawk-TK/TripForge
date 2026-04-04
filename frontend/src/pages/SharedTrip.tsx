import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ItineraryDisplay from "../components/ItineraryDisplay";

export default function SharedTrip() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, _setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tripId) return;

    // Try to find the trip — for MVP, shared trips use a known format
    // In production, this would use a share token + Cloud Function
    const loadTrip = async () => {
      try {
        // Placeholder: shared trips would be served by a Cloud Function
        // that looks up the share token and returns the itinerary without auth
        setError("This trip link requires the sharing feature to be deployed. Coming soon!");
      } catch {
        setError("Trip not found.");
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [tripId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <span className="spinner" style={{
          borderColor: "var(--border)",
          borderTopColor: "var(--teal)",
          width: 32,
          height: 32,
        }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, marginBottom: 12 }}>
          Shared Trip
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>{error}</p>
        <Link to="/generate" className="btn btn-primary btn-large">
          Plan Your Own Trip
        </Link>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <div style={{
        background: "var(--teal-light)",
        padding: "12px 16px",
        borderRadius: "var(--radius)",
        marginBottom: 24,
        fontSize: 14,
        color: "var(--teal)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span>Someone shared this trip with you</span>
        <Link to="/generate" className="btn btn-teal" style={{ padding: "6px 14px", fontSize: 13 }}>
          Plan Your Own
        </Link>
      </div>
      <ItineraryDisplay itinerary={trip} />
    </div>
  );
}
