import * as React from 'react';
import L from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';
import { formatDateTime } from '../../../lib/dates';
import { TRIP_STATUS_LABEL } from '../../network/api';
import type { LiveTrip, LivePosition } from '../api';
import { MARKER_COLORS, formatAge, markerTone, routeLabel, type MarkerTone } from '../liveState';

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function busIcon(tone: MarkerTone, heading: number | null, label: string, selected: boolean): L.DivIcon {
  const c = MARKER_COLORS[tone];
  const halo = selected
    ? `<span style="position:absolute;inset:-4px;border-radius:9999px;border:2.5px solid #aaf2ca;box-shadow:0 0 14px rgba(170,242,202,.8);pointer-events:none"></span>
       <span style="position:absolute;inset:2px;border-radius:9999px;background:${c.border}55;animation:zg-radar-ping 1.6s cubic-bezier(0,0,.2,1) infinite;pointer-events:none"></span>`
    : '';
  const svg = `
    <svg width="22" height="38" viewBox="0 0 24 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35))">
      <rect x="2" y="2" width="20" height="38" rx="4.5" fill="${c.bg}" stroke="${selected ? '#aaf2ca' : c.border}" stroke-width="1.8"/>
      <path d="M 4 7 C 6 4.5, 18 4.5, 20 7 L 20 11 C 18 10, 6 10, 4 11 Z" fill="#99d3b4"/>
      <rect x="6.5" y="16" width="11" height="8" rx="2" fill="#1a533c"/>
      <circle cx="5" cy="38" r="1.2" fill="#ba1a1a"/><circle cx="19" cy="38" r="1.2" fill="#ba1a1a"/>
      <path d="M 12 1.5 L 14 5 L 10 5 Z" fill="#ffffff"/>
    </svg>`;
  const html = `
    <div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;cursor:pointer">
      ${halo}
      <div style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;transform:rotate(${heading ?? 0}deg);transition:transform .25s">${svg}</div>
      <div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:10px;font-weight:700;background:${c.bg};color:#fff;padding:1px 6px;border-radius:6px;direction:ltr;box-shadow:0 2px 4px rgba(0,0,0,.3)">${escapeHtml(label)}</div>
    </div>`;
  return L.divIcon({ className: 'zg-custom-bus-div-icon', html, iconSize: [48, 48], iconAnchor: [24, 24] });
}

export const TripMarker: React.FC<{
  trip: LiveTrip;
  position: LivePosition;
  selected?: boolean;
  onSelect?: (tripId: string) => void;
}> = ({ trip, position, selected = false, onSelect }) => {
  const tone = markerTone(trip);
  const label = trip.vehicle?.plateNumber ?? trip.tripNumber ?? '—';
  const icon = React.useMemo(() => busIcon(tone, position.heading, label, selected), [tone, position.heading, label, selected]);

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={icon}
      zIndexOffset={selected ? 1000 : 100}
      eventHandlers={onSelect ? { click: () => onSelect(trip.tripId) } : undefined}
    >
      <Tooltip direction="top" offset={[0, -24]} opacity={0.98} className="zg-bus-tooltip">
        <div className="p-2 text-right text-on-surface min-w-[210px]" dir="rtl">
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-outline-variant/30">
            <span className="font-bold text-sm text-primary" dir="ltr">{trip.tripNumber ?? trip.vehicle?.plateNumber ?? '—'}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: MARKER_COLORS[tone].bg }}>
              {TRIP_STATUS_LABEL[trip.status]}
            </span>
          </div>
          <div className="mt-1.5 space-y-1 text-xs">
            <div>{routeLabel(trip)}</div>
            <div className="flex justify-between gap-2"><span className="text-on-surface-variant">الناقل</span><span className="font-semibold">{trip.carrier.name}</span></div>
            {trip.driver && <div className="flex justify-between gap-2"><span className="text-on-surface-variant">السائق</span><span>{trip.driver.displayName}</span></div>}
            <div className="flex justify-between gap-2">
              <span className="text-on-surface-variant">السرعة</span>
              <span className="font-semibold">{position.speedKmh !== null ? `${position.speedKmh} كم/س` : '—'}</span>
            </div>
            <div className="flex justify-between gap-2"><span className="text-on-surface-variant">آخر إشارة</span><span>{formatAge(position.ageSeconds)}</span></div>
            <div className="flex justify-between gap-2"><span className="text-on-surface-variant">الوصول المتوقع</span><span>{formatDateTime(trip.etaAt)}</span></div>
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
};
