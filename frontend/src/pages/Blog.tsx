import { Link } from "react-router-dom";
import { BLOG_POSTS } from "../data/blogPosts";

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
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/images/dest-iceland.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.08,
        }} />
        <div className="container" style={{ position: "relative" }}>
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
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <article
                  style={{
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border)",
                    background: "var(--white)",
                    overflow: "hidden",
                    transition: "box-shadow 0.2s, transform 0.2s",
                    cursor: "pointer",
                    height: "100%",
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
                  <div style={{
                    height: 180,
                    backgroundImage: `url(${post.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }} />

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
              </Link>
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
