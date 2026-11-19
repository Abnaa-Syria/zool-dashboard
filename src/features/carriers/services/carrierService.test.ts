import { describe, it, expect, beforeEach, vi } from 'vitest';
import { carrierService } from './carrierService';

describe('Carrier Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('retrieves default list of transport carriers with correct pagination and metrics', async () => {
    const result = await carrierService.getCarriers({ page: 1, pageSize: 10 });

    expect(result.carriers).toBeDefined();
    expect(result.carriers.length).toBeGreaterThan(0);
    expect(result.totalCount).toBeGreaterThanOrEqual(result.carriers.length);
    expect(result.metrics).toBeDefined();
    expect(result.metrics.totalCarriers).toBeGreaterThan(0);
    expect(result.metrics.gpsConnectedBuses).toBeGreaterThan(0);
  });

  it('filters carriers by search query matching code, name, or commercial registration', async () => {
    // Search by code 'TC-001'
    const byCode = await carrierService.getCarriers({ searchQuery: 'TC-001' });
    expect(byCode.carriers.length).toBe(1);
    expect(byCode.carriers[0].code).toBe('TC-001');
    expect(byCode.carriers[0].name).toContain('النيل');

    // Search by commercial registration
    const byCrn = await carrierService.getCarriers({ searchQuery: 'CR-104928' });
    expect(byCrn.carriers.length).toBe(1);
    expect(byCrn.carriers[0].commercialRegistrationNumber).toBe('CR-104928');
  });

  it('filters carriers by operational status', async () => {
    const activeResult = await carrierService.getCarriers({ status: 'active' });
    expect(activeResult.carriers.every((c) => c.status === 'active')).toBe(true);

    const reviewResult = await carrierService.getCarriers({ status: 'under_review' });
    expect(reviewResult.carriers.every((c) => c.status === 'under_review')).toBe(true);
  });

  it('filters carriers by active trips and linked brokers', async () => {
    const withTrips = await carrierService.getCarriers({ activeTripsOnly: true });
    expect(withTrips.carriers.every((c) => c.activeTripsNowCount > 0)).toBe(true);

    const withBrokers = await carrierService.getCarriers({ linkedBrokersOnly: true });
    expect(withBrokers.carriers.every((c) => c.linkedBrokersCount > 0)).toBe(true);
  });

  it('retrieves carrier details by ID or code', async () => {
    const carrier = await carrierService.getCarrierById('CO-NL-01');
    expect(carrier).not.toBeNull();
    expect(carrier?.code).toBe('TC-001');
    expect(carrier?.routes.length).toBeGreaterThan(0);
    expect(carrier?.assignedBrokers.length).toBeGreaterThan(0);

    const byCode = await carrierService.getCarrierById('TC-001');
    expect(byCode?.id).toBe('CO-NL-01');

    const nonExistent = await carrierService.getCarrierById('NON-EXISTENT-ID');
    expect(nonExistent).toBeNull();
  });

  it('assigns broker to carrier and records an audit log entry', async () => {
    const updated = await carrierService.assignBrokerToCarrier('CO-NL-01', {
      brokerId: 'AG-999',
      brokerName: 'مكتب الخرطوم الدولي',
      brokerBranch: 'الخرطوم 2',
      commissionRatePercent: 12.0,
      authorizedRoutesCount: 10,
      status: 'active',
    });

    expect(updated).not.toBeNull();
    const assigned = updated?.assignedBrokers.find((b) => b.brokerId === 'AG-999');
    expect(assigned).toBeDefined();
    expect(assigned?.commissionRatePercent).toBe(12.0);

    // Check audit history updated
    const auditEntry = updated?.commissionHistory.find((h) => h.brokerId === 'AG-999');
    expect(auditEntry).toBeDefined();
    expect(auditEntry?.newRatePercent).toBe(12.0);
  });

  it('adds a new transport carrier successfully', async () => {
    const newCarrier = await carrierService.addCarrier({
      name: 'شركة الجزيرة إكسبريس',
      commercialName: 'الجزيرة للنقل السريع المحدودة',
      commercialRegistrationNumber: 'CR-882103',
      city: 'ود مدني',
      state: 'ولاية الجزيرة',
      phone: '+249 155 123 456',
    });

    expect(newCarrier).toBeDefined();
    expect(newCarrier.id).toContain('CO-AUTO-');
    expect(newCarrier.code).toContain('TC-');
    expect(newCarrier.name).toBe('شركة الجزيرة إكسبريس');

    // Retrieve again to ensure in memory
    const retrieved = await carrierService.getCarrierById(newCarrier.id);
    expect(retrieved).not.toBeNull();
  });
});
