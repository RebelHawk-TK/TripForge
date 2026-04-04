import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const { user, signInWithGoogle } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section style={{
        padding: "80px 24px",
        textAlign: "center",
        background: "linear-gradient(180deg, var(--primary-light) 0%, var(--bg) 100%)",
      }}>
        <div className="container">
          <h1 style={{
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: "-1.5px",
            lineHeight: 1.1,
            marginBottom: 20,
            color: "var(--text)",
          }}>
            AI itineraries in seconds.<br />
            Free.
          </h1>
          <p style={{
            fontSize: 19,
            color: "var(--text-secondary)",
            maxWidth: 560,
            margin: "0 auto 36px",
            lineHeight: 1.6,
          }}>
            Type a destination, get a personalized travel plan. Upgrade for
            hotel and flight samples, or let us book the whole trip.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/generate" className="btn btn-primary btn-large">
              Plan a Trip — Free
            </Link>
            {!user && (
              <button className="btn btn-secondary btn-large" onClick={signInWithGoogle}>
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "64px 24px" }}>
        <div className="container">
          <h2 style={{ fontSize: 32, fontWeight: 600, textAlign: "center", marginBottom: 48 }}>
            How it works
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 32,
          }}>
            {[
              { step: "1", title: "Tell us where", desc: "Pick a destination, dates, budget, and who's going." },
              { step: "2", title: "AI builds your plan", desc: "Claude generates a day-by-day itinerary with real places and restaurants." },
              { step: "3", title: "Upgrade if you want", desc: "Free gets you the plan. Basic adds flight and hotel samples. Enhanced books it all." },
            ].map((item) => (
              <div key={item.step} style={{
                padding: 28,
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                background: "white",
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--primary)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 15,
                  marginBottom: 16,
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "64px 24px", background: "var(--bg-secondary)" }}>
        <div className="container">
          <h2 style={{ fontSize: 32, fontWeight: 600, textAlign: "center", marginBottom: 48 }}>
            Simple pricing
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            maxWidth: 900,
            margin: "0 auto",
          }}>
            {[
              {
                name: "Free",
                price: "$0",
                desc: "3 itineraries per day",
                features: ["Day-by-day plan", "Real places and restaurants", "Shareable link"],
                cta: "Start Free",
                highlighted: false,
              },
              {
                name: "Basic",
                price: "$9",
                desc: "per trip",
                features: ["Everything in Free", "Flight and hotel samples", "Budget breakdown", "PDF export"],
                cta: "Get Basic",
                highlighted: true,
              },
              {
                name: "Enhanced",
                price: "$49",
                desc: "per trip",
                features: ["Everything in Basic", "Full booking coordination", "Personal concierge chat", "Unlimited revisions"],
                cta: "Go Enhanced",
                highlighted: false,
              },
            ].map((tier) => (
              <div key={tier.name} style={{
                padding: 28,
                borderRadius: "var(--radius)",
                border: tier.highlighted ? "2px solid var(--primary)" : "1px solid var(--border)",
                background: "white",
                position: "relative",
              }}>
                {tier.highlighted && (
                  <div style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--primary)",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "3px 12px",
                    borderRadius: 20,
                  }}>
                    Popular
                  </div>
                )}
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{tier.name}</h3>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 36, fontWeight: 700 }}>{tier.price}</span>
                  <span style={{ color: "var(--text-secondary)", fontSize: 14, marginLeft: 4 }}>{tier.desc}</span>
                </div>
                <ul style={{
                  listStyle: "none",
                  padding: 0,
                  marginBottom: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}>
                  {tier.features.map((f) => (
                    <li key={f} style={{ fontSize: 14, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "var(--success)" }}>&#10003;</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/generate"
                  className={`btn ${tier.highlighted ? "btn-primary" : "btn-secondary"}`}
                  style={{ width: "100%" }}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "32px 24px",
        borderTop: "1px solid var(--border)",
        textAlign: "center",
        color: "var(--text-secondary)",
        fontSize: 14,
      }}>
        <div className="container">
          TripForge &copy; {new Date().getFullYear()}. AI-powered travel planning from Greenville, SC.
        </div>
      </footer>
    </div>
  );
}
