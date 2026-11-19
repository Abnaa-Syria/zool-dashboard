import type {
  LiveTelemetry,
  TelemetryPing,
  OperationalStatus,
  TripStatus,
  GpsConnectionStatus,
  SignalQuality,
} from '../types/tracking';
import {
  CORRIDOR_ROUTES,
  calculateHaversineKm,
  calculateHeading,
} from '../fixtures/geoRoutes';
import { mockPingsForBus018 } from '../fixtures/trackingFixtures';

export interface SimulatedVehicleState {
  vehicleId: string;
  routeId: string;
  currentDistanceKm: number;
  speedKmH: number;
  speedLimit: number;
  altitudeMeters: number;
  operationalStatus: OperationalStatus;
  tripStatus: TripStatus;
  gpsStatus: GpsConnectionStatus;
  signalQuality: SignalQuality;
  batteryVoltage: number;
  engineOn: boolean;
  fixedTimestamp?: string;
}

export interface ITelemetryService {
  subscribe(callback: (telemetry: Map<string, LiveTelemetry>) => void): () => void;
  getTelemetry(vehicleId: string): LiveTelemetry | undefined;
  getAllLatestTelemetry(): LiveTelemetry[];
  getTelemetryPings(vehicleId: string): TelemetryPing[];
  isSimulated(): boolean;
  getSpeedMultiplier(): number;
  setSpeedMultiplier(multiplier: number): void;
  togglePause(): boolean;
  isPaused(): boolean;
}

// Pre-calculate cumulative distances for each route
interface RouteWithDistances {
  id: string;
  waypoints: [number, number][];
  cumulativeKm: number[];
  totalKm: number;
}

const routesMap = new Map<string, RouteWithDistances>();

CORRIDOR_ROUTES.forEach((route) => {
  const cumulativeKm: number[] = [0];
  let total = 0;
  for (let i = 0; i < route.waypoints.length - 1; i++) {
    const dist = calculateHaversineKm(route.waypoints[i], route.waypoints[i + 1]);
    total += dist;
    cumulativeKm.push(total);
  }
  routesMap.set(route.id, {
    id: route.id,
    waypoints: route.waypoints,
    cumulativeKm,
    totalKm: total,
  });
});

/**
 * Finds [lat, lng], segment heading, and road label along a polyline at a given distance in km.
 */
function interpolateAtDistance(
  route: RouteWithDistances,
  distKm: number
): { coordinates: [number, number]; heading: number; segmentIndex: number } {
  const clampedDist = Math.max(0, Math.min(distKm, route.totalKm));
  const waypoints = route.waypoints;
  const cum = route.cumulativeKm;

  // Find segment
  let segIdx = 0;
  for (let i = 0; i < cum.length - 1; i++) {
    if (clampedDist >= cum[i] && clampedDist <= cum[i + 1]) {
      segIdx = i;
      break;
    }
  }

  const p1 = waypoints[segIdx];
  const p2 = waypoints[Math.min(segIdx + 1, waypoints.length - 1)];
  const segDist = cum[segIdx + 1] - cum[segIdx];
  const fraction = segDist > 0 ? (clampedDist - cum[segIdx]) / segDist : 0;

  const lat = p1[0] + (p2[0] - p1[0]) * fraction;
  const lng = p1[1] + (p2[1] - p1[1]) * fraction;
  const heading = calculateHeading(p1, p2);

  return { coordinates: [lat, lng], heading, segmentIndex: segIdx };
}

function formatCurrentTime(date: Date = new Date()): string {
  return date.toTimeString().split(' ')[0]; // HH:mm:ss
}

class TelemetrySimulatorImpl implements ITelemetryService {
  private subscribers = new Set<(telemetry: Map<string, LiveTelemetry>) => void>();
  private vehicleStates = new Map<string, SimulatedVehicleState>();
  private latestTelemetry = new Map<string, LiveTelemetry>();
  private intervalId: number | null = null;
  private speedMultiplier = 15; // 15x real time for smooth demonstration
  private paused = false;
  private lastTickTime = Date.now();

  constructor() {
    this.initializeVehicles();
    this.generateTelemetrySnapshot();
  }

