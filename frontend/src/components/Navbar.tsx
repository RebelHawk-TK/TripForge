import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <nav style={{
      borderBottom: "1px solid var(--border)",
      background: "white",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 60,
      }}>
        <Link to="/" style={{
          fontSize: 20,
          fontWeight: 700,
          color: "var(--text)",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span style={{ fontSize: 24 }}>&#9962;</span>
          TripForge
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link to="/generate" style={{ fontSize: 15, fontWeight: 500 }}>
            Plan a Trip
          </Link>
          {user ? (
            <>
              <Link to="/my-trips" style={{ fontSize: 15, fontWeight: 500 }}>
                My Trips
              </Link>
              <button className="btn btn-secondary" onClick={signOut} style={{ padding: "6px 14px", fontSize: 14 }}>
                Sign Out
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={signInWithGoogle} style={{ padding: "6px 14px", fontSize: 14 }}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
