import type {
  BrokerWalletSummary,
  FinancialLedgerEntry,
  TopUpRequest,
  WalletsLiquidityMetrics,
  LedgerMetrics,
  WalletsFilterState,
  LedgerFilterState,
  PaymentChannel,
} from '../types/financials';
import {
  mockWalletsMetrics,
  mockLedgerMetrics,
  mockBrokerWallets,
  mockLedgerEntries,
  mockTopUpQueue,
} from '../fixtures/financialFixtures';

// Mutable in-memory store for active simulation and state mutation
let walletsState: BrokerWalletSummary[] = [...mockBrokerWallets];
let ledgerState: FinancialLedgerEntry[] = [...mockLedgerEntries];
let queueState: TopUpRequest[] = [...mockTopUpQueue];

export const financialService = {
  getWalletsMetrics(): WalletsLiquidityMetrics {
    const totalFloat = walletsState.reduce((sum, w) => sum + w.currentBalanceSdg, 0);
    const criticalCount = walletsState.filter((w) => w.status === 'critical' || w.status === 'halted').length;

    return {
      totalFloatSdg: totalFloat > 0 ? totalFloat : mockWalletsMetrics.totalFloatSdg,
      totalWalletsCount: walletsState.length,
      todayInflowSdg: mockWalletsMetrics.todayInflowSdg,
      todayInflowCount: mockWalletsMetrics.todayInflowCount,
      todayDeductionsSdg: mockWalletsMetrics.todayDeductionsSdg,
      todayTicketsIssuedCount: mockWalletsMetrics.todayTicketsIssuedCount,
      criticalWalletsCount: criticalCount,
      circulatingFloatSdg: Math.round(totalFloat * 0.88),
      circulatingPercent: 88,
      insuranceDepositSdg: Math.round(totalFloat * 0.12),
      insurancePercent: 12,
      reserveCoverageRatio: 1.8,
    };
  },

  getWallets(filters?: Partial<WalletsFilterState>): {
    wallets: BrokerWalletSummary[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    let result = [...walletsState];

    if (filters?.searchQuery?.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter(
        (w) =>
          w.brokerName.toLowerCase().includes(q) ||
          w.brokerId.toLowerCase().includes(q) ||
          w.city.toLowerCase().includes(q) ||
          w.bankAccountRef.toLowerCase().includes(q)
      );
    }

    if (filters?.status && filters.status !== 'all') {
      result = result.filter((w) => w.status === filters.status);
    }

    if (filters?.agencyTier && filters.agencyTier !== 'all') {
      result = result.filter((w) => w.agencyTier === filters.agencyTier);
    }

    if (filters?.state && filters.state !== 'all') {
      result = result.filter((w) => w.state.includes(filters.state!));
    }

    // Sorting
    const sortBy = filters?.sortBy || 'balance_desc';
    if (sortBy === 'balance_desc') {
      result.sort((a, b) => b.currentBalanceSdg - a.currentBalanceSdg);
    } else if (sortBy === 'balance_asc') {
      result.sort((a, b) => a.currentBalanceSdg - b.currentBalanceSdg);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.brokerName.localeCompare(b.brokerName, 'ar'));
    }

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const total = result.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const paginated = result.slice((page - 1) * pageSize, page * pageSize);

    return {
      wallets: paginated,
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  getWalletByBrokerId(brokerId: string): BrokerWalletSummary | undefined {
    return walletsState.find((w) => w.brokerId.toLowerCase() === brokerId.toLowerCase());
  },

  recordTopUp(
    brokerId: string,
    amountSdg: number,
    channel: PaymentChannel,
    bankReference: string,
    notes?: string
  ): { wallet: BrokerWalletSummary; ledgerEntry: FinancialLedgerEntry } | undefined {
    const walletIdx = walletsState.findIndex(
      (w) => w.brokerId.toLowerCase() === brokerId.toLowerCase()
    );
    if (walletIdx === -1) return undefined;

    const currentWallet = walletsState[walletIdx];
    const newBalance = currentWallet.currentBalanceSdg + amountSdg;
    const nextStatus = newBalance >= 500 ? 'safe' : newBalance > 0 ? 'critical' : 'halted';

    const updatedWallet: BrokerWalletSummary = {
      ...currentWallet,
      currentBalanceSdg: newBalance,
      status: nextStatus,
      lastTopUpDate: 'اليوم (الآن)',
      lastTopUpAmountSdg: amountSdg,
    };

    walletsState[walletIdx] = updatedWallet;

    // Create corresponding ledger entry
    const txnId = `WLT-TXN-${Date.now().toString().slice(-6)}`;
    const channelLabels: Record<PaymentChannel, string> = {
      bankak: 'بنك الخرطوم (بنكك)',
      sadad: 'سداد إلكتروني (Sadad)',
      fauwr: 'فوري بنك فيصل',
      cash_deposit: 'إيداع نقدي مباشر',
      prepaid_wallet: 'محفظة الوكيل',
    };

    const newLedgerEntry: FinancialLedgerEntry = {
      id: txnId,
      timestamp: new Date().toISOString(),
      dateStr: 'اليوم (الآن)',
      timeStr: new Date().toLocaleTimeString('ar-SD', { hour: '2-digit', minute: '2-digit' }),
      type: 'wallet_topup',
      typeLabel: 'شحن رصيد استثنائي',
      brokerId: currentWallet.brokerId,
      brokerName: currentWallet.brokerName,
      partyDescription: `${currentWallet.brokerName} (${currentWallet.brokerId}) — إيداع مرجعي #${bankReference}`,
      paymentChannel: channel,
      paymentChannelLabel: channelLabels[channel] || 'تحويل بنكي',
      amountSdg: amountSdg,
      postBalanceSdg: newBalance,
      status: 'reconciled',
      sha256Hash: `hash-${Date.now().toString(16)}`,
      executingClerk: 'المشرف العام (أحمد السر)',
      notes: notes || 'تم الإيداع المباشر وتحديث الرصيد الفوري بنجاح.',
      doubleEntryLegs: [
        {
          accountCode: '1010-CASH-EQUIV',
          accountName: `حساب الإيداعات والسيولة البنكية (${channelLabels[channel]})`,
          type: 'debit',
          amountSdg: amountSdg,
          description: `إيداع نقدي مثبت بموجب إشعار تحويل #${bankReference}`,
        },
        {
          accountCode: '2101-WLT-ESCROW',
          accountName: `محفظة ${currentWallet.brokerName} المسبقة الدفع`,
          type: 'credit',
          amountSdg: amountSdg,
          description: 'شحن فوري لرصيد المحفظة التشغيلي',
        },
      ],
    };

    ledgerState.unshift(newLedgerEntry);

    return {
      wallet: updatedWallet,
      ledgerEntry: newLedgerEntry,
    };
  },

  getLedgerMetrics(): LedgerMetrics {
    const todayEntries = ledgerState.filter((e) => e.dateStr.includes('اليوم'));
    const totalVolume = todayEntries.reduce((sum, e) => sum + Math.abs(e.amountSdg), 0);

    return {
      todayVolumeSdg: totalVolume > 0 ? totalVolume : mockLedgerMetrics.todayVolumeSdg,
      volumeGrowthPercent: 14.8,
      todayTransactionsCount: todayEntries.length > 0 ? todayEntries.length : mockLedgerMetrics.todayTransactionsCount,
      todayTransactionsCapacityPercent: 78,
      pendingSettlementsCount: mockLedgerMetrics.pendingSettlementsCount,
      pendingSettlementsValueSdg: mockLedgerMetrics.pendingSettlementsValueSdg,
      autoMatchRatePercent: 100,
    };
  },

  getLedgerEntries(filters?: Partial<LedgerFilterState>): {
    entries: FinancialLedgerEntry[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    let result = [...ledgerState];

    if (filters?.searchQuery?.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.partyDescription.toLowerCase().includes(q) ||
          e.bookingReference?.toLowerCase().includes(q) ||
          e.brokerName?.toLowerCase().includes(q) ||
          e.brokerId?.toLowerCase().includes(q)
      );
    }

    if (filters?.transactionType && filters.transactionType !== 'all') {
      result = result.filter((e) => e.type === filters.transactionType);
    }

    if (filters?.targetParty && filters.targetParty !== 'all') {
      result = result.filter((e) =>
        e.partyDescription.toLowerCase().includes(filters.targetParty!.toLowerCase())
      );
    }

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const total = result.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const paginated = result.slice((page - 1) * pageSize, page * pageSize);

    return {
      entries: paginated,
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  getLedgerEntryById(id: string): FinancialLedgerEntry | undefined {
    return ledgerState.find((e) => e.id.toLowerCase() === id.toLowerCase());
  },

  getTopUpQueue(): TopUpRequest[] {
    return [...queueState];
  },

  approveTopUpRequest(requestId: string, approvedBy: string): boolean {
    const reqIdx = queueState.findIndex((r) => r.id === requestId);
    if (reqIdx === -1) return false;

    const req = queueState[reqIdx];
    queueState[reqIdx] = {
      ...req,
      status: 'approved',
      reviewedBy: approvedBy,
      reviewedAt: 'الآن',
    };

    // Credit broker wallet
    this.recordTopUp(
      req.brokerId,
      req.amountSdg,
      req.channel,
      req.bankReferenceNumber,
      `تمت الموافقة والاعتماد البنكي بواسطة ${approvedBy}.`
    );

    return true;
  },

  rejectTopUpRequest(requestId: string, reason: string): boolean {
    const reqIdx = queueState.findIndex((r) => r.id === requestId);
    if (reqIdx === -1) return false;

    queueState[reqIdx] = {
      ...queueState[reqIdx],
      status: 'rejected',
      notes: `تم الرفض: ${reason}`,
      reviewedAt: 'الآن',
    };

    return true;
  },

  exportWalletsCsv(filters?: Partial<WalletsFilterState>): string {
    const { wallets } = this.getWallets({ ...filters, page: 1, pageSize: 10000 });
    const headers = [
      'رمز الوكيل',
      'اسم المكتب والوكالة',
      'المدينة والمقر',
      'الولاية',
      'حساب البنك المرجعي',
      'رصيد المحفظة الحالي (ج.س)',
      'سقف السحب (ج.س)',
      'حالة الأمان',
      'متوسط السحب اليومي (ج.س)',
      'تذاكر اليوم',
      'آخر شحن رصيد',
    ];

    const rows = wallets.map((w) => [
      w.brokerId,
      `"${w.brokerName.replace(/"/g, '""')}"`,
      `"${w.locationArea.replace(/"/g, '""')}"`,
      w.state,
      `"${w.bankAccountRef}"`,
      w.currentBalanceSdg.toFixed(2),
      w.creditLimitSdg.toFixed(2),
      w.status === 'safe' ? 'آمن ومستقر' : w.status === 'critical' ? 'حرج' : 'متوقف',
      w.dailyAvgSpendSdg.toFixed(2),
      w.todayTicketsCount,
      `"${w.lastTopUpDate} (+${w.lastTopUpAmountSdg})"`,
    ]);

    return '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  },

  exportLedgerCsv(filters?: Partial<LedgerFilterState>): string {
    const { entries } = this.getLedgerEntries({ ...filters, page: 1, pageSize: 10000 });
    const headers = [
      'رقم القيد',
      'التاريخ والتوقيت',
      'نوع العملية',
      'الطرف المعني والتفاصيل',
      'رقم الحجز المرتبط',
      'قناة السداد',
      'المبلغ (ج.س)',
      'الرصيد بعد الحركة (ج.س)',
      'حالة القيد',
      'بصمة SHA-256',
    ];

    const rows = entries.map((e) => [
      e.id,
      `"${e.dateStr} - ${e.timeStr}"`,
      e.typeLabel,
      `"${e.partyDescription.replace(/"/g, '""')}"`,
      e.bookingReference || '—',
      e.paymentChannelLabel,
      e.amountSdg.toFixed(2),
      e.postBalanceSdg.toFixed(2),
      e.status === 'reconciled' ? 'مقيد ومطابق' : 'معلق',
      `"${e.sha256Hash}"`,
    ]);

    return '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  },

  _reset() {
    walletsState = [...mockBrokerWallets];
    ledgerState = [...mockLedgerEntries];
    queueState = [...mockTopUpQueue];
  },
};
