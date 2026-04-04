import { Link } from "react-router-dom";

const POSTS = [
  {
    slug: "10-day-italy-under-2k",
    title: "10-Day Italy Itinerary Under $2,000",
    excerpt: "Rome to Amalfi on a real budget. Day-by-day plan with restaurants, trains, and hidden spots most tourists miss.",
    date: "Apr 4, 2026",
    category: "Itineraries",
    readTime: "8 min",
  },
  {
    slug: "ai-travel-planning-2026",
    title: "Why AI Travel Planning Actually Works in 2026",
    excerpt: "The tools have caught up to the hype. Here's what changed and how to get the best results from AI itinerary generators.",
    date: "Apr 2, 2026",
    category: "Guides",
    readTime: "5 min",
  },
  {
    slug: "weekend-asheville-couples",
    title: "The Perfect Asheville Weekend for Couples",
    excerpt: "Breweries, Blue Ridge views, and the best dinner reservation in town. A 3-day plan that feels longer than it is.",
    date: "Mar 28, 2026",
    category: "Itineraries",
    readTime: "6 min",
  },
  {
    slug: "budget-travel-tips",
    title: "12 Budget Travel Tricks That Actually Save Money",
    excerpt: "Skip the generic advice. These are specific tactics we've tested across 30+ countries and 200+ AI-generated trips.",
    date: "Mar 25, 2026",
    category: "Tips",
    readTime: "7 min",
  },
  {
    slug: "best-time-visit-japan",
    title: "When to Visit Japan (Month-by-Month Guide)",
    excerpt: "Cherry blossoms get all the attention, but autumn is better for most travelers. Here's the real breakdown by season.",
    date: "Mar 20, 2026",
    category: "Guides",
    readTime: "10 min",
  },
  {
    slug: "family-travel-disney-alternatives",
    title: "5 Family Vacations That Beat Disney World",
    excerpt: "Your kids will thank you later. National parks, Costa Rica, and three other trips that create real memories.",
    date: "Mar 15, 2026",
    category: "Itineraries",
    readTime: "6 min",
  },
];

const CATEGORIES = ["All", "Itineraries", "Guides", "Tips"];

export default function Blog() {
  return (
    <div>
      {/* Header */}
      <section style={{
        padding: "48px 24px 32px",
        textAlign: "center",
        background: "var(--white)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div className="container">
          <h1 style={{
            fontFamily: "var(--heading)",
            fontSize: "clamp(32px, 5vw, 44px)",
            fontWeight: 700,
            marginBottom: 12,
          }}>
            Travel Journal
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 480, margin: "0 auto 28px" }}>
            Destination guides, travel tips, and AI-crafted itineraries to inspire your next trip.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="btn btn-secondary"
                style={{
                  padding: "6px 16px",
                  fontSize: 13,
                  borderRadius: 20,
                  background: cat === "All" ? "var(--teal)" : "var(--white)",
                  color: cat === "All" ? "var(--white)" : "var(--text-secondary)",
                  border: cat === "All" ? "none" : "1px solid var(--border)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section style={{ padding: "48px 24px" }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 24,
          }}>
            {POSTS.map((post) => (
              <article
                key={post.slug}
                style={{
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)",
                  background: "var(--white)",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "none";
                }}
              >
                {/* Placeholder image band */}
                <div style={{
                  height: 160,
                  background: `linear-gradient(135deg, var(--teal-light) 0%, var(--gold-light) 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{ fontSize: 40, opacity: 0.6 }}>{
                    post.category === "Itineraries" ? "\uD83D\uDDFA\uFE0F" :
                    post.category === "Guides" ? "\uD83D\uDCD6" : "\uD83D\uDCA1"
                  }</span>
                </div>

                <div style={{ padding: "20px 24px" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "var(--teal)",
                      background: "var(--teal-light)",
                      padding: "3px 8px",
                      borderRadius: 4,
                    }}>
                      {post.category}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {post.date}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      &middot; {post.readTime}
                    </span>
                  </div>
                  <h3 style={{
                    fontFamily: "var(--heading)",
                    fontSize: 19,
                    fontWeight: 600,
                    marginBottom: 8,
                    lineHeight: 1.3,
                    color: "var(--brown)",
                  }}>
                    {post.title}
                  </h3>
                  <p style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}>
                    {post.excerpt}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "48px 24px",
        textAlign: "center",
        background: "var(--white)",
        borderTop: "1px solid var(--border)",
      }}>
        <h2 style={{ fontFamily: "var(--heading)", fontSize: 28, marginBottom: 12 }}>
          Ready to plan your trip?
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
          Generate a free AI itinerary in under 60 seconds.
        </p>
        <Link to="/generate" className="btn btn-primary btn-large">
          Plan a Trip — Free
        </Link>
      </section>
    </div>
  );
}
