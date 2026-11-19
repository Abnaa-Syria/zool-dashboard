import { describe, it, expect } from 'vitest';
import { refundService } from './refundService';

describe('RefundService', () => {
  it('returns initial refunds queue with correct metrics', () => {
    const { requests, metrics } = refundService.getQueue();
    expect(requests.length).toBeGreaterThanOrEqual(5);
    expect(metrics.emergencyFundBalanceSdg).toBe(48250.0);
    expect(metrics.pendingReviewCount).toBeGreaterThanOrEqual(1);
  });

  it('filters refunds by status accurately', () => {
    const { requests } = refundService.getQueue({ status: 'pending_review' });
    expect(requests.every((r) => r.status === 'pending_review')).toBe(true);
  });

  it('filters refunds by search query matching passenger or ticket', () => {
    const { requests } = refundService.getQueue({ search: 'خالد' });
    expect(requests.length).toBeGreaterThanOrEqual(1);
    expect(requests[0].passengerName).toContain('خالد');
  });

  it('retrieves dispute refund details by ticket number', () => {
    const item = refundService.getRefundById('ZL-902144');
    expect(item).toBeDefined();
    expect(item?.carrierName).toContain('سابتكو');
    expect(item?.telemetryEvidence?.vehicleCode).toBe('ZG-BUS-042');
  });

  it('executes manual override successfully and updates emergency fund', () => {
    const initialFund = refundService.getQueue().metrics.emergencyFundBalanceSdg;
    const result = refundService.executeManualOverride({
      ticketNumber: 'ZL-854921',
      refundPercent: 100,
      channel: 'zoolgo_wallet',
      justification: 'استثناء إنساني معتمد من المشرف',
      notifySms: true,
    });

    expect(result.status).toBe('approved_refunded');
    expect(result.isEmergencyOverride).toBe(true);
    expect(result.approvedRefundSdg).toBe(350);

    const updatedMetrics = refundService.getQueue().metrics;
    expect(updatedMetrics.emergencyFundBalanceSdg).toBe(initialFund - 350);
  });

  it('adjudicates dispute decision with 100% full refund', () => {
    const result = refundService.submitDisputeDecision({
      refundId: 'REF-2024-8840',
      decision: 'full_refund',
      justification: 'عطل فني مؤكد من تقرير الميناء والـ GPS',
      notifySms: true,
      postLedger: true,
    });

    expect(result.status).toBe('approved_refunded');
    expect(result.approvedRefundSdg).toBe(480);
    expect(result.decision).toBe('full_refund');
  });

  it('updates policy tier parameters', () => {
    const updated = refundService.updatePolicyTier('T-2', {
      passengerRefundPercent: 90,
      cancellationFeePercent: 10,
    });

    const t2 = updated.find((t) => t.tierId === 'T-2');
    expect(t2?.passengerRefundPercent).toBe(90);
    expect(t2?.cancellationFeePercent).toBe(10);
  });

  it('exports UTF-8 BOM CSV with correct Arabic columns', () => {
    const csv = refundService.exportRefundsCsv();
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('رقم التذكرة');
    expect(csv).toContain('ZL-902144');
  });
});
