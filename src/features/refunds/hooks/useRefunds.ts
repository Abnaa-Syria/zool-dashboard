import { useState, useCallback, useMemo } from 'react';
import { refundService } from '../services/refundService';
import type {
  RefundChannel,
  RefundDecision,
  CancellationPolicyTier,
} from '../types/refunds';

export function useRefundsQueue() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const { requests, metrics } = useMemo(() => {
    void version;
    return refundService.getQueue({
      status: statusFilter,
      carrierId: carrierFilter,
      search: searchQuery,
    });
  }, [statusFilter, carrierFilter, searchQuery, version]);

  const executeOverride = useCallback(
    (params: {
      ticketNumber: string;
      refundPercent: number;
      customAmountSdg?: number;
      channel: RefundChannel;
      justification: string;
      notifySms: boolean;
    }) => {
      const res = refundService.executeManualOverride(params);
      refresh();
      return res;
    },
    [refresh]
  );

  const exportCsv = useCallback(() => {
    const csv = refundService.exportRefundsCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zoolgo-refunds-queue-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return {
    requests,
    metrics,
    statusFilter,
    setStatusFilter,
    carrierFilter,
    setCarrierFilter,
    searchQuery,
    setSearchQuery,
    executeOverride,
    exportCsv,
    refresh,
  };
}

export function useDisputeDetails(ticketNumber?: string) {
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const dispute = useMemo(() => {
    void version;
    if (!ticketNumber) return undefined;
    return refundService.getRefundById(ticketNumber);
  }, [ticketNumber, version]);

  const submitDecision = useCallback(
    (params: {
      decision: RefundDecision;
      justification: string;
      notifySms: boolean;
      postLedger: boolean;
    }) => {
      if (!dispute) return null;
      const updated = refundService.submitDisputeDecision({
        refundId: dispute.id,
        decision: params.decision,
        justification: params.justification,
        notifySms: params.notifySms,
        postLedger: params.postLedger,
      });
      refresh();
      return updated;
    },
    [dispute, refresh]
  );

  return {
    dispute,
    submitDecision,
    refresh,
  };
}

export function useCancellationPolicies() {
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const tiers = useMemo(() => {
    void version;
    return refundService.getPolicyTiers();
  }, [version]);

  const faultRules = useMemo(() => {
    void version;
    return refundService.getCarrierFaultRules();
  }, [version]);

  const updateTier = useCallback(
    (tierId: string, updates: Partial<CancellationPolicyTier>) => {
      refundService.updatePolicyTier(tierId, updates);
      refresh();
    },
    [refresh]
  );

  const toggleFaultRule = useCallback(
    (ruleId: string, isEnabled: boolean) => {
      refundService.toggleCarrierFaultRule(ruleId, isEnabled);
      refresh();
    },
    [refresh]
  );

  return {
    tiers,
    faultRules,
    updateTier,
    toggleFaultRule,
    refresh,
  };
}
