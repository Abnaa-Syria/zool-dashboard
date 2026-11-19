import { describe, it, expect } from 'vitest';
import { telemetryService } from './telemetrySimulator';

describe('Telemetry Simulator Service', () => {
  it('returns all latest telemetry with valid Sudanese coordinates', () => {
    const list = telemetryService.getAllLatestTelemetry();
    expect(list.length).toBeGreaterThan(0);

    const bus018 = telemetryService.getTelemetry('ZG-BUS-018');
    expect(bus018).toBeDefined();
    expect(bus018?.coordinates[0]).toBeGreaterThan(15); // Latitude within Sudan
    expect(bus018?.coordinates[1]).toBeGreaterThan(30); // Longitude within Sudan
    expect(bus018?.speed).toBeGreaterThan(0);
    expect(bus018?.operationalStatus).toBe('moving');
  });

  it('keeps disconnected bus at last known position with stale status', () => {
    const bus033 = telemetryService.getTelemetry('ZG-BUS-033');
    expect(bus033).toBeDefined();
    expect(bus033?.gpsStatus).toBe('disconnected');
    expect(bus033?.speed).toBe(0);
  });

  it('subscribes to telemetry stream and notifies on updates', () => {
    let received = false;
    const unsub = telemetryService.subscribe((map) => {
      if (map.size > 0) {
        received = true;
      }
    });

    expect(received).toBe(true);
    unsub();
  });

  it('toggles simulation pause and resume state', () => {
    const initial = telemetryService.isPaused();
    const toggled = telemetryService.togglePause();
    expect(toggled).toBe(!initial);
    expect(telemetryService.isPaused()).toBe(!initial);
    // restore
    telemetryService.togglePause();
  });

  it('returns recent tracking pings for a vehicle', () => {
    const pings = telemetryService.getTelemetryPings('ZG-BUS-018');
    expect(pings.length).toBeGreaterThan(0);
    expect(pings[0].vehicleId).toBe('ZG-BUS-018');
  });
});
