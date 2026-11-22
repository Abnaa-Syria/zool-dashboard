import * as React from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { cn } from '../../../lib/utils';
import { MAP_CONFIG } from '../mapConfig';
import { MapControls } from './MapControls';

export type LatLng = [number, number];

/**
 * Fits the view to `points` the first time any are available (later polls never move the map
 * under the operator) and exposes the same fit to the "fit all" control.
 */
const FitController: React.FC<{ points: LatLng[]; fitRef: React.RefObject<() => void> }> = ({ points, fitRef }) => {
  const map = useMap();
  const fittedOnce = React.useRef(false);

  const fit = React.useCallback(() => {
    if (points.length === 0) {
      map.setView(MAP_CONFIG.defaultCenter, MAP_CONFIG.defaultZoom, { animate: true });
    } else if (points.length === 1) {
      map.setView(points[0]!, 11, { animate: true });
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 12, animate: true });
    }
  }, [map, points]);

  React.useEffect(() => {
    fitRef.current = fit;
    if (!fittedOnce.current && points.length > 0) {
      fittedOnce.current = true;
      fit();
    }
  }, [fit, fitRef, points.length]);

  return null;
};

/** Leaflet resizes itself after its container changes size (fullscreen toggle). */
const SizeInvalidator: React.FC<{ token: unknown }> = ({ token }) => {
  const map = useMap();
  React.useEffect(() => {
    const t = setTimeout(() => map.invalidateSize({ pan: false }), 200);
    return () => clearTimeout(t);
  }, [map, token]);
  return null;
};

export interface TrackingMapProps {
  /** Points the view fits to (initially and with the fit control). */
  fitPoints: LatLng[];
  fitTitle?: string;
  className?: string;
  /** Overlay rendered above the map (outside Leaflet), e.g. a "no position yet" notice. */
  overlay?: React.ReactNode;
  children?: React.ReactNode;
}

/** OpenStreetMap base map with the shared tracking controls. */
export const TrackingMap: React.FC<TrackingMapProps> = ({ fitPoints, fitTitle = 'عرض الكل', className, overlay, children }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const fitRef = React.useRef<() => void>(() => {});
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [tileError, setTileError] = React.useState(false);

  React.useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else containerRef.current.requestFullscreen?.().catch(() => {});
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full overflow-hidden rounded-2xl border border-outline-variant/30 shadow-card', isFullscreen ? 'h-screen rounded-none' : 'h-[520px]', className)}
    >
      {tileError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold shadow-md flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-amber-700">warning</span>
          <span>تعذر تحميل بعض بلاطات الخريطة. تأكد من اتصال الإنترنت.</span>
          <button type="button" onClick={() => setTileError(false)} className="px-2 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-[11px] font-bold">
            إخفاء
          </button>
        </div>
      )}
      {overlay}
      <MapContainer
        center={MAP_CONFIG.defaultCenter}
        zoom={MAP_CONFIG.defaultZoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        className="w-full h-full select-none"
        zoomControl={false}
      >
        <TileLayer url={MAP_CONFIG.tileUrl} attribution={MAP_CONFIG.attribution} eventHandlers={{ tileerror: () => setTileError(true) }} />
        {children}
        <FitController points={fitPoints} fitRef={fitRef} />
        <SizeInvalidator token={isFullscreen} />
        <MapControls onFitAll={() => fitRef.current()} fitTitle={fitTitle} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />
      </MapContainer>
    </div>
  );
};
