import * as React from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type {
  Vehicle,
  LiveTelemetry,
  Trip,
  CorridorId,
} from '../types/tracking';
import { BusMarker } from './BusMarker';
import { RouteLayer } from './RouteLayer';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { MAP_CONFIG } from '../mapConfig';


export interface FleetMapProps {
  vehicles: Vehicle[];
  telemetryMap: Map<string, LiveTelemetry>;
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  selectedTrip?: Trip;
  selectedCorridorId: CorridorId;
  isSidebarCollapsed: boolean;
  hasDrawerOpen: boolean;
}

// Map Resizer component to handle sidebar/drawer layout changes
const MapLayoutResizer: React.FC<{ isSidebarCollapsed: boolean; hasDrawerOpen: boolean }> = ({
  isSidebarCollapsed,
  hasDrawerOpen,
}) => {
  const map = useMap();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize({ pan: false });
    }, 320); // slightly after sidebar / drawer transition completes

    return () => clearTimeout(timer);
  }, [map, isSidebarCollapsed, hasDrawerOpen]);

  return null;
};

// Map controller for follow-mode and user drag detection
interface MapControllerProps {
  selectedCoords?: [number, number];
  isFollowing: boolean;
  setIsFollowing: (following: boolean) => void;
  filteredCoords: [number, number][];
  onRegisterFitAll: (fn: () => void) => void;
}

const MapController: React.FC<MapControllerProps> = ({
  selectedCoords,
  isFollowing,
  setIsFollowing,
  filteredCoords,
  onRegisterFitAll,
}) => {
  const map = useMap();

  // Detect user manual pan/drag and disable auto-follow
  useMapEvents({
    dragstart: () => {
      if (isFollowing) {
        setIsFollowing(false);
      }
    },
  });

  // Fit all visible buses
  const fitAll = React.useCallback(() => {
    if (filteredCoords.length > 0) {
      const bounds = L.latLngBounds(filteredCoords);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10, animate: true });
    } else {
      map.setView(MAP_CONFIG.defaultCenter, MAP_CONFIG.defaultZoom, { animate: true });
    }
  }, [map, filteredCoords]);

  React.useEffect(() => {
    onRegisterFitAll(fitAll);
  }, [fitAll, onRegisterFitAll]);

  // Smooth follow behavior
  React.useEffect(() => {
    if (isFollowing && selectedCoords) {
      map.panTo(selectedCoords, { animate: true, duration: 0.8 });
    }
  }, [map, isFollowing, selectedCoords]);

  return null;
};

export const FleetMap: React.FC<FleetMapProps> = ({
  vehicles,
  telemetryMap,
  selectedVehicleId,
  onSelectVehicle,
  selectedTrip,
  selectedCorridorId,
  isSidebarCollapsed,
  hasDrawerOpen,
}) => {
  const [isFollowing, setIsFollowing] = React.useState(Boolean(selectedVehicleId));
  const [followedSelection, setFollowedSelection] = React.useState(selectedVehicleId);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [tileError, setTileError] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const fitAllRef = React.useRef<() => void>(() => {});

  const selectedTelemetry = selectedVehicleId ? telemetryMap.get(selectedVehicleId) : undefined;
  const selectedVehicle = selectedVehicleId
    ? vehicles.find((v) => v.id === selectedVehicleId)
    : undefined;

  // Follow mode tracks the selection: on when a vehicle is selected, off when cleared
  // (adjusted during render instead of in an effect).
  if (followedSelection !== selectedVehicleId) {
    setFollowedSelection(selectedVehicleId);
    setIsFollowing(Boolean(selectedVehicleId));
  }

  // Handle Fullscreen Toggle
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Collect coordinates of all currently filtered visible vehicles
  const filteredCoords = React.useMemo(() => {
    const coords: [number, number][] = [];
    vehicles.forEach((v) => {
      const telem = telemetryMap.get(v.id);
      if (telem) coords.push(telem.coordinates);
    });
    return coords;
  }, [vehicles, telemetryMap]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden shadow-card border border-outline-variant/30 transition-all ${
        isFullscreen ? 'h-screen fixed inset-0 z-[1000] rounded-none' : 'h-[620px] lg:h-[calc(100vh-17.5rem)] min-h-[520px]'
      }`}
    >
      {/* Tile Error Fallback Banner */}
      {tileError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold shadow-md flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-amber-700">warning</span>
          <span>تعذر تحميل بعض بلاطات الخريطة من مزود الخدمة. تأكد من اتصال الإنترنت.</span>
          <button
            type="button"
            onClick={() => setTileError(false)}
            className="px-2 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-[11px] font-bold"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Primary Leaflet Map Container */}
      <MapContainer
        center={MAP_CONFIG.defaultCenter}
        zoom={MAP_CONFIG.defaultZoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        className="w-full h-full select-none"
        zoomControl={false}
      >
        {/* OpenStreetMap Raster Tile Layer with mandatory attribution */}
        <TileLayer
          url={MAP_CONFIG.tileUrl}
          attribution={MAP_CONFIG.attribution}
          eventHandlers={{
            tileerror: () => {
              setTileError(true);
            },
          }}
        />

        {/* Dynamic Road & Corridor Vectors */}
        <RouteLayer
          selectedCorridorId={selectedCorridorId}
          selectedTrip={selectedTrip}
          distanceCoveredKm={selectedTelemetry?.distanceCoveredKm}
        />

        {/* Live Moving Bus Markers */}
        {vehicles.map((vehicle) => {
          const telemetry = telemetryMap.get(vehicle.id);
          if (!telemetry) return null;

          return (
            <BusMarker
              key={vehicle.id}
              vehicle={vehicle}
              telemetry={telemetry}
              isSelected={selectedVehicleId === vehicle.id}
              onSelect={onSelectVehicle}
            />
          );
        })}

        {/* Map Layout Resizer and Follow Controller */}
        <MapLayoutResizer
          isSidebarCollapsed={isSidebarCollapsed}
          hasDrawerOpen={hasDrawerOpen}
        />

        <MapController
          selectedCoords={selectedTelemetry?.coordinates}
          isFollowing={isFollowing}
          setIsFollowing={setIsFollowing}
          filteredCoords={filteredCoords}
          onRegisterFitAll={(fn) => {
            fitAllRef.current = fn;
          }}
        />

        {/* Floating Controls */}
        <MapControls
          isFollowing={isFollowing}
          onToggleFollow={() => setIsFollowing((prev) => !prev)}
          hasSelectedBus={Boolean(selectedVehicleId)}
          onFitAll={() => fitAllRef.current?.()}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />

        {/* Map Legend */}
        <MapLegend />
      </MapContainer>

      {/* Resume Follow Mode Floating Bar if user manually panned while vehicle selected */}
      {selectedVehicleId && !isFollowing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsFollowing(true)}
            className="px-3.5 py-1.5 rounded-full bg-secondary text-on-secondary text-xs font-bold shadow-modal flex items-center gap-1.5 hover:bg-brand-emeraldDark transition-all animate-bounce"
          >
            <span className="material-symbols-outlined text-[16px]">my_location</span>
            <span>استئناف متابعة الحافلة ({selectedVehicle?.id})</span>
          </button>
        </div>
      )}
    </div>
  );
};
