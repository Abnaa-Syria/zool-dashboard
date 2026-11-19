import * as React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Vehicle, LiveTelemetry } from '../types/tracking';

export interface BusMarkerProps {
  vehicle: Vehicle;
  telemetry: LiveTelemetry;
  isSelected: boolean;
  onSelect: (vehicleId: string) => void;
}

function getStatusColors(telemetry: LiveTelemetry, isSelected: boolean) {
  if (telemetry.gpsStatus === 'disconnected') {
    return {
      bg: '#574142',
      border: '#8b7172',
      text: '#ffffff',
      pulse: 'transparent',
      labelBg: '#574142',
    };
  }
  if (telemetry.operationalStatus === 'stopped') {
    return {
      bg: '#b45309',
      border: '#f59e0b',
      text: '#ffffff',
      pulse: isSelected ? 'rgba(245, 158, 11, 0.4)' : 'transparent',
      labelBg: '#78350f',
    };
  }
  if (telemetry.operationalStatus === 'delayed' || telemetry.operationalStatus === 'incident') {
    return {
      bg: '#8e1b32',
      border: '#ba1a1a',
      text: '#ffffff',
      pulse: isSelected ? 'rgba(186, 26, 26, 0.4)' : 'transparent',
      labelBg: '#6d001e',
    };
  }
  // moving / normal
  return {
    bg: '#003b27',
    border: isSelected ? '#aaf2ca' : '#226a4b',
    text: '#ffffff',
    pulse: isSelected ? 'rgba(34, 106, 75, 0.4)' : 'rgba(34, 106, 75, 0.2)',
    labelBg: '#003b27',
  };
}

/**
 * Builds the HTML string for the Leaflet divIcon.
 * Keeps marker positioning transform untouched by rotating ONLY an inner SVG wrapper.
 */
function createBusDivIcon(
  vehicle: Vehicle,
  telemetry: LiveTelemetry,
  isSelected: boolean
): L.DivIcon {
  const colors = getStatusColors(telemetry, isSelected);
  const heading = telemetry.heading || 0;
  const isMoving = telemetry.operationalStatus === 'moving' && telemetry.speed > 0;

  const radarWave = isSelected
    ? `<span style="position: absolute; inset: 2px; border-radius: 9999px; background: ${colors.pulse}; animation: zg-radar-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></span>`
    : '';

  const selectionHalo = isSelected
    ? `<span style="position: absolute; inset: -4px; border-radius: 9999px; border: 2.5px solid #aaf2ca; box-shadow: 0 0 14px rgba(170, 242, 202, 0.8); pointer-events: none;"></span>`
    : '';

  // SVG Bus Top-Down Silhouette
  const busSvg = `
    <svg width="22" height="38" viewBox="0 0 24 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">
      <!-- Side Mirrors -->
      <rect x="0.5" y="8" width="2" height="4" rx="1" fill="#162b22" />
      <rect x="21.5" y="8" width="2" height="4" rx="1" fill="#162b22" />
      <!-- Main Chassis -->
      <rect x="2" y="2" width="20" height="38" rx="4.5" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1.8" />
      <!-- Front Windshield -->
      <path d="M 4 7 C 6 4.5, 18 4.5, 20 7 L 20 11 C 18 10, 6 10, 4 11 Z" fill="#99d3b4" />
      <!-- Destination sign / Front headlight indicator -->
      <rect x="8" y="3" width="8" height="2" rx="0.8" fill="#ffffff" opacity="0.9" />
      <!-- Roof AC Unit -->
      <rect x="6.5" y="16" width="11" height="8" rx="2" fill="#1a533c" stroke="${colors.border}" stroke-width="0.8" />
      <line x1="8.5" y1="18.5" x2="15.5" y2="18.5" stroke="#99d3b4" stroke-width="0.8" />
      <line x1="8.5" y1="21.5" x2="15.5" y2="21.5" stroke="#99d3b4" stroke-width="0.8" />
      <!-- Rear lights -->
      <circle cx="5" cy="38" r="1.2" fill="#ba1a1a" />
      <circle cx="19" cy="38" r="1.2" fill="#ba1a1a" />
      <!-- Direction arrow at front -->
      <path d="M 12 1.5 L 14 5 L 10 5 Z" fill="${isSelected ? '#ffdadb' : '#ffffff'}" />
    </svg>
  `;

  // Upright vehicle ID tag (does NOT rotate with heading)
  const uprightLabel = `
    <div style="
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
      font-size: 10px;
      font-weight: 700;
      font-family: 'IBM Plex Sans', sans-serif;
      background: ${colors.labelBg};
      color: #ffffff;
      padding: 1px 6px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.2);
      pointer-events: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 3px;
      direction: ltr;
      z-index: 10;
    ">
      ${isMoving ? `<span style="width: 5px; height: 5px; border-radius: 50%; background: #aaf2ca; display: inline-block;"></span>` : ''}
      <span>${vehicle.id}</span>
    </div>
  `;

  const html = `
    <div class="zg-bus-marker-wrapper" style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${radarWave}
      ${selectionHalo}
      <div class="zg-bus-body-rotate" style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); transform-origin: center; transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);">
        ${busSvg}
      </div>
      ${uprightLabel}
    </div>
  `;

  return L.divIcon({
    className: 'zg-custom-bus-div-icon',
    html,
    iconSize: [48, 48],
    iconAnchor: [24, 24], // exact center anchor
  });
}

