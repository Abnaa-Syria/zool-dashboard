import {
  initialDashboardMetrics,
  initialTrialBalanceMetrics,
  initialCarrierSharesMetrics,
  exportableReportsCatalog,
  initialExportHistory,
} from '../fixtures/reportsFixtures';
import type {
  FinancialReportsDashboardMetrics,
  TrialBalanceMetrics,
  CarrierSharesMetrics,
  ExportableReportItem,
  ExportHistoryRecord,
} from '../types/reports';

class ReportsService {
  private dashboardMetrics: FinancialReportsDashboardMetrics = { ...initialDashboardMetrics };
  private trialBalanceMetrics: TrialBalanceMetrics = { ...initialTrialBalanceMetrics };
  private carrierSharesMetrics: CarrierSharesMetrics = { ...initialCarrierSharesMetrics };
  private exportCatalog: ExportableReportItem[] = [...exportableReportsCatalog];
  private exportHistory: ExportHistoryRecord[] = [...initialExportHistory];

  public getDashboardMetrics(filters?: {
    quarter?: string;
    state?: string;
    carrier?: string;
    channel?: string;
  }): FinancialReportsDashboardMetrics {
    // If specific state or carrier filter applied, slightly adjust metrics for realistic responsiveness
    if (filters?.carrier && filters.carrier !== 'all') {
      const match = this.carrierSharesMetrics.carriers.find(
        (c) => c.carrierId === filters.carrier || c.carrierName.includes(filters.carrier!)
      );
      if (match) {
        return {
          ...this.dashboardMetrics,
          gmvTotalSdg: match.totalTicketSalesSdg,
          takeRateNetSdg: match.platformCommissionSdg,
          totalTicketsIssued: match.totalPassengersCount,
        };
      }
    }
    return this.dashboardMetrics;
  }

  public getTrialBalance(accountCategory?: string): TrialBalanceMetrics {
    if (!accountCategory || accountCategory === 'all') {
      return this.trialBalanceMetrics;
    }

    const filteredAccounts = this.trialBalanceMetrics.accounts.filter(
      (a) => a.category === accountCategory || a.accountCode.startsWith(accountCategory)
    );

    const totalDebits = filteredAccounts.reduce((sum, a) => sum + a.closingDebitSdg, 0);
    const totalCredits = filteredAccounts.reduce((sum, a) => sum + a.closingCreditSdg, 0);

    return {
      ...this.trialBalanceMetrics,
      accounts: filteredAccounts,
      totalDebitsSdg: totalDebits,
      totalCreditsSdg: totalCredits,
      varianceSdg: Math.abs(totalDebits - totalCredits),
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
    };
  }

  public getCarrierShares(tier?: string): CarrierSharesMetrics {
    if (!tier || tier === 'all') {
      return this.carrierSharesMetrics;
    }
    const filteredCarriers = this.carrierSharesMetrics.carriers.filter(
      (c) => c.tier.toLowerCase() === tier.toLowerCase()
    );
    const totalSales = filteredCarriers.reduce((sum, c) => sum + c.totalTicketSalesSdg, 0);
    const totalPayable = filteredCarriers.reduce((sum, c) => sum + c.netPayableSdg, 0);

    return {
      ...this.carrierSharesMetrics,
      carriers: filteredCarriers,
      totalCarrierSalesSdg: totalSales,
      totalNetPayableSdg: totalPayable,
    };
  }

  public getExportCatalog(): ExportableReportItem[] {
    return this.exportCatalog;
  }

  public getExportHistory(): ExportHistoryRecord[] {
    return this.exportHistory;
  }

  public triggerReportExport(
    reportId: string,
    format: 'PDF' | 'Excel' | 'CSV',
    _dateRange: string,
    exportedBy: string = 'أحمد السر (المشرف العام)'
  ): ExportHistoryRecord {
    const reportItem = this.exportCatalog.find((r) => r.id === reportId);
    const title = reportItem ? reportItem.title : 'تقرير مالي مخصص';

    const newRecord: ExportHistoryRecord = {
      id: `EXP-${Math.floor(10000 + Math.random() * 90000)}`,
      reportTitle: title,
      exportedAt: 'الآن (محدث لحظياً)',
      exportedBy,
      format,
      fileSizeBytes: Math.floor(120000 + Math.random() * 450000),
      sha256Seal: Array.from({ length: 20 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join(''),
    };

    this.exportHistory.unshift(newRecord);
    return newRecord;
  }

  public exportTrialBalanceCsv(): string {
    const header = [
      'رمز الدليل',
      'اسم الحساب',
      'التصنيف',
      'افتتاحي مدين (ج.س)',
      'افتتاحي دائن (ج.س)',
      'حركات الفترة مدين (ج.س)',
      'حركات الفترة دائن (ج.س)',
      'ختامي مدين (ج.س)',
      'ختامي دائن (ج.س)',
      'حالة المطابقة',
    ].join(',');

    const rows = this.trialBalanceMetrics.accounts.map((acc) =>
      [
        acc.accountCode,
        `"${acc.accountName}"`,
        `"${acc.categoryLabel}"`,
        acc.openingDebitSdg.toFixed(2),
        acc.openingCreditSdg.toFixed(2),
        acc.periodDebitSdg.toFixed(2),
        acc.periodCreditSdg.toFixed(2),
        acc.closingDebitSdg.toFixed(2),
        acc.closingCreditSdg.toFixed(2),
        `"${acc.statusLabel}"`,
      ].join(',')
    );

    const totalRow = [
      'المجموع العام',
      '"إجمالي الأرصدة المتطابقة"',
      '""',
      '',
      '',
      '',
      '',
      this.trialBalanceMetrics.totalDebitsSdg.toFixed(2),
      this.trialBalanceMetrics.totalCreditsSdg.toFixed(2),
      `"${this.trialBalanceMetrics.isBalanced ? 'متطابق بنسبة 100%' : 'فارق تسوية'}"`,
    ].join(',');

    return '\uFEFF' + [header, ...rows, totalRow].join('\n');
  }

  public exportCarrierSharesCsv(): string {
    const header = [
      'الترتيب',
      'رمز الناقل',
      'اسم شركة النقل',
      'الفئة',
      'الحصة السوقية (%)',
      'الرحلات المنفذة',
      'إجمالي الركاب',
      'معدل الإشغال (%)',
      'إجمالي مبيعات التذاكر (ج.س)',
      'عمولة المنصة 5% (ج.س)',
      'صافي المستحق النهائي (ج.س)',
      'المسار الأكثر ربحية',
    ].join(',');

    const rows = this.carrierSharesMetrics.carriers.map((c) =>
      [
        c.rank,
        c.carrierId,
        `"${c.carrierName}"`,
        c.tier,
        `${c.marketSharePercent}%`,
        c.completedTripsCount,
        c.totalPassengersCount,
        `${c.occupancyRatePercent}%`,
        c.totalTicketSalesSdg.toFixed(2),
        c.platformCommissionSdg.toFixed(2),
        c.netPayableSdg.toFixed(2),
        `"${c.mostProfitableRoute}"`,
      ].join(',')
    );

    return '\uFEFF' + [header, ...rows].join('\n');
  }
}

export const reportsService = new ReportsService();
