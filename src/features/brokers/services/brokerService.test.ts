import { describe, it, expect, beforeEach, vi } from 'vitest';
import { brokerService } from './brokerService';

describe('Broker Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('retrieves default list of brokers with pagination and system metrics', async () => {
    const result = await brokerService.getBrokers({ page: 1, pageSize: 10 });

    expect(result.brokers).toBeDefined();
    expect(result.brokers.length).toBeGreaterThan(0);
    expect(result.totalCount).toBeGreaterThanOrEqual(result.brokers.length);
    expect(result.metrics).toBeDefined();
    expect(result.metrics.totalBrokers).toBeGreaterThan(0);
    expect(result.metrics.lowBalanceCount).toBeGreaterThan(0);
  });

  it('filters brokers by search query matching code, name, branch or manager', async () => {
    // Search by code 'AG-882'
    const byCode = await brokerService.getBrokers({ searchQuery: 'AG-882' });
    expect(byCode.brokers.length).toBe(1);
    expect(byCode.brokers[0].code).toBe('AG-882');
    expect(byCode.brokers[0].name).toContain('النيل');

    // Search by manager
    const byManager = await brokerService.getBrokers({ searchQuery: 'عمر الفاتح' });
    expect(byManager.brokers.length).toBeGreaterThanOrEqual(1);
    expect(byManager.brokers[0].managerName).toContain('عمر الفاتح');
  });

  it('filters brokers with low balance alert (< 500 SDG threshold)', async () => {
    const lowBalance = await brokerService.getBrokers({ status: 'low_balance' });
    expect(lowBalance.brokers.length).toBeGreaterThan(0);
    expect(lowBalance.brokers.every((b) => b.isLowBalanceAlert || b.walletBalance < 500)).toBe(true);

    // Specifically AG-710 should be in low balance
    const safaOffice = lowBalance.brokers.find((b) => b.code === 'AG-710');
    expect(safaOffice).toBeDefined();
    expect(safaOffice?.walletBalance).toBeLessThan(500);
  });

  it('filters brokers by assigned carrier link', async () => {
    const nileBrokers = await brokerService.getBrokers({ carrierId: 'CO-NL-01' });
    expect(nileBrokers.brokers.length).toBeGreaterThan(0);
    expect(
      nileBrokers.brokers.every((b) => b.carrierLinks.some((l) => l.carrierId === 'CO-NL-01'))
    ).toBe(true);
  });

  it('retrieves broker details by ID', async () => {
    const broker = await brokerService.getBrokerById('AG-882');
    expect(broker).not.toBeNull();
    expect(broker?.name).toBe('وكالة النيل للسفر والسياحة');
    expect(broker?.clerks.length).toBeGreaterThan(0);
    expect(broker?.posTerminals.length).toBeGreaterThan(0);
    expect(broker?.walletLedger.length).toBeGreaterThan(0);

    const nonExistent = await brokerService.getBrokerById('AG-NON-EXISTENT');
    expect(nonExistent).toBeNull();
  });

  it('tops up broker wallet, updates balance, ledger, and resolves low balance alert', async () => {
    // Before top-up: AG-710 has low balance (350.00 SDG)
    const before = await brokerService.getBrokerById('AG-710');
    expect(before).not.toBeNull();
    const initialBalance = before!.walletBalance;
    const initialLedgerCount = before!.walletLedger.length;

    // Perform Top-up of 10,000 SDG
    const updated = await brokerService.topUpBrokerWallet(
      'AG-710',
      10000,
      'TRX-BOK-TEST-1234',
      'إيداع تجريبي'
    );

    expect(updated).not.toBeNull();
    expect(updated!.walletBalance).toBe(initialBalance + 10000);
    expect(updated!.isLowBalanceAlert).toBe(false); // Resolved
    expect(updated!.walletLedger.length).toBe(initialLedgerCount + 1);

    // Verify latest transaction in ledger
    const latestTxn = updated!.walletLedger[0];
    expect(latestTxn.direction).toBe('credit');
    expect(latestTxn.amount).toBe(10000);
    expect(latestTxn.relatedReference).toBe('TRX-BOK-TEST-1234');
    expect(latestTxn.balanceAfter).toBe(initialBalance + 10000);
  });

  it('registers a new broker office and opens prepaid wallet', async () => {
    const newBroker = await brokerService.addBroker({
      name: 'وكالة عطبرة للخدمات السريعة',
      branchName: 'المحطة الوسطى — عطبرة',
      city: 'عطبرة',
      state: 'ولاية نهر النيل',
      address: 'شارع الجمهورية، عمارة الأوقاف',
      phone: '+249 181 990 011',
      email: 'atbara@agency.sd',
      status: 'active',
      statusLabel: 'معتمد ونشط',
      licenseNumber: 'LIC-AG-ATB-01',
      commercialRegistrationNumber: 'CR-77120',
      licenseExpiryDate: '2026-12-31',
      accreditedSince: '2024-10-24',
      accreditationAuthority: 'هيئة النقل البري',
      walletBalance: 15000,
      minimumBalanceAlertThreshold: 500,
      isLowBalanceAlert: false,
      unsettledAccruedCommissionSdg: 0,
      activeSettlementCycle: '#W-44 (2024)',
      todaySalesSdg: 0,
      todayTicketsCount: 0,
      clerksCount: 1,
      posCount: 1,
      assignedCarriersCount: 1,
      managerName: 'عادل يوسف',
      managerPhone: '+249 912 888 777',
    });

    expect(newBroker).toBeDefined();
    expect(newBroker.id).toContain('AG-');
    expect(newBroker.walletBalance).toBe(15000);
    expect(newBroker.clerks).toBeDefined();
    expect(newBroker.posTerminals).toBeDefined();

    // Check retrieval
    const retrieved = await brokerService.getBrokerById(newBroker.id);
    expect(retrieved).not.toBeNull();
  });
});
