import { describe, it, expect, beforeEach } from 'vitest';
import { financialService } from './financialService';

describe('financialService', () => {
  beforeEach(() => {
    financialService._reset();
  });

  it('retrieves default wallets liquidity metrics correctly', () => {
    const metrics = financialService.getWalletsMetrics();
    expect(metrics.totalWalletsCount).toBeGreaterThan(0);
    expect(metrics.circulatingPercent).toBe(88);
    expect(metrics.insurancePercent).toBe(12);
    expect(metrics.reserveCoverageRatio).toBe(1.8);
  });

  it('filters wallets by search query and status', () => {
    const resSearch = financialService.getWallets({ searchQuery: 'AG-882' });
    expect(resSearch.wallets.length).toBe(1);
    expect(resSearch.wallets[0].brokerName).toContain('النيل');

    const resCritical = financialService.getWallets({ status: 'critical' });
    expect(resCritical.wallets.some((w) => w.brokerId === 'AG-114')).toBe(true);
  });

  it('records an exceptional top-up and updates wallet balance & ledger entry', () => {
    const initialWallet = financialService.getWalletByBrokerId('AG-114');
    expect(initialWallet?.status).toBe('critical');

    const result = financialService.recordTopUp(
      'AG-114',
      10000,
      'sadad',
      'REF-TEST-999',
      'شحن رصيد تجريبي'
    );

    expect(result).toBeDefined();
    expect(result?.wallet.currentBalanceSdg).toBe(10420);
    expect(result?.wallet.status).toBe('safe');
    expect(result?.ledgerEntry.amountSdg).toBe(10000);

    const ledger = financialService.getLedgerEntries({ searchQuery: 'AG-114' });
    expect(ledger.entries.length).toBeGreaterThan(0);
  });

  it('retrieves general ledger entries and filters by transaction type', () => {
    const entries = financialService.getLedgerEntries();
    expect(entries.entries.length).toBeGreaterThan(0);

    const ticketDebits = financialService.getLedgerEntries({ transactionType: 'ticket_debit' });
    expect(ticketDebits.entries.every((e) => e.type === 'ticket_debit')).toBe(true);
  });

  it('fetches single ledger entry by ID with double-entry legs', () => {
    const entry = financialService.getLedgerEntryById('WLT-TXN-449102');
    expect(entry).toBeDefined();
    expect(entry?.doubleEntryLegs.length).toBe(3);
    const debitTotal = entry?.doubleEntryLegs
      .filter((l) => l.type === 'debit')
      .reduce((sum, l) => sum + l.amountSdg, 0);
    const creditTotal = entry?.doubleEntryLegs
      .filter((l) => l.type === 'credit')
      .reduce((sum, l) => sum + l.amountSdg, 0);
    expect(debitTotal).toBe(creditTotal);
  });

  it('approves a pending top-up request from queue and credits the broker wallet', () => {
    const queueBefore = financialService.getTopUpQueue();
    const target = queueBefore.find((r) => r.id === 'REQ-TOP-104');
    expect(target?.status).toBe('pending');

    const initialWallet = financialService.getWalletByBrokerId(target!.brokerId);
    const initialBalance = initialWallet!.currentBalanceSdg;

    const approved = financialService.approveTopUpRequest('REQ-TOP-104', 'المشرف المالي');
    expect(approved).toBe(true);

    const updatedWallet = financialService.getWalletByBrokerId(target!.brokerId);
    expect(updatedWallet?.currentBalanceSdg).toBe(initialBalance + target!.amountSdg);
  });

  it('exports wallets and ledger to valid UTF-8 CSV with BOM', () => {
    const walletsCsv = financialService.exportWalletsCsv();
    expect(walletsCsv.startsWith('\uFEFF')).toBe(true);
    expect(walletsCsv).toContain('AG-882');

    const ledgerCsv = financialService.exportLedgerCsv();
    expect(ledgerCsv.startsWith('\uFEFF')).toBe(true);
    expect(ledgerCsv).toContain('WLT-TXN-449102');
  });
});
