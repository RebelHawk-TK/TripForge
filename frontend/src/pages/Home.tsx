import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const DESTINATIONS = [
  { name: "Paris", desc: "City of Light", image: "/images/dest-paris.png" },
  { name: "Santorini", desc: "Blue Domes & Sea", image: "/images/dest-santorini.png" },
  { name: "Bali", desc: "Island Paradise", image: "/images/dest-bali.png" },
  { name: "Italy", desc: "Coast & Culture", image: "/images/blog-italy.png" },
  { name: "Iceland", desc: "Fire & Ice", image: "/images/dest-iceland.png" },
  { name: "Morocco", desc: "Desert Colors", image: "/images/dest-morocco.png" },
  { name: "Tokyo", desc: "Neon & Tradition", image: "/images/dest-tokyo.png" },
  { name: "Rome", desc: "Eternal City", image: "/images/dest-rome.png" },
];

export default function Home() {
  const { user, signInWithGoogle } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section style={{
        padding: "0",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Banner image */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/images/hero-banner.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.6,
        }} />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(250,245,240,0.5) 0%, rgba(250,245,240,0.85) 100%)",
        }} />

        <div className="container" style={{ position: "relative", zIndex: 1, padding: "80px 24px 60px" }}>
          <p style={{
            fontSize: 13,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "2px",
            color: "var(--gold)",
            marginBottom: 16,
          }}>
            AI-Powered Travel Planning
          </p>
          <h1 style={{
            fontFamily: "var(--heading)",
            fontSize: "clamp(36px, 6vw, 56px)",
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 20,
            color: "var(--brown)",
          }}>
            Your next adventure,<br />
            forged in seconds.
          </h1>
          <p style={{
            fontSize: 18,
            color: "var(--text-secondary)",
            maxWidth: 520,
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}>
            Tell us where you want to go. Our AI builds a personalized,
            day-by-day itinerary with real restaurants, attractions, and
            insider recommendations.
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

      {/* Destination cards */}
      <section style={{ padding: "64px 24px" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>
              Popular destinations
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
              Click any destination to start planning
            </p>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}>
            {DESTINATIONS.map((dest) => (
              <Link
                key={dest.name}
                to={`/generate?destination=${encodeURIComponent(dest.name)}`}
                style={{
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)",
                  background: "var(--white)",
                  textDecoration: "none",
                  overflow: "hidden",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div style={{
                  height: 130,
                  backgroundImage: `url(${dest.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }} />
                <div style={{ padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontWeight: 600, color: "var(--brown)", fontSize: 16 }}>{dest.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{dest.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "64px 24px", background: "var(--white)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 600 }}>
              How TravelForge works
            </h2>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 40,
          }}>
            {[
              {
                icon: "\uD83C\uDF0D",
                title: "Choose your destination",
                desc: "Pick where you're going, your dates, budget, and who's traveling with you.",
              },
              {
                icon: "\u2728",
                title: "AI builds your plan",
                desc: "Claude generates a day-by-day itinerary with real restaurants, landmarks, and local favorites.",
              },
              {
                icon: "\uD83D\uDE80",
                title: "Upgrade or book",
                desc: "Free gets you the plan. Basic adds flight and hotel samples. Enhanced books it all for you.",
              },
            ].map((item) => (
              <div key={item.title} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{
                  fontFamily: "var(--heading)",
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 8,
                }}>
                  {item.title}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ padding: "48px 24px", background: "var(--cream-dark)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <p style={{
              fontSize: 13,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "var(--gold)",
              marginBottom: 8,
            }}>
              Trusted by travelers
            </p>
            <h2 style={{ fontFamily: "var(--heading)", fontSize: 28, fontWeight: 600 }}>
              What people are saying
            </h2>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
            maxWidth: 960,
            margin: "0 auto",
          }}>
            {[
              {
                quote: "Generated a 7-day Italy plan in about 30 seconds. The restaurant picks were legit — we ate at three of them and every one was great.",
                name: "Sarah M.",
                trip: "Rome & Amalfi Coast",
              },
              {
                quote: "I was skeptical about AI planning, but the Asheville weekend it built for our anniversary was better than what I'd have found on my own.",
                name: "David K.",
                trip: "Asheville, NC",
              },
              {
                quote: "The free tier gives you a real itinerary, not a teaser. I upgraded to Basic for the hotel samples and saved two hours of comparison shopping.",
                name: "Priya T.",
                trip: "Tokyo & Kyoto",
              },
            ].map((t) => (
              <div key={t.name} style={{
                padding: 24,
                background: "var(--white)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
              }}>
                <div style={{ fontSize: 20, color: "var(--gold)", marginBottom: 12 }}>
                  {"\u2605".repeat(5)}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text)", marginBottom: 16 }}>
                  "{t.quote}"
                </p>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t.trip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "64px 24px" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 600 }}>Simple, honest pricing</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
              Start free. Upgrade when you need more.
            </p>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
            maxWidth: 900,
            margin: "0 auto",
          }}>
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                features: ["3 itineraries per day", "Day-by-day plan with real places", "Shareable link"],
                cta: "Start Free",
                style: "secondary",
              },
              {
                name: "Basic",
                price: "$9",
                period: "per trip",
                features: ["Everything in Free", "Flight & hotel samples", "Budget breakdown", "PDF export"],
                cta: "Get Basic",
                style: "primary",
                popular: true,
              },
              {
                name: "Enhanced",
                price: "$49",
                period: "per trip",
                features: ["Everything in Basic", "Full booking coordination", "Personal concierge", "Unlimited revisions"],
                cta: "Go Enhanced",
                style: "teal",
              },
            ].map((tier) => (
              <div key={tier.name} style={{
                padding: 28,
                borderRadius: "var(--radius-lg)",
                border: tier.popular ? "2px solid var(--gold)" : "1px solid var(--border)",
                background: "var(--white)",
                position: "relative",
              }}>
                {tier.popular && (
                  <div style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--gold)",
                    color: "var(--white)",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 14px",
                    borderRadius: 20,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    Most Popular
                  </div>
                )}
                <h3 style={{ fontFamily: "var(--heading)", fontSize: 22, marginBottom: 4 }}>{tier.name}</h3>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 40, fontWeight: 700, fontFamily: "var(--heading)" }}>{tier.price}</span>
                  <span style={{ color: "var(--text-secondary)", fontSize: 14, marginLeft: 4 }}>{tier.period}</span>
                </div>
                <ul style={{
                  listStyle: "none",
                  padding: 0,
                  marginBottom: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}>
                  {tier.features.map((f) => (
                    <li key={f} style={{
                      fontSize: 14,
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}>
                      <span style={{ color: "var(--success)", fontWeight: 700 }}>&#10003;</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/generate"
                  className={`btn btn-${tier.style}`}
                  style={{ width: "100%" }}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email signup */}
      <section style={{
        padding: "48px 24px",
        background: "var(--brown)",
        color: "var(--cream)",
      }}>
        <div className="container" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 24,
        }}>
          <div>
            <h3 style={{
              fontFamily: "var(--heading)",
              fontSize: 22,
              color: "var(--cream)",
              marginBottom: 4,
            }}>
              Get travel inspiration
            </h3>
            <p style={{ color: "rgba(250, 245, 240, 0.7)", fontSize: 14 }}>
              AI-curated destination guides delivered weekly.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
          >
            <input
              type="email"
              placeholder="Your email address"
              style={{
                width: 280,
                background: "rgba(250, 245, 240, 0.1)",
                border: "1px solid rgba(250, 245, 240, 0.2)",
                color: "var(--cream)",
                borderRadius: "var(--radius)",
              }}
            />
            <button className="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "32px 24px",
        borderTop: "1px solid var(--border)",
        background: "var(--cream)",
      }}>
        <div className="container" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
            TravelForge &copy; {new Date().getFullYear()}. AI-powered travel planning from Greenville, SC.
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                style={{ color: "var(--text-secondary)", fontSize: 13, textDecoration: "none" }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
