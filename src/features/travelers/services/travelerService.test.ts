import { describe, it, expect, beforeEach } from 'vitest';
import { travelerService } from './travelerService';

describe('travelerService', () => {
  beforeEach(() => {
    travelerService._reset();
  });

  it('retrieves default KPIs correctly', () => {
    const kpis = travelerService.getKpis();
    expect(kpis.totalRegistered).toBe(128450);
    expect(kpis.activeAccounts).toBe(114200);
    expect(kpis.inTransitToday).toBe(1840);
    expect(kpis.pendingVerificationCount).toBeGreaterThan(0);
  });

  it('lists travelers with default pagination', () => {
    const res = travelerService.getTravelers();
    expect(res.travelers.length).toBeGreaterThan(0);
    expect(res.page).toBe(1);
    expect(res.total).toBe(res.travelers.length);
  });

  it('filters travelers by search query (name, USR ID, phone)', () => {
    const resName = travelerService.getTravelers({ searchQuery: 'أحمد محمد علي' });
    expect(resName.travelers.length).toBe(1);
    expect(resName.travelers[0].id).toBe('USR-9482');

    const resId = travelerService.getTravelers({ searchQuery: 'USR-7104' });
    expect(resId.travelers.length).toBe(1);
    expect(resId.travelers[0].fullName).toContain('فاطمة');

    const resPhone = travelerService.getTravelers({ searchQuery: '900 112 233' });
    expect(resPhone.travelers.length).toBe(1);
  });

  it('filters travelers by accountStatus and verificationStatus', () => {
    const resSuspended = travelerService.getTravelers({ accountStatus: 'suspended' });
    expect(resSuspended.travelers.some((t) => t.id === 'USR-1082')).toBe(true);

    const resVerified = travelerService.getTravelers({ verificationStatus: 'verified' });
    expect(resVerified.travelers.every((t) => t.verificationStatus === 'verified')).toBe(true);
  });

  it('fetches a traveler by ID', () => {
    const traveler = travelerService.getTravelerById('USR-9482');
    expect(traveler).toBeDefined();
    expect(traveler?.fullName).toBe('أحمد محمد علي');
    expect(traveler?.loyaltyTier).toBe('platinum');
  });

  it('fetches traveler trips and security sessions', () => {
    const trips = travelerService.getTravelerTrips('USR-9482');
    expect(trips.length).toBeGreaterThan(0);
    expect(trips[0].bookingReference).toBe('ZL-854921');

    const activeTrips = travelerService.getTravelerTrips('USR-9482', 'active');
    expect(activeTrips.length).toBe(1);

    const sessions = travelerService.getTravelerSecuritySessions('USR-9482');
    expect(sessions.length).toBe(3);
    expect(sessions[0].deviceName).toContain('iPhone 15');
  });

  it('terminates a session and records a security audit log', () => {
    const success = travelerService.terminateSession('USR-9482', 'SES-882B');
    expect(success).toBe(true);

    const remainingSessions = travelerService.getTravelerSecuritySessions('USR-9482');
    expect(remainingSessions.some((s) => s.id === 'SES-882B')).toBe(false);

    const logs = travelerService.getTravelerSecurityLogs('USR-9482');
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].description).toContain('تم إنهاء جلسة الجهاز');
  });

  it('approves traveler KYC and updates status to active', () => {
    const updated = travelerService.verifyTravelerKyc(
      'USR-1082',
      'approve',
      'تم التحقق من بطاقة الهوية بعد المراجعة اليدوية'
    );
    expect(updated).toBeDefined();
    expect(updated?.verificationStatus).toBe('verified');
    expect(updated?.accountStatus).toBe('active');
    expect(updated?.notes?.[0].content).toContain('موافقة واعتماد');
  });

  it('exports travelers to valid CSV string with UTF-8 BOM', () => {
    const csv = travelerService.exportTravelersCsv();
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('USR-9482');
    expect(csv).toContain('أحمد محمد علي');
  });
});
