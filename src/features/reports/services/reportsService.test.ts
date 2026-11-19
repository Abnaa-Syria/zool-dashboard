import { describe, it, expect } from 'vitest';
import { reportsService } from './reportsService';

describe('Reports Service', () => {
  it('returns comprehensive dashboard financial metrics', () => {
    const metrics = reportsService.getDashboardMetrics();
    expect(metrics.gmvTotalSdg).toBeGreaterThan(40000000);
    expect(metrics.takeRatePercent).toBe(5.0);
    expect(metrics.cashFlowWeeks).toHaveLength(5);
    expect(metrics.routeCorridors).toHaveLength(4);
    expect(metrics.salesChannels).toHaveLength(3);
    expect(metrics.paymentGateways).toHaveLength(3);
  });

  it('guarantees 100% accounting balance parity in trial balance', () => {
    const trialBalance = reportsService.getTrialBalance();
    expect(trialBalance.isBalanced).toBe(true);
    expect(trialBalance.varianceSdg).toBe(0.0);
    expect(trialBalance.totalDebitsSdg).toEqual(trialBalance.totalCreditsSdg);
    expect(trialBalance.accounts.length).toBeGreaterThan(0);
  });

  it('filters trial balance accounts by category while maintaining integrity', () => {
    const currentAssets = reportsService.getTrialBalance('current_assets');
    expect(currentAssets.accounts.length).toBe(1);
    expect(currentAssets.accounts[0].accountCode).toBe('1101');
  });

  it('returns accurate carrier performance rankings and financial shares', () => {
    const carrierShares = reportsService.getCarrierShares();
    expect(carrierShares.carriers.length).toBe(4);
    expect(carrierShares.carriers[0].carrierName).toContain('سابتكو');
    expect(carrierShares.carriers[0].marketSharePercent).toBe(45.3);
    expect(carrierShares.averageLoadFactorPercent).toBeGreaterThan(80);
  });

  it('filters carrier shares by tier', () => {
    const vipCarriers = reportsService.getCarrierShares('VIP');
    expect(vipCarriers.carriers.length).toBe(2);
    vipCarriers.carriers.forEach((c) => {
      expect(c.tier).toBe('VIP');
    });
  });

  it('exports valid UTF-8 BOM CSV for trial balance with correct balance total', () => {
    const csv = reportsService.exportTrialBalanceCsv();
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('رمز الدليل');
    expect(csv).toContain('1101');
    expect(csv).toContain('المجموع العام');
    expect(csv).toContain('متطابق بنسبة 100%');
  });

  it('triggers report export and adds a new record to export history with SHA-256 seal', () => {
    const initialHistoryLength = reportsService.getExportHistory().length;
    const record = reportsService.triggerReportExport(
      'rep-daily-cashflow',
      'Excel',
      'Q4 2024',
      'المشرف المالي'
    );
    expect(record.reportTitle).toContain('كشف التدفق النقدي');
    expect(record.format).toBe('Excel');
    expect(record.sha256Seal).toBeDefined();
    expect(reportsService.getExportHistory().length).toBe(initialHistoryLength + 1);
  });
});