  private initializeVehicles() {
    // 1. ZG-BUS-018: Flagship on Sharyan Al-Shamal (Moving ~165 km into 350 km trip)
    this.vehicleStates.set('ZG-BUS-018', {
      vehicleId: 'ZG-BUS-018',
      routeId: 'route-krt-mrw',
      currentDistanceKm: 165,
      speedKmH: 85,
      speedLimit: 100,
      altitudeMeters: 362,
      operationalStatus: 'moving',
      tripStatus: 'on_route',
      gpsStatus: 'connected',
      signalQuality: 'excellent',
      batteryVoltage: 13.8,
      engineOn: true,
    });

    // 2. ZG-BUS-042: Express on Challenge Highway towards Port Sudan (Moving ~410 km into 810 km trip)
    this.vehicleStates.set('ZG-BUS-042', {
      vehicleId: 'ZG-BUS-042',
      routeId: 'route-krt-ptsd',
      currentDistanceKm: 410,
      speedKmH: 92,
      speedLimit: 100,
      altitudeMeters: 510,
      operationalStatus: 'moving',
      tripStatus: 'on_route',
      gpsStatus: 'connected',
      signalQuality: 'excellent',
      batteryVoltage: 14.1,
      engineOn: true,
    });

    // 3. ZG-BUS-011: Stopped at Shendi Station (~125 km into trip)
    this.vehicleStates.set('ZG-BUS-011', {
      vehicleId: 'ZG-BUS-011',
      routeId: 'route-krt-mrw',
      currentDistanceKm: 125,
      speedKmH: 0,
      speedLimit: 100,
      altitudeMeters: 358,
      operationalStatus: 'stopped',
      tripStatus: 'delayed',
      gpsStatus: 'connected',
      signalQuality: 'good',
      batteryVoltage: 13.5,
      engineOn: false,
    });

    // 4. ZG-BUS-005: At Khartoum Terminal preparing for departure
    this.vehicleStates.set('ZG-BUS-005', {
      vehicleId: 'ZG-BUS-005',
      routeId: 'route-krt-ksl',
      currentDistanceKm: 5,
      speedKmH: 0,
      speedLimit: 80,
      altitudeMeters: 380,
      operationalStatus: 'stopped',
      tripStatus: 'boarding',
      gpsStatus: 'connected',
      signalQuality: 'good',
      batteryVoltage: 12.9,
      engineOn: false,
    });

    // 5. ZG-BUS-009: Towards Dongola (Moving ~275 km)
    this.vehicleStates.set('ZG-BUS-009', {
      vehicleId: 'ZG-BUS-009',
      routeId: 'route-krt-mrw',
      currentDistanceKm: 275,
      speedKmH: 78,
      speedLimit: 100,
      altitudeMeters: 415,
      operationalStatus: 'moving',
      tripStatus: 'on_route',
      gpsStatus: 'connected',
      signalQuality: 'excellent',
      batteryVoltage: 13.9,
      engineOn: true,
    });

    // 6. ZG-BUS-033: Western Corridor (GPS disconnected 18 mins ago)
    this.vehicleStates.set('ZG-BUS-033', {
      vehicleId: 'ZG-BUS-033',
      routeId: 'route-krt-ebd',
      currentDistanceKm: 340,
      speedKmH: 0,
      speedLimit: 90,
      altitudeMeters: 450,
      operationalStatus: 'delayed',
      tripStatus: 'delayed',
      gpsStatus: 'disconnected',
      signalQuality: 'lost',
      batteryVoltage: 11.8,
      engineOn: false,
      fixedTimestamp: '14:18:20 (انقطاع 18 د)',
    });

    // 7. ZG-BUS-027: East route towards Kassala (Moving ~320 km)
    this.vehicleStates.set('ZG-BUS-027', {
      vehicleId: 'ZG-BUS-027',
      routeId: 'route-krt-ksl',
      currentDistanceKm: 320,
      speedKmH: 88,
      speedLimit: 100,
      altitudeMeters: 490,
      operationalStatus: 'moving',
      tripStatus: 'on_route',
      gpsStatus: 'connected',
      signalQuality: 'good',
      batteryVoltage: 14.0,
      engineOn: true,
    });
  }

