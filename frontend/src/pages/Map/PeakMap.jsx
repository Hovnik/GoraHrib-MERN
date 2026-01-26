import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
  GeoJSON,
  CircleMarker,
  Circle,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useEffect, useMemo, memo, useCallback, useState, useRef } from "react";
import { Icon, divIcon, point } from "leaflet";
import "leaflet/dist/leaflet.css";
import sloveniaBorder from "../../../../data/slovenia-border-simplified.json";
import { createFriendAvatarsIcon } from "./FriendAvatars";
import { Navigation } from "lucide-react";

// Custom icons for climbed (green) and not climbed (red) peaks
const greenIcon = new Icon({
  iconUrl:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Ccircle cx='6' cy='6' r='6' fill='%2310b981'/%3E%3C/svg%3E",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
  popupAnchor: [0, -6],
});

const redIcon = new Icon({
  iconUrl:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Ccircle cx='6' cy='6' r='6' fill='%23ef4444'/%3E%3C/svg%3E",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
  popupAnchor: [0, -6],
});

// Component to expose map instance to parent
const MapInstance = ({ mapRef }) => {
  const map = useMap();
  useEffect(() => {
    if (mapRef) {
      mapRef.current = map;
    }
  }, [map, mapRef]);
  return null;
};

// Component to control map from outside
const MapController = ({ center, zoom, duration = 2.0 }) => {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      const offset = 0.001;
      const adjustedCenter = [center[0] + offset, center[1]];
      map.flyTo(adjustedCenter, zoom, { duration, easeLinearity: 0.25 });
    }
  }, [center, zoom, duration, map]);
  return null;
};

// Memoized individual peak marker component for better performance
const PeakMarker = memo(
  ({
    peak,
    latitude,
    longitude,
    climbed,
    inChecklist,
    friendsVisited,
    friendsInChecklist,
    markerIcon,
    openPopupForPeakId,
    activePopupPeakId, // eslint-disable-line no-unused-vars
    setActivePopupPeakId,
    setOpenPopupForPeakId,
    onAddToChecklist,
  }) => {
    const markerRef = useRef(null);

    useEffect(() => {
      if (markerRef.current && openPopupForPeakId === peak._id) {
        const timer = setTimeout(() => {
          try {
            if (markerRef.current?._map && markerRef.current?._popup) {
              markerRef.current.openPopup();
            }
          } catch (error) {
            console.error("Error opening popup:", error);
          } finally {
            setOpenPopupForPeakId(null);
          }
        }, 1200);
        return () => clearTimeout(timer);
      }
    }, [openPopupForPeakId, peak._id, setOpenPopupForPeakId]);

    return (
      <Marker
        position={[latitude, longitude]}
        icon={markerIcon}
        peakId={peak._id}
        ref={markerRef}
        eventHandlers={{
          popupopen: () => setActivePopupPeakId(peak._id),
          popupclose: () => setActivePopupPeakId(null),
        }}
      >
        <Tooltip
          permanent
          direction="bottom"
          offset={[-5, -5]}
          className="peak-label"
        >
          {peak.name.replace(/\s*\([^)]*\)/g, "")}
        </Tooltip>
        <Popup
          className="custom-popup"
          minWidth={200}
          autoPanPaddingTopLeft={[0, 85]}
        >
          <div>
            <h3
              className="font-bold text-xl mb-3"
              style={{ paddingRight: "2.5rem", overflowWrap: "break-word" }}
            >
              {peak.name}
            </h3>
            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <span className="font-semibold">Višina:</span> {peak.elevation}m
              </p>
              <p className="text-sm">
                <span className="font-semibold">Območje:</span>{" "}
                {peak.mountainRange}
              </p>
            </div>
            {friendsVisited.length > 0 && (
              <div className="mb-3">
                <p className="text-sm">
                  <span className="font-semibold">Osvojili: </span>
                  <span className="text-sm">
                    {friendsVisited.map((f) => f.username).join(", ")}
                  </span>
                </p>
              </div>
            )}
            {friendsInChecklist.length > 0 && (
              <div className="mb-3">
                <p className="text-sm">
                  <span className="font-semibold">Želijo osvojiti: </span>
                  <span className="text-sm">
                    {friendsInChecklist.map((f) => f.username).join(", ")}
                  </span>
                </p>
              </div>
            )}
            {climbed && (
              <div className="badge badge-success gap-2 mb-3">Osvojen</div>
            )}
            {!inChecklist && (
              <button
                onClick={() => onAddToChecklist(peak._id)}
                className="btn btn-primary btn-sm w-full"
              >
                Dodaj na Seznam
              </button>
            )}
            {inChecklist && !climbed && (
              <div className="badge badge-info gap-2">Na Seznamu</div>
            )}
          </div>
        </Popup>
      </Marker>
    );
  },
  (prev, next) =>
    prev.peak._id === next.peak._id &&
    prev.climbed === next.climbed &&
    prev.inChecklist === next.inChecklist &&
    prev.activePopupPeakId === next.activePopupPeakId &&
    prev.openPopupForPeakId === next.openPopupForPeakId &&
    prev.friendsVisited === next.friendsVisited &&
    prev.friendsInChecklist === next.friendsInChecklist &&
    prev.markerIcon === next.markerIcon,
);

