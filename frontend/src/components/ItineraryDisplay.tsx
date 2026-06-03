import { useState } from "react";
import TripMap from "./TripMap";

interface Activity {
  name: string;
  description?: string;
  location: string;
  estimatedCost?: number;
  coordinates?: { lat: number; lng: number };
  bookingUrl?: string;
}

type TimeSlot = "morning" | "afternoon" | "evening" | "lodging";

function getBookingLink(activity: Activity, timeSlot: TimeSlot, destination: string): { url: string; label: string } | null {
  if (!activity.name) return null;
  if (activity.bookingUrl) return { url: activity.bookingUrl, label: "Book Now" };

  const q = encodeURIComponent(`${activity.name} ${activity.location || destination}`);
  switch (timeSlot) {
    case "lodging":
      return { url: `https://www.booking.com/searchresults.html?ss=${q}`, label: "Find on Booking.com" };
    case "evening":
      return { url: `https://www.google.com/maps/search/${q}`, label: "View on Google Maps" };
    default:
      return { url: `https://www.viator.com/searchResults/all?text=${q}`, label: "Find on Viator" };
  }
}

interface DayPlan {
  dayNumber: number;
  date: string;
  morning: Activity;
  afternoon: Activity;
  evening: Activity;
  lodging?: Activity;
  estimatedCost?: number;
}

interface Props {
  itinerary: {
    id: string;
    destination: string;
    days: DayPlan[];
  };
  onUpdate?: (days: DayPlan[]) => void;
}

function EditableActivityCard({
  label,
  activity,
  editing,
  onChange,
  timeSlot,
  destination,
}: {
  label: string;
  activity: Activity;
  editing: boolean;
  onChange: (updated: Activity) => void;
  timeSlot: TimeSlot;
  destination: string;
}) {
  const bookingLink = getBookingLink(activity, timeSlot, destination);

  if (editing) {
    return (
      <div style={{
        padding: "14px 16px",
        background: "var(--white)",
        borderRadius: "var(--radius)",
        border: "2px solid var(--gold)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: "var(--gold)",
          marginBottom: 2,
        }}>
          {label}
        </div>
        <input
          value={activity.name}
          onChange={(e) => onChange({ ...activity, name: e.target.value })}
          style={{ fontWeight: 600, fontSize: 15, padding: "6px 8px" }}
          placeholder="Activity name"
        />
        <input
          value={activity.description || ""}
          onChange={(e) => onChange({ ...activity, description: e.target.value })}
          style={{ fontSize: 14, padding: "6px 8px" }}
          placeholder="Description (optional)"
        />
        <input
          value={activity.location}
          onChange={(e) => onChange({ ...activity, location: e.target.value })}
          style={{ fontSize: 13, padding: "6px 8px" }}
          placeholder="Location"
        />
        <input
          value={activity.bookingUrl || ""}
          onChange={(e) => onChange({ ...activity, bookingUrl: e.target.value || undefined })}
          style={{ fontSize: 13, padding: "6px 8px" }}
          placeholder="Booking URL (optional — overrides default link)"
          type="url"
        />
      </div>
    );
  }

  return (
    <div style={{
      padding: "14px 16px",
      background: "var(--white)",
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
      {bookingLink && (
        <a
          href={bookingLink.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: 8,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--teal)",
            textDecoration: "none",
          }}
        >
          {bookingLink.label} {"\u2192"}
        </a>
      )}
    </div>
  );
}

export default function ItineraryDisplay({ itinerary, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [days, setDays] = useState(itinerary.days);

  // Title-case the destination
  const displayDestination = itinerary.destination
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  const [copied, setCopied] = useState(false);
  const totalCost = days.reduce((sum, day) => sum + (day.estimatedCost || 0), 0);

  const updateActivity = (dayIdx: number, timeSlot: "morning" | "afternoon" | "evening" | "lodging", updated: Activity) => {
    const newDays = [...days];
    newDays[dayIdx] = { ...newDays[dayIdx], [timeSlot]: updated };
    setDays(newDays);
  };

  const updateDate = (dayIdx: number, newDate: string) => {
    const newDays = [...days];
    newDays[dayIdx] = { ...newDays[dayIdx], date: newDate };
    setDays(newDays);
  };

  const handleSave = () => {
    setEditing(false);
    onUpdate?.(days);
  };

  const shareUrl = `${window.location.origin}/trip/${itinerary.id}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      {/* Header with actions */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div>
          <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
            {displayDestination}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            {days.length} days
            {totalCost > 0 && <> &middot; ~${totalCost} estimated total</>}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-secondary"
            onClick={handleShare}
            style={{ padding: "8px 14px", fontSize: 13 }}
          >
            {copied ? "\u2713 Copied!" : "\uD83D\uDD17 Share"}
          </button>
          {editing ? (
            <button
              className="btn btn-primary"
              onClick={handleSave}
              style={{ padding: "8px 14px", fontSize: 13 }}
            >
              Save Changes
            </button>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={() => setEditing(true)}
              style={{ padding: "8px 14px", fontSize: 13 }}
            >
              {"\u270F\uFE0F"} Edit
            </button>
          )}
        </div>
      </div>

      {/* Map */}
      <div style={{ marginBottom: 28 }}>
        <TripMap days={days} destination={itinerary.destination} />
      </div>

      {/* Day-by-day itinerary */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {days.map((day, dayIdx) => (
          <div key={day.dayNumber}>
            <div style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              marginBottom: 12,
            }}>
              <h2 style={{ fontFamily: "var(--heading)", fontSize: 18, fontWeight: 600 }}>
                Day {day.dayNumber}
              </h2>
              {editing ? (
                <input
                  type="date"
                  value={day.date}
                  onChange={(e) => updateDate(dayIdx, e.target.value)}
                  style={{ fontSize: 14, padding: "4px 8px", border: "2px solid var(--gold)", borderRadius: "var(--radius)" }}
                />
              ) : (
                day.date && (
                  <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                    {day.date}
                  </span>
                )
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
              {(["morning", "afternoon", "evening"] as const).map((slot) => (
                <EditableActivityCard
                  key={slot}
                  label={slot.charAt(0).toUpperCase() + slot.slice(1)}
                  activity={day[slot]}
                  editing={editing}
                  onChange={(updated) => updateActivity(dayIdx, slot, updated)}
                  timeSlot={slot}
                  destination={itinerary.destination}
                />
              ))}
            </div>
            {/* Lodging */}
            {(day.lodging || editing) && (
              <div style={{ marginTop: 12 }}>
                <EditableActivityCard
                  label={"\uD83C\uDFE8 Lodging"}
                  activity={day.lodging || { name: "", description: "", location: "" }}
                  editing={editing}
                  onChange={(updated) => updateActivity(dayIdx, "lodging", updated)}
                  timeSlot="lodging"
                  destination={itinerary.destination}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
