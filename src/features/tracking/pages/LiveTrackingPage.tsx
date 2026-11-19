import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  TrackingFiltersState,
  CorridorId,
  LiveTelemetry,
  FleetTrackingMetrics,
} from '../types/tracking';
import { mockVehicles, mockTrips, mockInitialFleetMetrics } from '../fixtures/trackingFixtures';
import { telemetryService } from '../services/telemetrySimulator';
import { FleetMap } from '../components/FleetMap';
import { TrackingMetricsHeader } from '../components/TrackingMetricsHeader';
import { TrackingFilters } from '../components/TrackingFilters';
import { VehicleDetailsDrawer } from '../components/VehicleDetailsDrawer';
import { BottomCorridorSummary } from '../components/BottomCorridorSummary';

export const LiveTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const selectedVehicleId = searchParams.get('busId');
  const corridorParam = (searchParams.get('corridor') as CorridorId) || 'all';

  const [filters, setFilters] = React.useState<TrackingFiltersState>({
    searchQuery: searchParams.get('q') || '',
    carrierId: searchParams.get('carrier') || '',
    corridorId: corridorParam,
    operationalStatus: searchParams.get('status') || '',
    gpsStatus: searchParams.get('gps') || '',
  });

  // Telemetry real-time state from simulation service
  const [telemetryMap, setTelemetryMap] = React.useState<Map<string, LiveTelemetry>>(
    () => new Map()
  );

  // Subscribe to telemetry service
  React.useEffect(() => {
    const unsubscribe = telemetryService.subscribe((updatedMap) => {
      setTelemetryMap(updatedMap);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Update URL params when filters or selection change
  const updateUrlParams = React.useCallback(
    (newBusId: string | null, newFilters: TrackingFiltersState) => {
      const nextParams = new URLSearchParams();
      if (newBusId) nextParams.set('busId', newBusId);
      if (newFilters.corridorId && newFilters.corridorId !== 'all') {
        nextParams.set('corridor', newFilters.corridorId);
      }
      if (newFilters.searchQuery.trim()) {
        nextParams.set('q', newFilters.searchQuery.trim());
      }
      if (newFilters.carrierId) nextParams.set('carrier', newFilters.carrierId);
      if (newFilters.operationalStatus) nextParams.set('status', newFilters.operationalStatus);
      if (newFilters.gpsStatus) nextParams.set('gps', newFilters.gpsStatus);

      setSearchParams(nextParams, { replace: true });
    },
    [setSearchParams]
  );

  const handleSelectVehicle = (vehicleId: string) => {
    updateUrlParams(vehicleId, filters);
  };

  const handleCloseDrawer = () => {
    updateUrlParams(null, filters);
  };

  const handleFiltersChange = (newFilters: TrackingFiltersState) => {
    setFilters(newFilters);
    updateUrlParams(selectedVehicleId, newFilters);
  };

  const handleClearFilters = () => {
    const cleared: TrackingFiltersState = {
      searchQuery: '',
      carrierId: '',
      corridorId: 'all',
      operationalStatus: '',
      gpsStatus: '',
    };
    setFilters(cleared);
    updateUrlParams(selectedVehicleId, cleared);
  };

  // Filter vehicles according to active criteria
  const filteredVehicles = React.useMemo(() => {
    return mockVehicles.filter((vehicle) => {
      const telemetry = telemetryMap.get(vehicle.id);
      const trip = mockTrips.find((t) => t.vehicleId === vehicle.id);

      // Search query filter (Bus ID, Plate, Driver, or Trip ID)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.trim().toLowerCase();
        const matchesId = vehicle.id.toLowerCase().includes(q);
        const matchesPlate = vehicle.plateNumber.toLowerCase().includes(q);
        const matchesDriver = vehicle.driverName.toLowerCase().includes(q);
        const matchesTrip = trip?.id.toLowerCase().includes(q);
        if (!matchesId && !matchesPlate && !matchesDriver && !matchesTrip) return false;
      }

      // Carrier filter
      if (filters.carrierId && vehicle.carrierId !== filters.carrierId) {
        return false;
      }

      // Corridor filter
      if (filters.corridorId !== 'all') {
        if (!trip || trip.corridorId !== filters.corridorId) return false;
      }

      // Operational Status filter
      if (filters.operationalStatus) {
        if (telemetry?.operationalStatus !== filters.operationalStatus) return false;
      }

      // GPS Status filter
      if (filters.gpsStatus) {
        if (telemetry?.gpsStatus !== filters.gpsStatus) return false;
      }

      return true;
    });
  }, [filters, telemetryMap]);

  // Selected vehicle & trip metadata
  const selectedVehicle = React.useMemo(
    () => mockVehicles.find((v) => v.id === selectedVehicleId),
    [selectedVehicleId]
  );
  const selectedTelemetry = selectedVehicleId ? telemetryMap.get(selectedVehicleId) : undefined;
  const selectedTrip = React.useMemo(
    () => mockTrips.find((t) => t.vehicleId === selectedVehicleId),
    [selectedVehicleId]
  );

  // Compute live metrics from actual vehicles & telemetry
  const liveMetrics: FleetTrackingMetrics = React.useMemo(() => {
    let moving = 0;
    let stopped = 0;
    let delayed = 0;
    let alerts = 0;
    let disconnected = 0;
    let totalSpeed = 0;
    let speedCount = 0;

    mockVehicles.forEach((v) => {
      const telem = telemetryMap.get(v.id);
      if (!telem) return;
      if (telem.gpsStatus === 'disconnected') disconnected++;
      else if (telem.operationalStatus === 'moving') {
        moving++;
        totalSpeed += telem.speed;
        speedCount++;
      } else if (telem.operationalStatus === 'stopped') {
        stopped++;
      }
      if (telem.operationalStatus === 'delayed') delayed++;
    });

    alerts = delayed > 0 ? 1 : 0;
    const avgFleetSpeed = speedCount > 0 ? Math.round(totalSpeed / speedCount) : 82;

    return {
      totalMonitored: mockVehicles.length,
      activeOnRoute: moving > 0 ? moving : mockInitialFleetMetrics.activeOnRoute,
      stoppedAtStation: stopped > 0 ? stopped : mockInitialFleetMetrics.stoppedAtStation,
      delayed: delayed > 0 ? delayed : mockInitialFleetMetrics.delayed,
      operationalAlerts: alerts,
      gpsDisconnected: disconnected,
      avgFleetSpeed,
      totalActivePassengers: 1140,
    };
  }, [telemetryMap]);

  return (
    <div className="flex flex-col gap-space-md w-full animate-in fade-in-50 duration-300">
      {/* 1. Header & Live Telemetry KPI Matrix */}
      <TrackingMetricsHeader
        metrics={liveMetrics}
        onRefresh={() => {
          // Trigger immediate snapshot update
          const snapshot = telemetryService.getAllLatestTelemetry();
          const map = new Map<string, LiveTelemetry>();
          snapshot.forEach((item) => map.set(item.vehicleId, item));
          setTelemetryMap(map);
        }}
      />

      {/* 2. Compact Search & Filters Toolbar */}
      <TrackingFilters
        filters={filters}
        onChange={handleFiltersChange}
        onClear={handleClearFilters}
        filteredCount={filteredVehicles.length}
        totalCount={mockVehicles.length}
      />

      {/* 3. Primary Interactive Cartographic Surface */}
      <div className="relative w-full">
        {/* No-results overlay message if filtered to zero buses */}
        {filteredVehicles.length === 0 && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[420] px-4 py-2.5 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-md border border-amber-300 shadow-modal text-xs font-semibold text-amber-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-700">filter_alt</span>
            <span>لا توجد حافلات تطابق معايير التصفية الحالية. تم إبقاء الخريطة نشطة.</span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-2 py-0.5 rounded-lg bg-amber-200 hover:bg-amber-300 font-bold text-[11px]"
            >
              إعادة ضبط
            </button>
          </div>
        )}

        {/* The Leaflet Map Canvas */}
        <FleetMap
          vehicles={filteredVehicles}
          telemetryMap={telemetryMap}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={handleSelectVehicle}
          selectedTrip={selectedTrip}
          selectedCorridorId={filters.corridorId}
          isSidebarCollapsed={false}
          hasDrawerOpen={Boolean(selectedVehicle && selectedTelemetry)}
        />

        {/* Selected-Bus Details Drawer on the Map */}
        {selectedVehicle && selectedTelemetry && (
          <VehicleDetailsDrawer
            vehicle={selectedVehicle}
            telemetry={selectedTelemetry}
            trip={selectedTrip}
            onClose={handleCloseDrawer}
          />
        )}
      </div>

      {/* 4. Bottom Operational Summary Strip */}
      <BottomCorridorSummary />
    </div>
  );
};
