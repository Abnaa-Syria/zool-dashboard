import type {
  TransportCarrier,
  CarriersFilterState,
  CarriersMetrics,
  CarrierAssignedBroker,
} from '../types/carrier';
import { mockCarriers, mockCarriersMetrics } from '../fixtures/carrierFixtures';

export interface GetCarriersResult {
  carriers: TransportCarrier[];
  totalCount: number;
  filteredCount: number;
  metrics: CarriersMetrics;
}

// In-memory mutable list for sandbox demonstration
let carriersMemory = [...mockCarriers];

export const carrierService = {
  async getCarriers(filters: Partial<CarriersFilterState> = {}): Promise<GetCarriersResult> {
    await new Promise((resolve) => setTimeout(resolve, 120));

    let filtered = [...carriersMemory];

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.commercialName.toLowerCase().includes(q) ||
          c.commercialRegistrationNumber.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((c) => c.status === filters.status);
    }

    if (filters.state && filters.state !== 'all') {
      filtered = filtered.filter((c) => c.state === filters.state || c.city === filters.state);
    }

    if (filters.activeTripsOnly) {
      filtered = filtered.filter((c) => c.activeTripsNowCount > 0);
    }

    if (filters.linkedBrokersOnly) {
      filtered = filtered.filter((c) => c.linkedBrokersCount > 0);
    }

    // Sorting
    const sortBy = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder || 'asc';

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name, 'ar');
      } else if (sortBy === 'fleetCount') {
        comparison = a.totalFleetCount - b.totalFleetCount;
      } else if (sortBy === 'activeTrips') {
        comparison = a.activeTripsNowCount - b.activeTripsNowCount;
      } else if (sortBy === 'routesCount') {
        comparison = a.totalRoutesCount - b.totalRoutesCount;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const totalCount = carriersMemory.length;
    const filteredCount = filtered.length;

    // Pagination
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 10;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return {
      carriers: paginated,
      totalCount,
      filteredCount,
      metrics: mockCarriersMetrics,
    };
  },

  async getCarrierById(id: string): Promise<TransportCarrier | null> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const carrier = carriersMemory.find(
      (c) => c.id.toLowerCase() === id.toLowerCase() || c.code.toLowerCase() === id.toLowerCase()
    );
    return carrier || null;
  },

  async addCarrier(
    data: Partial<
      Omit<TransportCarrier, 'id' | 'code' | 'routes' | 'assignedBrokers' | 'commissionHistory'>
    > & {
      name: string;
      commercialRegistrationNumber: string;
    }
  ): Promise<TransportCarrier> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const newId = `CO-AUTO-${Date.now().toString().slice(-4)}`;
    const newCode = `TC-0${carriersMemory.length + 1}`;

    const newCarrier: TransportCarrier = {
      id: newId,
      code: newCode,
      name: data.name,
      commercialName: data.commercialName || data.name,
      status: data.status || 'under_review',
      statusLabel: data.statusLabel || 'قيد المراجعة والتدقيق',
      serviceClasses: data.serviceClasses || ['VIP Express'],
      logoSymbol: data.logoSymbol || data.name.charAt(0),
      commercialRegistrationNumber: data.commercialRegistrationNumber,
      taxIdentificationNumber: data.taxIdentificationNumber || 'TIN-AUTO',
      transportLicenseDoc: data.transportLicenseDoc || 'ترخيص هيئة الطرق',
      licenseExpiryDate: data.licenseExpiryDate || '2026-12-31',
      headOfficeAddress: data.headOfficeAddress || '',
      city: data.city || 'الخرطوم',
      state: data.state || 'ولاية الخرطوم',
      phone: data.phone || '+249 183 000 000',
      email: data.email || 'info@company.sd',
      totalFleetCount: data.totalFleetCount || 10,
      activeGpsBusesCount: data.activeGpsBusesCount || 8,
      activeTripsNowCount: data.activeTripsNowCount || 2,
      totalRoutesCount: data.totalRoutesCount || 2,
      linkedBrokersCount: data.linkedBrokersCount || 0,
      onTimePunctualityPercent: data.onTimePunctualityPercent || 95.0,
      operatingCorridors: data.operatingCorridors || ['الخرطوم'],
      contacts: data.contacts || [],
      routes: [],
      assignedBrokers: [],
      commissionHistory: [],
    };

    carriersMemory = [newCarrier, ...carriersMemory];
    return newCarrier;
  },

  async assignBrokerToCarrier(
    carrierId: string,
    assignment: Omit<CarrierAssignedBroker, 'assignedAt' | 'assignedBy' | 'totalBookingsThisMonth' | 'totalGmvThisMonthSdg'>
  ): Promise<TransportCarrier | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const carrier = carriersMemory.find((c) => c.id === carrierId);
    if (!carrier) return null;

    const newBrokerEntry: CarrierAssignedBroker = {
      ...assignment,
      assignedAt: new Date().toISOString().slice(0, 10),
      assignedBy: 'أحمد السر (المشرف العام)',
      totalBookingsThisMonth: 0,
      totalGmvThisMonthSdg: 0,
    };

    carrier.assignedBrokers = [newBrokerEntry, ...carrier.assignedBrokers];
    carrier.linkedBrokersCount += 1;

    // Log in commission history
    carrier.commissionHistory = [
      {
        id: `CHG-${Date.now()}`,
        brokerId: assignment.brokerId,
        brokerName: assignment.brokerName,
        previousRatePercent: 0,
        newRatePercent: assignment.commissionRatePercent,
        decisionDate: new Date().toISOString().slice(0, 10),
        decisionReference: `DEC-LINK-${Math.floor(Math.random() * 9000 + 1000)}`,
        authorizerName: 'أحمد السر (المشرف العام)',
        reason: 'اعتماد تعيين جديد لمكتب الوسيط مع تحديد نسبة العمولة النظامية',
      },
      ...carrier.commissionHistory,
    ];

    return { ...carrier };
  },

  exportCarriersCsv(carriers: TransportCarrier[]): void {
    const headers = [
      'رمز الشركة',
      'اسم الشركة',
      'الاسم التجاري',
      'الحالة التشغيلية',
      'السجل التجاري',
      'المدينة والمقر',
      'رقم الهاتف',
      'إجمالي الأسطول',
      'الحافلات المتتبعة GPS',
      'الرحلات الجارية الآن',
      'عدد المسارات',
      'الوسطاء المرتبطون',
      'نسبة الالتزام بالمواعيد',
    ];

    const escapeCsv = (val: string | number | undefined): string => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = carriers.map((c) => [
      escapeCsv(c.code),
      escapeCsv(c.name),
      escapeCsv(c.commercialName),
      escapeCsv(c.statusLabel),
      escapeCsv(c.commercialRegistrationNumber),
      escapeCsv(`${c.city} - ${c.state}`),
      escapeCsv(c.phone),
      escapeCsv(c.totalFleetCount),
      escapeCsv(c.activeGpsBusesCount),
      escapeCsv(c.activeTripsNowCount),
      escapeCsv(c.totalRoutesCount),
      escapeCsv(c.linkedBrokersCount),
      escapeCsv(`${c.onTimePunctualityPercent}%`),
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zoolgo_transport_carriers_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
