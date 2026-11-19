import { describe, it, expect } from 'vitest';
import { settlementService } from './settlementService';

describe('SettlementService', () => {
  it('returns initial batches with 4 pending batches matching badge', () => {
    const { batches, metrics } = settlementService.getBatches();
    expect(batches.length).toBeGreaterThanOrEqual(4);
    expect(metrics.pendingBatchesCount).toBe(4);
    expect(metrics.totalPendingSettlementsSdg).toBeGreaterThan(0);
    expect(metrics.reconciliationAccuracyPercent).toBe(99.8);
  });

  it('filters batches by status accurately', () => {
    const { batches } = settlementService.getBatches({ status: 'pending_approval' });
    expect(batches.every((b) => b.status === 'pending_approval')).toBe(true);
  });

  it('filters batches by search query matching batch title or ID', () => {
    const { batches } = settlementService.getBatches({ searchQuery: 'الأسبوع 42' });
    expect(batches.some((b) => b.id === 'STL-2024-W42')).toBe(true);
  });

  it('retrieves detailed batch with carrier items', () => {
    const batch = settlementService.getBatchDetails('STL-2024-W42');
    expect(batch).toBeDefined();
    expect(batch?.carrierItems.length).toBeGreaterThanOrEqual(3);
    expect(batch?.carrierItems[0].carrierName).toContain('شركة النيل');
  });

  it('approves and disburses a batch, generating bank reference and GL entry', () => {
    const disbursed = settlementService.approveAndDisburseBatch(
      'STL-2024-W42',
      'هشام كمال الدين الفكي (ADM-004)',
      'حساب بنك الخرطوم المركزي'
    );
    expect(disbursed.status).toBe('disbursed');
    expect(disbursed.bankReference).toMatch(/^BOK-BULK-\d+/);
    expect(disbursed.journalEntryRef).toMatch(/^GL-SETTLE-/);
    expect(disbursed.approvedBy).toContain('هشام كمال الدين');

    const { metrics } = settlementService.getBatches();
    expect(metrics.pendingBatchesCount).toBe(3);
  });

  it('credits broker commission directly to prepaid wallet', () => {
    const item = settlementService.creditCommissionToBrokerWallet('AG-882', 119700.0);
    expect(item.status).toBe('credited_to_wallet');
    expect(item.paymentReference).toMatch(/^WLT-COMM-/);
    expect(item.walletBalanceSdg).toBeGreaterThan(15150.0);
  });

  it('marks broker commission as transferred via bankak', () => {
    const item = settlementService.disburseBrokerCommissionBank('AG-305');
    expect(item.status).toBe('transferred');
    expect(item.paymentReference).toMatch(/^BOK-TXN-/);
  });

  it('disburses carrier payout with bank reference', () => {
    const item = settlementService.disburseCarrierPayout('CAR-002', 'BOK-PAY-9921');
    expect(item.status).toBe('transferred');
    expect(item.paymentReference).toBe('BOK-PAY-9921');
  });

  it('exports batch to Bankak bulk transfer CSV with UTF-8 BOM', () => {
    const csv = settlementService.exportBatchBankakCsv('STL-2024-W41-BRK');
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('وكالة النيل للسفر والسياحة');
    expect(csv).toContain('بنك الخرطوم (بنكك)');
  });
});
