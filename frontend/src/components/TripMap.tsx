import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons in bundled apps
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const goldIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Activity {
  name: string;
  location: string;
  coordinates?: { lat: number; lng: number };
}

interface DayPlan {
  dayNumber: number;
  morning: Activity;
  afternoon: Activity;
  evening: Activity;
}

interface Props {
  days: DayPlan[];
  destination: string;
}

function FitBounds({ markers }: { markers: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [markers, map]);
  return null;
}

export default function TripMap({ days }: Props) {
  // Collect all activities that have coordinates
  const markers: { position: [number, number]; label: string; day: number; time: string }[] = [];

  days.forEach((day) => {
    const times = [
      { key: "morning" as const, label: "Morning" },
      { key: "afternoon" as const, label: "Afternoon" },
      { key: "evening" as const, label: "Evening" },
    ];
    times.forEach(({ key, label }) => {
      const activity = day[key];
      if (activity.coordinates) {
        markers.push({
          position: [activity.coordinates.lat, activity.coordinates.lng],
          label: activity.name,
          day: day.dayNumber,
          time: label,
        });
      }
    });
  });

  if (markers.length === 0) {
    return (
      <div style={{
        padding: "24px",
        textAlign: "center",
        color: "var(--text-secondary)",
        fontSize: 14,
        background: "var(--white)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
      }}>
        Map view available when itinerary includes location coordinates.
        Upgrade to Basic or Enhanced for map-enabled itineraries.
      </div>
    );
  }

  const center = markers[0].position;

  return (
    <div style={{
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      border: "1px solid var(--border)",
      height: 400,
    }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds markers={markers.map((m) => m.position)} />
        {markers.map((marker, idx) => (
          <Marker
            key={idx}
            position={marker.position}
            icon={idx === 0 ? goldIcon : defaultIcon}
          >
            <Popup>
              <strong>Day {marker.day} — {marker.time}</strong>
              <br />
              {marker.label}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