// Memoized map component - prevents re-rendering during search typing
const PeakMap = memo(
  ({
    peaks,
    checklist,
    friendsPeaksData,
    loading,
    isMobile,
    selectedPeak,
    openPopupForPeakId,
    onAddToChecklist,
    setOpenPopupForPeakId,
    mapRef,
    userLocation,
    onRecenterLocation,
  }) => {
    const center = [46.1512, 14.8555];
    const maxBounds = [
      [45.0, 13.0],
      [47.0, 17.0],
    ];
    const initialZoom = isMobile ? 8 : 9;
    const [activePopupPeakId, setActivePopupPeakId] = useState(null);

    // Create lookup maps for O(1) access instead of O(n) array searches
    const { climbedPeaksSet, checklistPeaksSet } = useMemo(() => {
      const climbed = new Set();
      const inChecklist = new Set();
      checklist.forEach((item) => {
        const peakId =
          typeof item.peakId === "string" ? item.peakId : item.peakId?._id;
        if (peakId) {
          inChecklist.add(peakId);
          if (item.status === "Visited") climbed.add(peakId);
        }
      });
      return { climbedPeaksSet: climbed, checklistPeaksSet: inChecklist };
    }, [checklist]);

    const isPeakClimbed = useCallback(
      (peakId) => climbedPeaksSet.has(peakId),
      [climbedPeaksSet],
    );
    const isPeakInChecklist = useCallback(
      (peakId) => checklistPeaksSet.has(peakId),
      [checklistPeaksSet],
    );

    const createClusterCustomIcon = useMemo(
      () => (cluster) => {
        const count = cluster.getChildCount();
        const markers = cluster.getAllChildMarkers();

        const visitedCount = markers.filter((marker) => {
          const peakId = marker.options.peakId;
          return isPeakClimbed(peakId);
        }).length;

        const percentage = count > 0 ? (visitedCount / count) * 100 : 0;
        const size = Math.min(40 + Math.floor(count / 10) * 5, 70);

        const circumference = 2 * Math.PI * (size / 2 - 5);
        const strokeDashoffset =
          circumference - (percentage / 100) * circumference;

        return divIcon({
          html: `
          <div style="position: relative; width: ${size}px; height: ${size}px;">
            <svg width="${size}" height="${size}" style="position: absolute; top: 0; left: 0; transform: rotate(-90deg);">
              <circle
                cx="${size / 2}"
                cy="${size / 2}"
                r="${size / 2 - 5}"
                fill="rgba(16, 185, 129, 0.3)"
                stroke="white"
                stroke-width="3"
              />
              <circle
                cx="${size / 2}"
                cy="${size / 2}"
                r="${size / 2 - 5}"
                fill="none"
                stroke="rgba(64, 185, 16, 1)"
                stroke-width="4"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${strokeDashoffset}"
                stroke-linecap="round"
              />
            </svg>
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: ${percentage === 100 ? "rgba(64, 185, 16, 1)" : "white"};
              font-weight: bold;
              font-size: ${Math.min(14 + Math.floor(count / 50), 20)}px;
              text-shadow: 0 1px 3px rgba(0,0,0,0.5);
            ">${count}</div>
          </div>
        `,
          className: "",
          iconSize: point(size, size, true),
        });
      },
      [isPeakClimbed],
    );

    return (
      <MapContainer
        center={center}
        zoom={initialZoom}
        minZoom={isMobile ? 8 : 9}
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0}
        className="h-full w-full"
        scrollWheelZoom={true}
        zoomControl={!isMobile}
      >
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        <MapInstance mapRef={mapRef} />

        <GeoJSON
          data={sloveniaBorder}
          style={{
            color: "#15a010ff",
            weight: 3,
            opacity: 0.8,
            fillOpacity: 0,
          }}
        />

        {selectedPeak && (
          <MapController
            center={selectedPeak.center}
            zoom={selectedPeak.zoom}
            duration={selectedPeak.duration}
          />
        )}

        {!loading && (
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
            showCoverageOnHover={false}
            spiderfyOnMaxZoom={true}
            disableClusteringAtZoom={15}
          >
            {peaks.map((peak) => {
              if (
                !peak.location?.coordinates ||
                peak.location.coordinates.length !== 2
              )
                return null;

              const [longitude, latitude] = peak.location.coordinates;
              const climbed = isPeakClimbed(peak._id);
              const inChecklist = isPeakInChecklist(peak._id);
              const friendsData = friendsPeaksData[peak._id];
              const friendsVisited = friendsData?.visited || [];
              const friendsInChecklist = friendsData?.inChecklist || [];
              const baseIcon = climbed ? greenIcon : redIcon;
              const markerIcon = createFriendAvatarsIcon(
                friendsVisited,
                baseIcon,
                activePopupPeakId === peak._id,
              );

              return (
                <PeakMarker
                  key={peak._id}
                  peak={peak}
                  latitude={latitude}
                  longitude={longitude}
                  climbed={climbed}
                  inChecklist={inChecklist}
                  friendsVisited={friendsVisited}
                  friendsInChecklist={friendsInChecklist}
                  markerIcon={markerIcon}
                  openPopupForPeakId={openPopupForPeakId}
                  activePopupPeakId={activePopupPeakId}
                  setActivePopupPeakId={setActivePopupPeakId}
                  setOpenPopupForPeakId={setOpenPopupForPeakId}
                  onAddToChecklist={onAddToChecklist}
                />
              );
            })}
          </MarkerClusterGroup>
        )}

        {/* User Location Marker with pulsing animation */}
        {userLocation && (
          <>
            {/* Accuracy circle */}
            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={userLocation.accuracy}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.1,
                weight: 1,
                opacity: 0.3,
              }}
            />
            {/* Blue dot marker */}
            <CircleMarker
              center={[userLocation.latitude, userLocation.longitude]}
              radius={8}
              pathOptions={{
                color: "white",
                fillColor: "#3b82f6",
                fillOpacity: 1,
                weight: 2,
              }}
              className="user-location-marker"
            >
              <Tooltip permanent={false} direction="top" offset={[0, -10]}>
                Your Location
              </Tooltip>
            </CircleMarker>
          </>
        )}

        {/* Recenter button */}
        <div className="absolute bottom-4 left-4 z-[1000]">
          <button
            onClick={onRecenterLocation}
            disabled={!userLocation}
            className={`btn btn-circle btn-sm shadow-lg ${
              userLocation
                ? "btn-primary hover:btn-primary-focus"
                : "btn-disabled bg-gray-300"
            }`}
            aria-label="Recenter on your location"
            title="Recenter on your location"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>

        {/* CSS for pulsing animation */}
        <style>{`
          @keyframes pulse-ring {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(2.5);
              opacity: 0;
            }
          }
          
          .user-location-marker::before,
          .user-location-marker::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: #3b82f6;
            opacity: 0;
            pointer-events: none;
          }
          
          .user-location-marker::before {
            animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          .user-location-marker::after {
            animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s;
          }
        `}</style>
      </MapContainer>
    );
  },
  // Custom comparison function to prevent re-renders when search query changes
  (prevProps, nextProps) => {
    return (
      prevProps.peaks === nextProps.peaks &&
      prevProps.checklist === nextProps.checklist &&
      prevProps.friendsPeaksData === nextProps.friendsPeaksData &&
      prevProps.loading === nextProps.loading &&
      prevProps.isMobile === nextProps.isMobile &&
      prevProps.selectedPeak === nextProps.selectedPeak &&
      prevProps.openPopupForPeakId === nextProps.openPopupForPeakId &&
      prevProps.onAddToChecklist === nextProps.onAddToChecklist &&
      prevProps.setOpenPopupForPeakId === nextProps.setOpenPopupForPeakId &&
      prevProps.mapRef === nextProps.mapRef &&
      prevProps.userLocation === nextProps.userLocation &&
      prevProps.onRecenterLocation === nextProps.onRecenterLocation
    );
  },
);

PeakMap.displayName = "PeakMap";

export default PeakMap;
