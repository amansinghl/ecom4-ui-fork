"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  origin: {
    lat: number;
    lng: number;
    name: string;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    name: string;
    address: string;
  };
  className?: string;
  height?: string;
  /** 0..1 fraction indicating progress from origin to destination */
  progress?: number;
  /** Optional label for the progress marker popup */
  progressLabel?: string;
}

export function Map({
  origin,
  destination,
  className = "",
  height = "400px",
  progress,
  progressLabel,
}: MapProps) {
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    if (mapRef.current) {
      // Fit the map to show both origin and destination
      const bounds = L.latLngBounds(
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      );
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [origin, destination]);

  // Create a polyline between origin and destination
  const routeCoordinates = [
    [origin.lat, origin.lng],
    [destination.lat, destination.lng],
  ];

  const hasProgress = typeof progress === "number" && !Number.isNaN(progress);
  const clampedProgress = hasProgress
    ? Math.max(0, Math.min(1, progress as number))
    : undefined;
  const progressLat = hasProgress
    ? origin.lat + (destination.lat - origin.lat) * (clampedProgress as number)
    : undefined;
  const progressLng = hasProgress
    ? origin.lng + (destination.lng - origin.lng) * (clampedProgress as number)
    : undefined;
  const progressIcon = L.divIcon({
    className: "",
    html: '<div style="width:14px;height:14px;border-radius:9999px;background:#16a34a;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -8],
  });

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <MapContainer
        center={[
          (origin.lat + destination.lat) / 2,
          (origin.lng + destination.lng) / 2,
        ]}
        zoom={6}
        className="w-full h-full rounded-lg"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Origin Marker */}
        <Marker position={[origin.lat, origin.lng]}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-gray-700">Origin</h3>
              <p className="text-sm font-medium">{origin.name}</p>
              <p className="text-xs text-gray-600">{origin.address}</p>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={[destination.lat, destination.lng]}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-gray-700">Destination</h3>
              <p className="text-sm font-medium">{destination.name}</p>
              <p className="text-xs text-gray-600">{destination.address}</p>
            </div>
          </Popup>
        </Marker>

        {/* Route Line */}
        <Polyline
          positions={routeCoordinates as [number, number][]}
          color="#6b7280"
          weight={2}
          opacity={0.6}
        />

        {/* Progress Marker (ETA-based interpolation) */}
        {hasProgress &&
          typeof progressLat === "number" &&
          typeof progressLng === "number" && (
            <Marker position={[progressLat, progressLng]} icon={progressIcon}>
              {progressLabel && (
                <Popup>
                  <div className="p-2">
                    <p className="text-xs text-gray-700">{progressLabel}</p>
                  </div>
                </Popup>
              )}
            </Marker>
          )}
      </MapContainer>
    </div>
  );
}
