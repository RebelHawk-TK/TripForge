import type { ReactElement } from "react";
import { useParams, Link } from "react-router-dom";
import { BLOG_POSTS } from "../data/blogPosts";

function renderMarkdown(content: string) {
  // Simple markdown renderer for blog posts
  const lines = content.split("\n");
  const elements: ReactElement[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableKey = 0;

  const flushTable = () => {
    if (tableRows.length < 2) return;
    const headers = tableRows[0];
    const rows = tableRows.slice(2); // skip separator row
    elements.push(
      <div key={`table-${tableKey++}`} style={{ overflowX: "auto", margin: "20px 0" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 14,
        }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderBottom: "2px solid var(--border)",
                  fontWeight: 600,
                  color: "var(--brown)",
                  whiteSpace: "nowrap",
                }}>
                  {h.trim().replace(/\*\*/g, "")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: "8px 12px",
                    borderBottom: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}>
                    {cell.trim().replace(/\*\*/g, "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table detection
    if (line.trim().startsWith("|")) {
      inTable = true;
      const cells = line.split("|").filter((c) => c.trim() !== "");
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
      inTable = false;
    }

    // Headers
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} style={{
          fontFamily: "var(--heading)",
          fontSize: 24,
          fontWeight: 600,
          marginTop: 40,
          marginBottom: 16,
          color: "var(--brown)",
        }}>
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("**") && line.endsWith("**")) {
      // Bold standalone line
      elements.push(
        <p key={i} style={{ fontWeight: 600, marginBottom: 8 }}>
          {line.replace(/\*\*/g, "")}
        </p>
      );
    } else if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
      // Italic standalone line
      elements.push(
        <p key={i} style={{ fontStyle: "italic", color: "var(--text-secondary)", marginBottom: 12 }}>
          {line.replace(/\*/g, "")}
        </p>
      );
    } else if (line.trim() === "") {
      // Skip empty lines (paragraph spacing handled by margin)
    } else {
      // Regular paragraph — handle inline bold
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      elements.push(
        <p key={i} style={{ marginBottom: 16, lineHeight: 1.8 }}>
          {parts.map((part, pi) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={pi}>{part.replace(/\*\*/g, "")}</strong>
            ) : (
              <span key={pi}>{part}</span>
            )
          )}
        </p>
      );
    }
  }

  if (inTable) flushTable();
  return elements;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, marginBottom: 12 }}>
          Post not found
        </h1>
        <Link to="/blog" className="btn btn-primary">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero image */}
      <div style={{
        height: 300,
        backgroundImage: `url(${post.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, transparent 40%, rgba(44,36,32,0.6) 100%)",
        }} />
      </div>

      {/* Article */}
      <article className="container" style={{
        maxWidth: 760,
        padding: "0 24px",
        marginTop: -60,
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          background: "var(--cream)",
          borderRadius: "var(--radius-lg)",
          padding: "40px 40px 48px",
          boxShadow: "var(--shadow-lg)",
        }}>
          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "var(--teal)",
              background: "var(--teal-light)",
              padding: "4px 10px",
              borderRadius: 4,
            }}>
              {post.category}
            </span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{post.date}</span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>&middot; {post.readTime} read</span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "var(--heading)",
            fontSize: "clamp(28px, 4vw, 38px)",
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: 32,
            color: "var(--brown)",
          }}>
            {post.title}
          </h1>

          {/* Content */}
          <div style={{ fontSize: 16, color: "var(--text)" }}>
            {renderMarkdown(post.content)}
          </div>

          {/* CTA */}
          <div style={{
            marginTop: 48,
            padding: 28,
            background: "var(--white)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            textAlign: "center",
          }}>
            <h3 style={{ fontFamily: "var(--heading)", fontSize: 22, marginBottom: 8 }}>
              Want this itinerary customized for you?
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 20 }}>
              TravelForge builds personalized day-by-day plans in seconds. Free.
            </p>
            <Link to="/generate" className="btn btn-primary btn-large">
              Plan Your Trip
            </Link>
          </div>
        </div>

        {/* Back link */}
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <Link to="/blog" style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            &larr; Back to Travel Journal
          </Link>
        </div>
      </article>
    </div>
  );
}
