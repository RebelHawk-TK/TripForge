import { Link } from "react-router-dom";

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section style={{
        padding: "64px 24px",
        textAlign: "center",
        background: "var(--white)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <p style={{
            fontSize: 13,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "2px",
            color: "var(--gold)",
            marginBottom: 16,
          }}>
            Our Story
          </p>
          <h1 style={{
            fontFamily: "var(--heading)",
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: 20,
          }}>
            We believe everyone deserves<br />
            to love travel.
          </h1>
          <p style={{
            fontSize: 18,
            color: "var(--text-secondary)",
            lineHeight: 1.7,
          }}>
            Not just the vacation part. The planning part too.
          </p>
        </div>
      </section>

      {/* Story */}
      <section style={{ padding: "64px 24px" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ fontSize: 16, lineHeight: 1.8, color: "var(--text)" }}>
            <p style={{ marginBottom: 24 }}>
              Travel changes people. A week in a place you've never been,
              eating food you can't pronounce, navigating streets where
              nothing looks familiar — it rewires something. You come back
              different. More patient, more curious, more aware that the
              world is bigger and stranger and more beautiful than whatever
              you imagined from your couch.
            </p>
            <p style={{ marginBottom: 24 }}>
              We've felt that. We've also felt the other side — the 47 browser
              tabs, the conflicting blog recommendations, the three hours spent
              comparing hotels that all look the same. The moment where
              excitement curdles into overwhelm and you start thinking maybe
              a beach resort with a wristband would be easier.
            </p>
            <p style={{ marginBottom: 24 }}>
              That's the problem TravelForge exists to solve. Not the traveling
              — the planning.
            </p>

            <h2 style={{
              fontFamily: "var(--heading)",
              fontSize: 28,
              fontWeight: 600,
              marginTop: 48,
              marginBottom: 16,
            }}>
              The concierge you always wanted
            </h2>
            <p style={{ marginBottom: 24 }}>
              Wealthy travelers have always had concierges. Someone who knows
              the restaurant where locals actually eat, the museum that's
              empty on Tuesday mornings, the neighborhood where the street
              art is better than the galleries. Someone who takes your vague
              "we like history and good food" and turns it into five days
              you'll talk about for years.
            </p>
            <p style={{ marginBottom: 24 }}>
              That used to cost $200+ per trip, minimum. Or you needed to
              know the right people.
            </p>
            <p style={{ marginBottom: 24 }}>
              We built TravelForge to give that same concierge experience to
              everyone. Our AI has the knowledge of a thousand travel agents
              and the patience to rebuild your itinerary at 2 AM because you
              just realized you'd rather do cooking classes than museums.
              Start with a free plan. If you want hotel and flight options,
              upgrade for a few dollars. If you want someone to handle the
              entire trip — booking, logistics, changes, all of it — our
              Enhanced tier does that too.
            </p>

            <h2 style={{
              fontFamily: "var(--heading)",
              fontSize: 28,
              fontWeight: 600,
              marginTop: 48,
              marginBottom: 16,
            }}>
              Built in Greenville, for the world
            </h2>
            <p style={{ marginBottom: 24 }}>
              TravelForge started in Greenville, South Carolina — a small city
              that understands what it means to be a destination nobody expected.
              Twenty years ago, nobody was planning trips here. Now it's on every
              "best small cities" list. That kind of transformation happens
              everywhere, and most planning tools miss it because they only
              recommend what's already popular.
            </p>
            <p style={{ marginBottom: 24 }}>
              Our AI doesn't just pull from the top 10 TripAdvisor results.
              It knows the second-tier neighborhoods, the restaurants that
              opened last month, the viewpoint that doesn't show up on the
              first page of Google. That's what a real concierge does —
              and that's what we're building.
            </p>

            <h2 style={{
              fontFamily: "var(--heading)",
              fontSize: 28,
              fontWeight: 600,
              marginTop: 48,
              marginBottom: 16,
            }}>
              Our promise
            </h2>
            <p style={{ marginBottom: 24 }}>
              The free tier is genuinely useful. It's not a teaser or a
              crippled demo. You get a real, day-by-day itinerary with
              specific restaurants, attractions, and neighborhoods. Three
              a day, no credit card, no catch.
            </p>
            <p style={{ marginBottom: 24 }}>
              When you upgrade, you pay for time saved, not access to
              information. Basic adds the comparison shopping we've
              already done for you — flights, hotels, dining options with
              prices. Enhanced adds a human who makes sure everything is
              booked, confirmed, and handled.
            </p>
            <p>
              Travel should feel like an adventure before you leave, not
              a chore. We're here to make sure it does.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: "64px 24px", background: "var(--white)" }}>
        <div className="container">
          <h2 style={{
            fontFamily: "var(--heading)",
            fontSize: 28,
            fontWeight: 600,
            textAlign: "center",
            marginBottom: 40,
          }}>
            What we stand for
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 32,
            maxWidth: 900,
            margin: "0 auto",
          }}>
            {[
              {
                icon: "\uD83C\uDF0D",
                title: "Travel is for everyone",
                desc: "Budget travelers and luxury seekers get the same quality planning. The free tier isn't a bait-and-switch.",
              },
              {
                icon: "\uD83E\uDD1D",
                title: "Honest recommendations",
                desc: "We use affiliate links — and we're upfront about it. We'd rather earn your trust than a hidden commission.",
              },
              {
                icon: "\u26A1",
                title: "Speed without shortcuts",
                desc: "AI generates fast, but we don't cut corners. Every restaurant, every attraction, every neighborhood is real and current.",
              },
              {
                icon: "\uD83D\uDCAC",
                title: "The human touch matters",
                desc: "AI handles 90% brilliantly. For the other 10% — the rebooking, the special requests, the 'help I'm lost' moments — you get a real person.",
              },
            ].map((v) => (
              <div key={v.title} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{v.icon}</div>
                <h3 style={{
                  fontFamily: "var(--heading)",
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 8,
                }}>
                  {v.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "64px 24px",
        textAlign: "center",
        background: "var(--brown)",
        color: "var(--cream)",
      }}>
        <div className="container">
          <h2 style={{
            fontFamily: "var(--heading)",
            fontSize: 32,
            fontWeight: 600,
            color: "var(--cream)",
            marginBottom: 12,
          }}>
            Ready to go somewhere?
          </h2>
          <p style={{
            color: "rgba(250, 245, 240, 0.7)",
            fontSize: 16,
            marginBottom: 28,
          }}>
            Your next itinerary is 60 seconds away. No signup required for the first one.
          </p>
          <Link to="/generate" className="btn btn-primary btn-large">
            Plan a Trip — Free
          </Link>
        </div>
      </section>
    </div>
  );
}
