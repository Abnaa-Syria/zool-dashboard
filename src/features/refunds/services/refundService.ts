import {
  initialRefundRequests,
  initialPolicyTiers,
  initialCarrierFaultRules,
  initialRefundsMetrics,
} from '../fixtures/refundsFixtures';
import type {
  RefundRequest,
  CancellationPolicyTier,
  CarrierFaultPolicyRule,
  RefundsQueueMetrics,
  RefundChannel,
  RefundDecision,
} from '../types/refunds';

class RefundService {
  private requests: RefundRequest[] = [...initialRefundRequests];
  private policyTiers: CancellationPolicyTier[] = [...initialPolicyTiers];
  private faultRules: CarrierFaultPolicyRule[] = [...initialCarrierFaultRules];
  private metrics: RefundsQueueMetrics = { ...initialRefundsMetrics };

  public getQueue(filters?: {
    status?: string;
    carrierId?: string;
    search?: string;
  }): { requests: RefundRequest[]; metrics: RefundsQueueMetrics } {
    let list = [...this.requests];

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((r) => r.status === filters.status);
    }

    if (filters?.carrierId && filters.carrierId !== 'all') {
      list = list.filter((r) => r.carrierId === filters.carrierId);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.ticketNumber.toLowerCase().includes(q) ||
          r.passengerName.toLowerCase().includes(q) ||
          r.carrierName.toLowerCase().includes(q) ||
          r.routeText.toLowerCase().includes(q)
      );
    }

    // Refresh metrics counters based on current list state
    const pendingCount = this.requests.filter((r) => r.status === 'pending_review').length;
    const currentMetrics: RefundsQueueMetrics = {
      ...this.metrics,
      pendingReviewCount: pendingCount,
      pendingReviewNotice: `${pendingCount} بحاجة لمراجعة المشرف`,
    };

    return {
      requests: list,
      metrics: currentMetrics,
    };
  }

  public getRefundById(idOrTicket: string): RefundRequest | undefined {
    return this.requests.find(
      (r) =>
        r.id.toLowerCase() === idOrTicket.toLowerCase() ||
        r.ticketNumber.toLowerCase() === idOrTicket.toLowerCase()
    );
  }

  public executeManualOverride(params: {
    ticketNumber: string;
    refundPercent: number;
    customAmountSdg?: number;
    channel: RefundChannel;
    justification: string;
    notifySms: boolean;
  }): RefundRequest {
    const existingIndex = this.requests.findIndex(
      (r) => r.ticketNumber.toLowerCase() === params.ticketNumber.toLowerCase()
    );

    let target: RefundRequest;

    if (existingIndex >= 0) {
      target = { ...this.requests[existingIndex] };
    } else {
      // Create a new override request for this ticket
      target = {
        id: `REF-OVR-${Date.now().toString().slice(-4)}`,
        ticketNumber: params.ticketNumber,
        bookingId: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
        passengerName: 'مسافر حجز استثنائي',
        passengerPhone: '+249 900 000 000',
        passengerEmail: 'override@zoolgo.sd',
        passengerTier: 'Silver',
        completedTripsCount: 1,
        carrierId: 'SAP-8802',
        carrierName: 'شركة سابتكو للنقل الجماعي',
        tripCode: 'VIP-OVR',
        routeText: 'الخرطوم ⟵ بورتسودان',
        originCity: 'الخرطوم',
        destinationCity: 'بورتسودان',
        seatNumber: 'OVR-1',
        seatClass: 'VIP',
        scheduledDeparture: '24 أكتوبر 2024 - 08:00 ص',
        requestedAt: 'الآن',
        requestAgeText: 'منذ لحظات',
        ticketFareSdg: 480.0,
        requestedAmountSdg: 480.0,
        approvedRefundSdg: 480.0,
        platformCommissionDeductionSdg: 0,
        carrierCompensationDeductionSdg: 480.0,
        status: 'approved_refunded',
        statusLabel: 'مسترد باستثناء إداري فوري (Manual Override)',
        reasonType: 'customer_emergency',
        reasonTitle: 'تجاوز إداري واسترداد استثنائي',
        reasonDescription: params.justification,
        destinationChannel: params.channel,
        isEmergencyOverride: true,
      };
    }

    const refundAmount =
      params.customAmountSdg !== undefined
        ? params.customAmountSdg
        : (target.ticketFareSdg * params.refundPercent) / 100;

    target.approvedRefundSdg = refundAmount;
    target.status = 'approved_refunded';
    target.statusLabel = 'مسترد باستثناء إداري فوري (Manual Override)';
    target.justificationNotes = params.justification;
    target.destinationChannel = params.channel;
    target.isEmergencyOverride = true;
    target.decision = 'full_refund';

    if (existingIndex >= 0) {
      this.requests[existingIndex] = target;
    } else {
      this.requests.unshift(target);
    }

    this.metrics.manualOverrideCount += 1;
    this.metrics.totalRefundedTodaySdg += refundAmount;
    this.metrics.emergencyFundBalanceSdg -= refundAmount;

    return target;
  }

  public submitDisputeDecision(params: {
    refundId: string;
    decision: RefundDecision;
    justification: string;
    notifySms: boolean;
    postLedger: boolean;
  }): RefundRequest {
    const idx = this.requests.findIndex(
      (r) => r.id === params.refundId || r.ticketNumber === params.refundId
    );

    if (idx < 0) {
      throw new Error(`Refund request with id ${params.refundId} not found`);
    }

    const current = { ...this.requests[idx] };
    current.decision = params.decision;
    current.justificationNotes = params.justification;

    if (params.decision === 'full_refund') {
      current.status = 'approved_refunded';
      current.statusLabel = 'تم اعتماد الاسترداد الكامل 100% وإغلاق النزاع';
      current.approvedRefundSdg = current.ticketFareSdg;
    } else if (params.decision === 'partial_refund') {
      current.status = 'approved_refunded';
      current.statusLabel = 'تم اعتماد استرداد جزئي (85%)';
      current.approvedRefundSdg = current.ticketFareSdg * 0.85;
    } else if (params.decision === 'voucher') {
      current.status = 'approved_refunded';
      current.statusLabel = 'تم إصدار قسيمة سفر بديلة صالحة 30 يوماً';
    } else {
      current.status = 'rejected';
      current.statusLabel = 'تم رفض طلب الاسترداد لعدم الاستحقاق';
      current.approvedRefundSdg = 0;
    }

    this.requests[idx] = current;
    return current;
  }

  public getPolicyTiers(): CancellationPolicyTier[] {
    return [...this.policyTiers];
  }

  public updatePolicyTier(
    tierId: string,
    updates: Partial<CancellationPolicyTier>
  ): CancellationPolicyTier[] {
    this.policyTiers = this.policyTiers.map((tier) =>
      tier.tierId === tierId ? { ...tier, ...updates } : tier
    );
    return [...this.policyTiers];
  }

  public getCarrierFaultRules(): CarrierFaultPolicyRule[] {
    return [...this.faultRules];
  }

  public toggleCarrierFaultRule(ruleId: string, isEnabled: boolean): CarrierFaultPolicyRule[] {
    this.faultRules = this.faultRules.map((rule) =>
      rule.id === ruleId ? { ...rule, isEnabled } : rule
    );
    return [...this.faultRules];
  }

  public exportRefundsCsv(): string {
    const headers = [
      'رقم التذكرة',
      'رقم الطلب',
      'اسم المسافر',
      'هاتف المسافر',
      'شركة النقل',
      'المسار',
      'سعر التذكرة (ج.س)',
      'المبلغ المسترد (ج.س)',
      'حالة الطلب',
      'سبب الإلغاء',
      'طريقة الرد',
      'تاريخ الطلب',
    ];

    const rows = this.requests.map((r) => [
      r.ticketNumber,
      r.id,
      r.passengerName,
      r.passengerPhone,
      r.carrierName,
      r.routeText,
      r.ticketFareSdg.toFixed(2),
      r.approvedRefundSdg.toFixed(2),
      r.statusLabel,
      r.reasonTitle,
      r.destinationChannel,
      r.requestedAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
    return '\uFEFF' + csvContent;
  }
}

export const refundService = new RefundService();
