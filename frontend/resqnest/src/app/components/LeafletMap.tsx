"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMapEvents } from "react-leaflet";

export type MarkerType = "sos" | "shelter" | "resource" | "missing" | "user";

export type MapPoint = {
  lat: number;
  lng: number;
  type: MarkerType;
  label: string;
};

const COLORS: Record<MarkerType, string> = {
  sos: "#b70011", // primary
  shelter: "#0051d5", // secondary
  resource: "#005e8d", // tertiary
  missing: "#5c403c", // on-surface-variant
  user: "#e65100", // user / current position (orange)
};

// Map the layer-chip labels (from the page) to a marker type.
const LAYER_TYPE: Record<string, MarkerType> = {
  SOS: "sos",
  Shelters: "shelter",
  Resources: "resource",
  Missing: "missing",
};

function pinIcon(type: MarkerType) {
  const color = COLORS[type];
  return L.divIcon({
    className: "resqnest-pin",
    html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.45)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

// Click listener to place marker when clicking map
function MapClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function LeafletMap({
  activeLayer = "All Layers",
  points = [],
  center,
  draggable = false,
  onCoordinatesChange,
}: {
  activeLayer?: string;
  points?: MapPoint[];
  center?: [number, number];
  draggable?: boolean;
  onCoordinatesChange?: (lat: number, lng: number) => void;
}) {
  const filteredPoints =
    activeLayer === "All Layers"
      ? points
      : points.filter((p) => p.type === LAYER_TYPE[activeLayer]);

  // Compute center dynamically
  let mapCenter: [number, number] = center || [12.97, 77.59]; // Bangalore default
  if (!center && filteredPoints.length > 0) {
    const latSum = filteredPoints.reduce((acc, p) => acc + p.lat, 0);
    const lngSum = filteredPoints.reduce((acc, p) => acc + p.lng, 0);
    mapCenter = [latSum / filteredPoints.length, lngSum / filteredPoints.length];
  }

  // Key to force reload MapContainer when center shifts initially (or points load)
  // Use a stable key for draggable mode so dragging a marker doesn't force re-mounting and disrupt pan/zoom state.
  const mapKey = draggable
    ? "interactive-picker"
    : (filteredPoints.length > 0 ? `${mapCenter[0].toFixed(3)}-${mapCenter[1].toFixed(3)}-${filteredPoints.length}` : "default");

  const markerRef = useRef<L.Marker>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          if (onCoordinatesChange) {
            onCoordinatesChange(latLng.lat, latLng.lng);
          }
        }
      },
    }),
    [onCoordinatesChange]
  );

  return (
    <MapContainer
      key={mapKey}
      center={mapCenter}
      zoom={draggable ? 14 : (filteredPoints.length > 0 ? 13 : 11)}
      zoomControl={false}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      {draggable && onCoordinatesChange && (
        <MapClickHandler onClick={onCoordinatesChange} />
      )}
      {filteredPoints.map((p, i) => (
        <Marker key={`${p.type}-${i}`} position={[p.lat, p.lng]} icon={pinIcon(p.type)}>
          <Popup>
            <div className="text-body-sm font-semibold p-1">
              {p.label}
            </div>
          </Popup>
        </Marker>
      ))}
      {draggable && center && (
        <Marker
          draggable
          eventHandlers={eventHandlers}
          position={center}
          ref={markerRef}
          icon={pinIcon("user")}
        >
          <Popup>
            <div className="text-body-sm font-semibold p-1 text-center">
              📍 Your SOS Location<br />
              <span className="text-[10px] text-gray-500 font-normal">Drag marker or click map to move</span>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

