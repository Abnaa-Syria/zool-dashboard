import type {
  SettlementBatch,
  CarrierSettlementItem,
  BrokerCommissionItem,
  SettlementsMetrics,
} from '../types/settlements';
import {
  initialSettlementBatches,
  initialCarrierItems,
  initialBrokerItems,
  initialSettlementsMetrics,
} from '../fixtures/settlementsFixtures';

export interface SettlementFilters {
  status?: string;
  type?: string;
  searchQuery?: string;
}

class SettlementService {
  private batches: SettlementBatch[] = [...initialSettlementBatches];
  private carrierItems: CarrierSettlementItem[] = [...initialCarrierItems];
  private brokerItems: BrokerCommissionItem[] = [...initialBrokerItems];
  private metrics: SettlementsMetrics = { ...initialSettlementsMetrics };

  public getBatches(filters: SettlementFilters = {}): {
    batches: SettlementBatch[];
    metrics: SettlementsMetrics;
  } {
    let filtered = [...this.batches];

    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.batchNumber.toLowerCase().includes(q) ||
          b.targetBank.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((b) => b.status === filters.status);
    }

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter((b) => b.type === filters.type);
    }

    // Refresh dynamic metrics
    const pendingBatches = this.batches.filter(
      (b) => b.status === 'pending_approval' || b.status === 'draft'
    );
    const totalPendingSettlementsSdg = pendingBatches.reduce(
      (acc, b) => acc + b.netDisbursementSdg,
      0
    );
    const pendingBatchesCount = pendingBatches.length;

    const metrics: SettlementsMetrics = {
      ...this.metrics,
      totalPendingSettlementsSdg,
      pendingBatchesCount,
    };

    return { batches: filtered, metrics };
  }

  public getBatchDetails(batchId: string): SettlementBatch | undefined {
    return this.batches.find((b) => b.id === batchId);
  }

  public approveAndDisburseBatch(
    batchId: string,
    approverName: string = 'هشام كمال الدين الفكي (ADM-004)',
    sourceAccount: string = 'حساب التسويات المركزية - بنك الخرطوم (1900-ZOOL-01)'
  ): SettlementBatch {
    const index = this.batches.findIndex((b) => b.id === batchId);
    if (index === -1) throw new Error(`Batch not found: ${batchId}`);

    const current = this.batches[index];
    const bankRef = `BOK-BULK-${Math.floor(10000 + Math.random() * 90000)}`;
    const glRef = `GL-SETTLE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${index + 1}`;

    const updatedCarrierItems = current.carrierItems.map((c) => ({
      ...c,
      status: 'transferred' as const,
      paymentReference: bankRef,
    }));

    const updatedBrokerItems = current.brokerItems.map((b) => ({
      ...b,
      status: b.payoutPreference === 'wallet_credit' ? ('credited_to_wallet' as const) : ('transferred' as const),
      paymentReference: bankRef,
    }));

    const updated: SettlementBatch = {
      ...current,
      status: 'disbursed',
      sourceAccount,
      approvedBy: approverName,
      approvedAt: `${new Date().toLocaleDateString('ar-SD')}، ${new Date().toLocaleTimeString('ar-SD', { hour: '2-digit', minute: '2-digit' })}`,
      bankReference: bankRef,
      journalEntryRef: glRef,
      carrierItems: updatedCarrierItems,
      brokerItems: updatedBrokerItems,
    };

    this.batches[index] = updated;

    // Update metrics
    this.metrics.totalSettledThisMonthSdg += current.netDisbursementSdg;

    return updated;
  }

  public creditCommissionToBrokerWallet(
    brokerId: string,
    amountSdg: number
  ): BrokerCommissionItem {
    const item = this.brokerItems.find((b) => b.brokerId === brokerId);
    if (!item) throw new Error(`Broker commission item not found: ${brokerId}`);

    item.status = 'credited_to_wallet';
    item.walletBalanceSdg += amountSdg;
    item.paymentReference = `WLT-COMM-${Math.floor(1000 + Math.random() * 9000)}`;
    item.settlementDate = 'الآن';

    return item;
  }

  public disburseBrokerCommissionBank(
    brokerId: string
  ): BrokerCommissionItem {
    const item = this.brokerItems.find((b) => b.brokerId === brokerId);
    if (!item) throw new Error(`Broker commission item not found: ${brokerId}`);

    item.status = 'transferred';
    item.paymentReference = `BOK-TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    item.settlementDate = 'الآن';

    return item;
  }

  public disburseCarrierPayout(carrierId: string, paymentRef?: string): CarrierSettlementItem {
    const item = this.carrierItems.find((c) => c.carrierId === carrierId);
    if (!item) throw new Error(`Carrier settlement item not found: ${carrierId}`);

    item.status = 'transferred';
    item.paymentReference = paymentRef || `BOK-PAYOUT-${Math.floor(10000 + Math.random() * 90000)}`;

    return item;
  }

  public getCarrierItems(): CarrierSettlementItem[] {
    return this.carrierItems;
  }

  public getBrokerItems(): BrokerCommissionItem[] {
    return this.brokerItems;
  }

  public exportBatchBankakCsv(batchId: string): string {
    const batch = this.getBatchDetails(batchId);
    if (!batch) throw new Error(`Batch not found: ${batchId}`);

    const BOM = '\uFEFF';
    const headers = [
      'اسم المستفيد',
      'البنك',
      'رقم الحساب المصرفي',
      'المبلغ الصافي (ج.س)',
      'البيان والغرض',
      'المرجع الداخلي',
    ];

    const rows: string[][] = [];

    batch.carrierItems.forEach((c) => {
      rows.push([
        `"${c.bankAccountName}"`,
        `"${c.bankName}"`,
        `"${c.bankAccountNumber}"`,
        `"${c.netPayableSdg.toFixed(2)}"`,
        `"تسوية مبيعات تذاكر - ${batch.title}"`,
        `"${c.carrierId}-${batch.id}"`,
      ]);
    });

    batch.brokerItems.forEach((b) => {
      rows.push([
        `"${b.brokerName}"`,
        `"بنك الخرطوم (بنكك)"`,
        `"حساب محفظة وكالة ${b.brokerId}"`,
        `"${b.commissionAmountSdg.toFixed(2)}"`,
        `"صرف عمولات التذاكر - ${batch.title}"`,
        `"${b.brokerId}-${batch.id}"`,
      ]);
    });

    return BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }

  public exportSettlementsSummaryCsv(): string {
    const BOM = '\uFEFF';
    const headers = [
      'معرف الدورة',
      'عنوان الدورة',
      'النوع',
      'فترة التسوية',
      'عدد التذاكر',
      'إجمالي المبيعات (ج.س)',
      'المستحق الصافي للصرف (ج.س)',
      'الحالة',
      'البنك المستهدف',
      'رقم إشعار التحويل البنكي',
      'قيد اليومية GL',
    ];

    const rows = this.batches.map((b) => [
      `"${b.id}"`,
      `"${b.title}"`,
      `"${b.type === 'carrier_payout' ? 'حصص شركات النقل' : b.type === 'broker_commission' ? 'عمولات الوكلاء' : 'مختلطة'}"`,
      `"${b.periodStart} إلى ${b.periodEnd}"`,
      `"${b.ticketsCount}"`,
      `"${b.totalGrossSdg.toFixed(2)}"`,
      `"${b.netDisbursementSdg.toFixed(2)}"`,
      `"${b.status === 'disbursed' ? 'تم الصرف والتحويل' : b.status === 'approved' ? 'معتمدة للصرف' : 'قيد الاعتماد المالي'}"`,
      `"${b.targetBank}"`,
      `"${b.bankReference || '-'}"`,
      `"${b.journalEntryRef || '-'}"`,
    ]);

    return BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }
}

export const settlementService = new SettlementService();
