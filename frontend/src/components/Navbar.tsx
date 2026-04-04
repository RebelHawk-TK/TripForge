import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/generate", label: "Plan a Trip" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/my-trips", label: "My Trips" },
];

export default function Navbar() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="announcement-bar">
        Free AI itineraries — plan your next adventure in seconds
      </div>
      <nav style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--cream)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div className="container" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}>
          {/* Logo */}
          <Link to="/" style={{
            fontFamily: "var(--heading)",
            fontSize: 24,
            fontWeight: 700,
            color: "var(--brown)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <img src="/images/logo.png" alt="TravelForge" width="32" height="32" style={{ borderRadius: 6 }} />
            TravelForge
          </Link>

          {/* Desktop nav */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}>
            <div style={{ display: "flex", gap: 24 }} className="desktop-nav">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: location.pathname === link.to ? "var(--teal)" : "var(--text-secondary)",
                    textDecoration: "none",
                    letterSpacing: "0.2px",
                    transition: "color 0.15s",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {user ? (
              <button className="btn btn-secondary" onClick={signOut} style={{ padding: "8px 16px", fontSize: 13 }}>
                Sign Out
              </button>
            ) : (
              <button className="btn btn-teal" onClick={signInWithGoogle} style={{ padding: "8px 16px", fontSize: 13 }}>
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: "none",
                background: "none",
                border: "none",
                fontSize: 24,
                color: "var(--brown)",
                padding: 4,
              }}
              className="mobile-toggle"
              aria-label="Toggle menu"
            >
              {mobileOpen ? "\u2715" : "\u2630"}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            borderTop: "1px solid var(--border)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            background: "var(--cream)",
          }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: "var(--brown)",
                  textDecoration: "none",
                  padding: "8px 0",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </>
  );
}
