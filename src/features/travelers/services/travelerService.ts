import type {
  Traveler,
  TravelerTripItem,
  TravelerSecuritySession,
  TravelerSecurityLog,
  TravelerKpi,
  TravelerFilterState,
  TravelerAccountStatus,
} from '../types/traveler';
import {
  mockTravelers,
  mockTravelerKpi,
  mockAhmedAliTrips,
  mockAhmedAliSessions,
  mockAhmedAliSecurityLogs,
} from '../fixtures/travelerFixtures';

// In-memory mutable store for developer preview & realistic simulation
let travelersState: Traveler[] = [...mockTravelers];
let sessionsState: Record<string, TravelerSecuritySession[]> = {
  'USR-9482': [...mockAhmedAliSessions],
};
let tripsState: Record<string, TravelerTripItem[]> = {
  'USR-9482': [...mockAhmedAliTrips],
};
let securityLogsState: Record<string, TravelerSecurityLog[]> = {
  'USR-9482': [...mockAhmedAliSecurityLogs],
};

export const travelerService = {
  getKpis(): TravelerKpi {
    const total = travelersState.length;
    const active = travelersState.filter((t) => t.accountStatus === 'active').length;
    const pending = travelersState.filter(
      (t) => t.verificationStatus === 'pending' || t.verificationStatus === 'rejected'
    ).length;

    return {
      totalRegistered: mockTravelerKpi.totalRegistered,
      activeAccounts: mockTravelerKpi.activeAccounts,
      activeAccountsRatePercent: total > 0 ? Math.round((active / total) * 1000) / 10 : 88.9,
      inTransitToday: mockTravelerKpi.inTransitToday,
      activeTripsCount: mockTravelerKpi.activeTripsCount,
      activeStatesCount: mockTravelerKpi.activeStatesCount,
      pendingVerificationCount: pending > 0 ? pending : mockTravelerKpi.pendingVerificationCount,
    };
  },

  getTravelers(filters?: Partial<TravelerFilterState>): {
    travelers: Traveler[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    let result = [...travelersState];

    if (filters?.searchQuery?.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.fullName.toLowerCase().includes(q) ||
          t.legalFullName.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.phone.toLowerCase().includes(q) ||
          t.nationalId.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q)
      );
    }

    if (filters?.accountStatus && filters.accountStatus !== 'all') {
      result = result.filter((t) => t.accountStatus === filters.accountStatus);
    }

    if (filters?.verificationStatus && filters.verificationStatus !== 'all') {
      result = result.filter((t) => t.verificationStatus === filters.verificationStatus);
    }

    if (filters?.bookingActivity && filters.bookingActivity !== 'all') {
      if (filters.bookingActivity === 'on_road') {
        result = result.filter((t) => t.activeTrips > 0);
      } else if (filters.bookingActivity === 'upcoming') {
        result = result.filter((t) => t.totalTrips > 0);
      } else if (filters.bookingActivity === 'inactive') {
        result = result.filter((t) => t.activeTrips === 0);
      }
    }

    if (filters?.mainCity) {
      result = result.filter(
        (t) =>
          t.mainCity.toLowerCase().includes(filters.mainCity!.toLowerCase()) ||
          t.residenceArea.toLowerCase().includes(filters.mainCity!.toLowerCase())
      );
    }

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const total = result.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const paginated = result.slice((page - 1) * pageSize, page * pageSize);

    return {
      travelers: paginated,
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  getTravelerById(id: string): Traveler | undefined {
    return travelersState.find((t) => t.id === id);
  },

  getTravelerTrips(
    travelerId: string,
    filter?: 'all' | 'active' | 'completed' | 'cancelled'
  ): TravelerTripItem[] {
    const list = tripsState[travelerId] || [];
    if (!filter || filter === 'all') return list;
    return list.filter((item) => item.status === filter);
  },

  getTravelerSecuritySessions(travelerId: string): TravelerSecuritySession[] {
    return sessionsState[travelerId] || [];
  },

  getTravelerSecurityLogs(travelerId: string): TravelerSecurityLog[] {
    return securityLogsState[travelerId] || [];
  },

  terminateSession(travelerId: string, sessionId: string): boolean {
    const sessions = sessionsState[travelerId];
    if (!sessions) return false;

    const sessionIdx = sessions.findIndex((s) => s.id === sessionId);
    if (sessionIdx === -1) return false;

    const [removed] = sessions.splice(sessionIdx, 1);

    // Append security log
    if (!securityLogsState[travelerId]) securityLogsState[travelerId] = [];
    securityLogsState[travelerId].unshift({
      id: `LOG-${Date.now()}`,
      timestamp: 'الآن',
      eventType: 'logout',
      description: `تم إنهاء جلسة الجهاز (${removed.deviceName}) عن بُعد بواسطة المشرف العام.`,
      ipAddress: removed.ipAddress,
      status: 'warning',
    });

    return true;
  },

  verifyKyc(
    travelerId: string,
    decision: 'approve' | 'reject',
    notes?: string
  ): Traveler | undefined {
    return this.verifyTravelerKyc(travelerId, decision, notes);
  },

  verifyTravelerKyc(
    travelerId: string,
    decision: 'approve' | 'reject',
    notes?: string
  ): Traveler | undefined {
    const index = travelersState.findIndex((t) => t.id === travelerId);
    if (index === -1) return undefined;

    const current = travelersState[index];
    const isApproved = decision === 'approve';

    const updated: Traveler = {
      ...current,
      verificationStatus: isApproved ? 'verified' : 'rejected',
      accountStatus: isApproved ? 'active' : 'suspended',
      verifiedAt: isApproved ? 'اليوم عبر تدقيق المشرف' : undefined,
      verificationProvider: isApproved
        ? 'تمت الموافقة والاعتماد اليدوي بواسطة المشرف'
        : 'تم رفض الوثيقة لعدم اكتمال المتطلبات',
    };

    if (notes) {
      if (!updated.notes) updated.notes = [];
      updated.notes.unshift({
        id: `NOTE-${Date.now()}`,
        author: 'المشرف العام',
        role: 'Super Admin',
        timestamp: 'الآن',
        content: `قرار تدقيق الهوية: ${isApproved ? 'موافقة واعتماد' : 'رفض وثيقة'} — ${notes}`,
      });
    }

    travelersState[index] = updated;
    return updated;
  },

  updateAccountStatus(
    travelerId: string,
    status: TravelerAccountStatus,
    reason?: string
  ): Traveler | undefined {
    const index = travelersState.findIndex((t) => t.id === travelerId);
    if (index === -1) return undefined;

    const current = travelersState[index];
    const updated: Traveler = {
      ...current,
      accountStatus: status,
    };

    if (reason) {
      if (!updated.notes) updated.notes = [];
      updated.notes.unshift({
        id: `NOTE-${Date.now()}`,
        author: 'المشرف العام',
        role: 'Super Admin',
        timestamp: 'الآن',
        content: `تعديل حالة الحساب إلى (${status === 'active' ? 'نشط' : status === 'suspended' ? 'معلق' : 'قيد المراجعة'}): ${reason}`,
      });
    }

    travelersState[index] = updated;
    return updated;
  },

  addTravelerNote(
    travelerId: string,
    author: string,
    role: string,
    content: string
  ): Traveler | undefined {
    const index = travelersState.findIndex((t) => t.id === travelerId);
    if (index === -1) return undefined;

    const current = travelersState[index];
    const updated: Traveler = {
      ...current,
      notes: [
        {
          id: `NOTE-${Date.now()}`,
          author,
          role,
          timestamp: 'الآن',
          content,
        },
        ...(current.notes || []),
      ],
    };

    travelersState[index] = updated;
    return updated;
  },

  exportTravelersCsv(filters?: Partial<TravelerFilterState>): string {
    const { travelers } = this.getTravelers({ ...filters, page: 1, pageSize: 10000 });

    const headers = [
      'المعرف',
      'الاسم الكامل',
      'البريد الإلكتروني',
      'رقم الهاتف',
      'نوع الوثيقة',
      'رقم الهوية / الجواز',
      'حالة التوثيق',
      'حالة الحساب',
      'المدينة',
      'الرحلات المكتملة',
      'الرحلات الجارية',
      'إجمالي الإنفاق (ج.س)',
      'رصيد المحفظة (ج.س)',
      'نقاط المكافأة',
      'تاريخ التسجيل',
    ];

    const rows = travelers.map((t) => [
      t.id,
      `"${t.fullName.replace(/"/g, '""')}"`,
      t.email,
      t.phone,
      t.documentType === 'national_id' ? 'رقم وطني' : 'جواز سفر',
      t.maskedNationalId,
      t.verificationStatus === 'verified'
        ? 'موثق'
        : t.verificationStatus === 'pending'
        ? 'قيد المراجعة'
        : t.verificationStatus === 'rejected'
        ? 'مرفوض'
        : 'غير مسجل',
      t.accountStatus === 'active' ? 'نشط' : t.accountStatus === 'suspended' ? 'معلق' : 'مراجعة',
      t.mainCity,
      t.completedTrips,
      t.activeTrips,
      t.totalSpendSdg.toFixed(2),
      t.walletBalanceSdg.toFixed(2),
      t.rewardPoints,
      t.registrationDate,
    ]);

    // Prepend UTF-8 BOM (\uFEFF) for excel compatibility in Arabic
    return '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  },

  // Reset to initial fixtures (used for testing)
  _reset() {
    travelersState = [...mockTravelers];
    sessionsState = {
      'USR-9482': [...mockAhmedAliSessions],
    };
    tripsState = {
      'USR-9482': [...mockAhmedAliTrips],
    };
    securityLogsState = {
      'USR-9482': [...mockAhmedAliSecurityLogs],
    };
  },
};
