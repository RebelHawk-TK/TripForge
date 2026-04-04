interface Activity {
  name: string;
  description?: string;
  location: string;
  estimatedCost?: number;
}

interface DayPlan {
  dayNumber: number;
  date: string;
  morning: Activity;
  afternoon: Activity;
  evening: Activity;
  estimatedCost?: number;
}

interface Props {
  itinerary: {
    id: string;
    destination: string;
    days: DayPlan[];
  };
}

function ActivityCard({ label, activity }: { label: string; activity: Activity }) {
  return (
    <div style={{
      padding: "14px 16px",
      background: "white",
      borderRadius: "var(--radius)",
      border: "1px solid var(--border)",
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        color: "var(--text-secondary)",
        marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
        {activity.name}
      </div>
      {activity.description && (
        <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
          {activity.description}
        </div>
      )}
      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
        {activity.location}
        {activity.estimatedCost != null && (
          <span> &middot; ~${activity.estimatedCost}</span>
        )}
      </div>
    </div>
  );
}

export default function ItineraryDisplay({ itinerary }: Props) {
  const totalCost = itinerary.days.reduce((sum, day) => sum + (day.estimatedCost || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
          {itinerary.destination}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          {itinerary.days.length} days
          {totalCost > 0 && <> &middot; ~${totalCost} estimated total</>}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {itinerary.days.map((day) => (
          <div key={day.dayNumber}>
            <div style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              marginBottom: 12,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>
                Day {day.dayNumber}
              </h2>
              {day.date && (
                <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                  {day.date}
                </span>
              )}
              {day.estimatedCost != null && (
                <span style={{ fontSize: 14, color: "var(--text-secondary)", marginLeft: "auto" }}>
                  ~${day.estimatedCost}
                </span>
              )}
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
            }}>
              <ActivityCard label="Morning" activity={day.morning} />
              <ActivityCard label="Afternoon" activity={day.afternoon} />
              <ActivityCard label="Evening" activity={day.evening} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
