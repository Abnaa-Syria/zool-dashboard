import type {
  BrokerOffice,
  BrokersFilterState,
  BrokersMetrics,
  BrokerWalletTransaction,
} from '../types/broker';
import { mockBrokers, mockBrokersMetrics } from '../fixtures/brokerFixtures';

export interface GetBrokersResult {
  brokers: BrokerOffice[];
  totalCount: number;
  filteredCount: number;
  metrics: BrokersMetrics;
}

let brokersMemory = [...mockBrokers];

export const brokerService = {
  async getBrokers(filters: Partial<BrokersFilterState> = {}): Promise<GetBrokersResult> {
    await new Promise((resolve) => setTimeout(resolve, 120));

    let filtered = [...brokersMemory];

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q) ||
          b.branchName.toLowerCase().includes(q) ||
          b.managerName.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'low_balance') {
        filtered = filtered.filter((b) => b.isLowBalanceAlert);
      } else {
        filtered = filtered.filter((b) => b.status === filters.status);
      }
    }

    if (filters.state && filters.state !== 'all') {
      filtered = filtered.filter((b) => b.state === filters.state || b.city === filters.state);
    }

    if (filters.carrierId && filters.carrierId !== 'all') {
      filtered = filtered.filter((b) =>
        b.carrierLinks.some((l) => l.carrierId === filters.carrierId)
      );
    }

    // Sorting
    const sortBy = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder || 'asc';

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name, 'ar');
      } else if (sortBy === 'walletBalance') {
        comparison = a.walletBalance - b.walletBalance;
      } else if (sortBy === 'todaySales') {
        comparison = a.todaySalesSdg - b.todaySalesSdg;
      } else if (sortBy === 'clerksCount') {
        comparison = a.clerksCount - b.clerksCount;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const totalCount = brokersMemory.length;
    const filteredCount = filtered.length;

    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 10;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return {
      brokers: paginated,
      totalCount,
      filteredCount,
      metrics: mockBrokersMetrics,
    };
  },

  async getBrokerById(id: string): Promise<BrokerOffice | null> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const broker = brokersMemory.find(
      (b) => b.id.toLowerCase() === id.toLowerCase() || b.code.toLowerCase() === id.toLowerCase()
    );
    return broker || null;
  },

  async addBroker(
    data: Omit<BrokerOffice, 'id' | 'code' | 'clerks' | 'posTerminals' | 'carrierLinks' | 'walletLedger'>
  ): Promise<BrokerOffice> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const newId = `AG-AUTO-${Date.now().toString().slice(-3)}`;
    const newCode = `AG-${Math.floor(Math.random() * 800 + 100)}`;

    const newBroker: BrokerOffice = {
      ...data,
      id: newId,
      code: newCode,
      clerks: [],
      posTerminals: [],
      carrierLinks: [],
      walletLedger: [],
    };

    brokersMemory = [newBroker, ...brokersMemory];
    return newBroker;
  },

  async topUpBrokerWallet(
    brokerId: string,
    amount: number,
    transactionRef: string,
    notes?: string
  ): Promise<BrokerOffice | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const broker = brokersMemory.find((b) => b.id === brokerId);
    if (!broker) return null;

    broker.walletBalance += amount;
    broker.isLowBalanceAlert = broker.walletBalance < broker.minimumBalanceAlertThreshold;

    const newLedgerEntry: BrokerWalletTransaction = {
      id: `WLT-TXN-${Date.now().toString().slice(-6)}`,
      timestamp: `${new Date().toLocaleDateString('ar-EG')} — ${new Date().toLocaleTimeString('ar-EG')}`,
      type: 'prepaid_topup',
      typeLabel: 'إيداع شحن رصيد استثنائي',
      amount,
      direction: 'credit',
      balanceAfter: broker.walletBalance,
      relatedReference: transactionRef,
      executedBy: 'أحمد السر (المشرف العام)',
      notes: notes || 'شحن رصيد يدوي معتمد من لوحة الإدارة المركزية',
    };

    broker.walletLedger = [newLedgerEntry, ...broker.walletLedger];
    return { ...broker };
  },

  exportBrokersCsv(brokers: BrokerOffice[]): void {
    const headers = [
      'رمز الوكالة',
      'اسم المكتب',
      'الفرع',
      'المدينة والولاية',
      'رصيد المحفظة (ج.س)',
      'تنبيه الرصيد الأدنى',
      'مبيعات اليوم (ج.س)',
      'التذاكر اليوم',
      'عدد الموظفين',
      'نقاط البيع POS',
      'الشركات المرتبطة',
      'مدير المكتب',
      'هاتف المدير',
    ];

    const escapeCsv = (val: string | number | boolean | undefined): string => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = brokers.map((b) => [
      escapeCsv(b.code),
      escapeCsv(b.name),
      escapeCsv(b.branchName),
      escapeCsv(`${b.city} - ${b.state}`),
      escapeCsv(b.walletBalance),
      escapeCsv(b.isLowBalanceAlert ? 'نعم (أقل من 500)' : 'طبيعي'),
      escapeCsv(b.todaySalesSdg),
      escapeCsv(b.todayTicketsCount),
      escapeCsv(b.clerksCount),
      escapeCsv(b.posCount),
      escapeCsv(b.assignedCarriersCount),
      escapeCsv(b.managerName),
      escapeCsv(b.managerPhone),
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zoolgo_broker_offices_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
