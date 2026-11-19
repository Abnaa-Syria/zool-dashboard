import * as React from 'react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import { CORRIDOR_ROUTES } from '../fixtures/geoRoutes';
import type { CorridorId, Trip } from '../types/tracking';

export interface RouteLayerProps {
  selectedCorridorId: CorridorId;
  selectedTrip?: Trip;
  distanceCoveredKm?: number;
}

// Key strategic highway city waypoints across Sudan
const KEY_CITIES = [
  { name: 'الخرطوم العاصمة (الميناء البري)', coords: [15.5450, 32.5550] as [number, number], isHub: true },
  { name: 'شندي (استراحة شندي)', coords: [16.6912, 33.4321] as [number, number] },
  { name: 'البجراوية (أهرامات مروي)', coords: [16.9380, 33.7480] as [number, number] },
  { name: 'عطبرة (محطة السكك والنقل)', coords: [17.7022, 33.9864] as [number, number] },
  { name: 'مروي المركزية', coords: [18.4850, 31.8150] as [number, number], isTerminus: true },
  { name: 'بورتسودان (الميناء القومي)', coords: [19.6158, 37.2164] as [number, number], isTerminus: true },
  { name: 'ود مدني (عاصمة الجزيرة)', coords: [14.4012, 33.5199] as [number, number] },
  { name: 'القضارف (سوق المحاصيل)', coords: [14.0300, 35.3800] as [number, number] },
  { name: 'كسلا (جبال التاكا)', coords: [15.4500, 36.4000] as [number, number], isTerminus: true },
  { name: 'كوستي (النيل الأبيض)', coords: [13.1629, 32.6635] as [number, number] },
  { name: 'الأبيض (كردفان الكبرى)', coords: [13.1843, 30.2167] as [number, number], isTerminus: true },
];

export const RouteLayer: React.FC<RouteLayerProps> = ({
  selectedCorridorId,
  selectedTrip,
  distanceCoveredKm = 0,
}) => {
  // If a trip is selected, split its route into covered vs remaining
  const selectedRoutePolyline = React.useMemo(() => {
    if (!selectedTrip) return null;
    const routeDef = CORRIDOR_ROUTES.find((r) => r.id === selectedTrip.routeId);
    if (!routeDef) return null;

    const totalWaypoints = routeDef.waypoints.length;
    const progressFraction = Math.min(1, Math.max(0, distanceCoveredKm / selectedTrip.totalDistanceKm));
    const splitIndex = Math.max(1, Math.min(totalWaypoints - 1, Math.floor(progressFraction * totalWaypoints)));

    const covered = routeDef.waypoints.slice(0, splitIndex + 1);
    const remaining = routeDef.waypoints.slice(splitIndex);

    return { covered, remaining, all: routeDef.waypoints };
  }, [selectedTrip, distanceCoveredKm]);

  return (
    <>
      {/* Background Highway Corridors */}
      {CORRIDOR_ROUTES.map((route) => {
        const isCorridorActive = selectedCorridorId === 'all' || selectedCorridorId === route.corridorId;
        const isThisTripRoute = selectedTrip?.routeId === route.id;

        // Dim if another corridor is filtered or if this route has a detailed selected polyline
        if (isThisTripRoute) return null;

        return (
          <Polyline
            key={route.id}
            positions={route.waypoints}
            pathOptions={{
              color: isCorridorActive ? '#226a4b' : '#8b7172',
              weight: isCorridorActive ? 4 : 2,
              opacity: isCorridorActive ? 0.75 : 0.25,
              dashArray: isCorridorActive ? '5, 8' : '4, 8',
              lineCap: 'round',
            }}
          >
            <Tooltip direction="center" opacity={0.9}>
              <span className="font-bold text-xs" dir="rtl">{route.name}</span>
            </Tooltip>
          </Polyline>
        );
      })}

      {/* Selected Trip Active Route (Covered in bold solid, Remaining in dashed) */}
      {selectedRoutePolyline && (
        <>
          {/* Covered Section */}
          <Polyline
            positions={selectedRoutePolyline.covered}
            pathOptions={{
              color: '#003b27',
              weight: 6,
              opacity: 0.95,
              lineCap: 'round',
            }}
          />
          {/* Remaining Section */}
          <Polyline
            positions={selectedRoutePolyline.remaining}
            pathOptions={{
              color: '#226a4b',
              weight: 5,
              opacity: 0.85,
              dashArray: '8, 8',
              lineCap: 'round',
            }}
          />
        </>
      )}

      {/* Corridor Waypoint City Markers */}
      {KEY_CITIES.map((city) => (
        <CircleMarker
          key={city.name}
          center={city.coords}
          radius={city.isHub ? 7 : city.isTerminus ? 6 : 4.5}
          pathOptions={{
            fillColor: city.isHub ? '#8e1b32' : city.isTerminus ? '#003b27' : '#ffffff',
            fillOpacity: 1,
            color: city.isHub ? '#ffdadb' : '#226a4b',
            weight: city.isHub ? 3 : 2,
          }}
        >
          <Tooltip direction="bottom" offset={[0, 8]} opacity={0.92} permanent={city.isHub}>
            <div className="font-sans text-[11px] font-bold px-1 py-0.5" dir="rtl">
              {city.name}
            </div>
          </Tooltip>
        </CircleMarker>
      ))}

      {/* Selected Trip Stops (if available) */}
      {selectedTrip?.stops &&
        selectedTrip.stops.map((stop) => {
          const isCompleted = stop.status === 'completed';
          const isCurrent = stop.status === 'current';
          return (
            <CircleMarker
              key={stop.id}
              center={stop.coordinates}
              radius={isCurrent ? 9 : 6.5}
              pathOptions={{
                fillColor: isCompleted ? '#226a4b' : isCurrent ? '#8e1b32' : '#ffffff',
                fillOpacity: 1,
                color: isCurrent ? '#ffdadb' : '#003b27',
                weight: isCurrent ? 3.5 : 2,
              }}
            >
              <Tooltip direction="right" offset={[10, 0]} opacity={0.95}>
                <div className="font-sans text-right p-1" dir="rtl">
                  <div className="font-bold text-xs">{stop.name}</div>
                  <div className="text-[10px] text-on-surface-variant">
                    {stop.actualArrival || stop.scheduledArrival}
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
    </>
  );
};