export const BusMarker: React.FC<BusMarkerProps> = ({
  vehicle,
  telemetry,
  isSelected,
  onSelect,
}) => {
  const icon = React.useMemo(
    () => createBusDivIcon(vehicle, telemetry, isSelected),
    [vehicle, telemetry, isSelected]
  );

  return (
    <Marker
      position={telemetry.coordinates}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : 100}
      eventHandlers={{
        click: () => onSelect(vehicle.id),
      }}
    >
      <Tooltip direction="top" offset={[0, -24]} opacity={0.98} className="zg-bus-tooltip">
        <div className="p-2 text-right font-sans text-on-surface min-w-[210px] select-none" dir="rtl">
          <div className="flex items-center justify-between pb-1.5 border-b border-outline-variant/30">
            <span className="font-bold text-sm text-primary">{vehicle.id}</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                telemetry.operationalStatus === 'moving'
                  ? 'bg-secondary-container text-on-secondary-container'
                  : telemetry.operationalStatus === 'stopped'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-error-container text-on-error-container'
              }`}
            >
              {telemetry.operationalStatus === 'moving'
                ? 'في الطريق (نشطة)'
                : telemetry.operationalStatus === 'stopped'
                ? 'متوقفة بالمحطة'
                : 'تأخير / تنبيه'}
            </span>
          </div>

          <div className="mt-1.5 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant text-[11px]">اللوحة:</span>
              <span className="font-semibold">{vehicle.plateNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant text-[11px]">الناقل:</span>
              <span className="font-semibold text-secondary">{vehicle.carrierName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant text-[11px]">الموقع:</span>
              <span className="font-medium text-[11px] truncate max-w-[140px]">{telemetry.roadLabel}</span>
            </div>
            <div className="flex items-center justify-between bg-surface-container-low p-1 rounded mt-1">
              <span className="font-bold text-secondary">{telemetry.speed} كم/س</span>
              <span className="text-on-surface-variant text-[11px]">الاتجاه: {telemetry.heading}°</span>
            </div>
          </div>

          <div className="mt-2 pt-1 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
            <span className="text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span>GPS: {telemetry.gpsStatus === 'connected' ? 'متصل' : 'منقطع'}</span>
            </span>
            <span className="text-primary font-bold hover:underline cursor-pointer">انقر للتفاصيل ←</span>
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
};