  private generateTelemetrySnapshot() {
    const now = new Date();
    const timeStr = formatCurrentTime(now);

    this.vehicleStates.forEach((state) => {
      const route = routesMap.get(state.routeId);
      if (!route) return;

      const { coordinates, heading } = interpolateAtDistance(route, state.currentDistanceKm);
      const remainingKm = Math.max(0, Math.round(route.totalKm - state.currentDistanceKm));
      const progressPercent = Math.min(100, Math.round((state.currentDistanceKm / route.totalKm) * 100));

      let roadLabel = '';
      if (state.routeId === 'route-krt-mrw') {
        roadLabel = `طريق شريان الشمال — الكيلو ${Math.round(state.currentDistanceKm)}`;
      } else if (state.routeId === 'route-krt-ptsd') {
        roadLabel = `طريق التحدي القومي — الكيلو ${Math.round(state.currentDistanceKm)}`;
      } else if (state.routeId === 'route-krt-ksl') {
        roadLabel = `طريق الشرق الزراعي — الكيلو ${Math.round(state.currentDistanceKm)}`;
      } else {
        roadLabel = `طريق كوستي الغربي — الكيلو ${Math.round(state.currentDistanceKm)}`;
      }

      this.latestTelemetry.set(state.vehicleId, {
        vehicleId: state.vehicleId,
        timestamp: state.fixedTimestamp || timeStr,
        coordinates,
        heading: Math.round(heading),
        speed: state.speedKmH,
        speedLimit: state.speedLimit,
        altitude: state.altitudeMeters,
        roadLabel,
        operationalStatus: state.operationalStatus,
        tripStatus: state.tripStatus,
        gpsStatus: state.gpsStatus,
        signalQuality: state.signalQuality,
        distanceCoveredKm: Math.round(state.currentDistanceKm),
        distanceRemainingKm: remainingKm,
        routeProgressPercent: progressPercent,
        batteryVoltage: state.batteryVoltage,
        engineOn: state.engineOn,
        lastPingAgeSeconds: state.gpsStatus === 'disconnected' ? 1080 : 12,
      });
    });
  }

  private tick() {
    if (this.paused) return;

    const now = Date.now();
    const dtSeconds = (now - this.lastTickTime) / 1000;
    this.lastTickTime = now;

    // Advance distance of moving vehicles
    this.vehicleStates.forEach((state) => {
      if (state.operationalStatus === 'moving' && state.speedKmH > 0) {
        const route = routesMap.get(state.routeId);
        if (!route) return;

        // Subtle realistic speed oscillation (+/- 2 km/h)
        const speedJitter = (Math.random() - 0.5) * 2;
        const currentSpeed = Math.max(60, Math.min(state.speedLimit, state.speedKmH + speedJitter));
        state.speedKmH = Math.round(currentSpeed);

        const deltaKm = (currentSpeed * (dtSeconds / 3600)) * this.speedMultiplier;
        state.currentDistanceKm += deltaKm;

        // If reached destination, stop at terminus gracefully (no teleport)
        if (state.currentDistanceKm >= route.totalKm) {
          state.currentDistanceKm = route.totalKm;
          state.speedKmH = 0;
          state.operationalStatus = 'arrived';
          state.tripStatus = 'completed';
        }
      }
    });

    this.generateTelemetrySnapshot();
    this.notifySubscribers();
  }

  private startTimer() {
    if (this.intervalId === null && typeof window !== 'undefined') {
      this.lastTickTime = Date.now();
      this.intervalId = window.setInterval(() => this.tick(), 1200);
    }
  }

  private stopTimer() {
    if (this.intervalId !== null && typeof window !== 'undefined') {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private notifySubscribers() {
    const snapshot = new Map(this.latestTelemetry);
    this.subscribers.forEach((cb) => {
      try {
        cb(snapshot);
      } catch (err) {
        console.error('Telemetry subscriber error:', err);
      }
    });
  }

  public subscribe(callback: (telemetry: Map<string, LiveTelemetry>) => void): () => void {
    this.subscribers.add(callback);
    // Immediately emit current snapshot
    callback(new Map(this.latestTelemetry));

    if (this.subscribers.size === 1) {
      this.startTimer();
    }

    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this.stopTimer();
      }
    };
  }

  public getTelemetry(vehicleId: string): LiveTelemetry | undefined {
    return this.latestTelemetry.get(vehicleId);
  }

  public getAllLatestTelemetry(): LiveTelemetry[] {
    return Array.from(this.latestTelemetry.values());
  }

  public getTelemetryPings(vehicleId: string): TelemetryPing[] {
    if (vehicleId === 'ZG-BUS-018') {
      return mockPingsForBus018;
    }
    const current = this.latestTelemetry.get(vehicleId);
    if (!current) return [];

    return [
      {
        id: `ping-${vehicleId}-1`,
        vehicleId,
        timestamp: current.timestamp,
        coordinates: current.coordinates,
        roadLabel: current.roadLabel,
        speed: current.speed,
        operationalStatus: current.operationalStatus,
        gpsStatus: current.gpsStatus,
        signalQuality: current.signalQuality,
        event: 'بث لحظي نشط',
      },
    ];
  }

  public isSimulated(): boolean {
    return true;
  }

  public getSpeedMultiplier(): number {
    return this.speedMultiplier;
  }

  public setSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = multiplier;
  }

  public togglePause(): boolean {
    this.paused = !this.paused;
    if (!this.paused) {
      this.lastTickTime = Date.now();
    }
    return this.paused;
  }

  public isPaused(): boolean {
    return this.paused;
  }
}

// Global singleton instance for simulated telemetry
export const telemetryService: ITelemetryService = new TelemetrySimulatorImpl();
