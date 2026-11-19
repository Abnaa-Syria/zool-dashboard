import { useState, useCallback } from 'react';
import type {
  SettlementBatch,
  CarrierSettlementItem,
  BrokerCommissionItem,
  SettlementsMetrics,
} from '../types/settlements';
import {
  settlementService,
  type SettlementFilters,
} from '../services/settlementService';

export function useSettlements(initialFilters: SettlementFilters = {}) {
  const [filters, setFilters] = useState<SettlementFilters>(initialFilters);
  const [data, setData] = useState<{
    batches: SettlementBatch[];
    metrics: SettlementsMetrics;
  }>(() => settlementService.getBatches(initialFilters));

  const [carrierItems, setCarrierItems] = useState<CarrierSettlementItem[]>(() =>
    settlementService.getCarrierItems()
  );

  const [brokerItems, setBrokerItems] = useState<BrokerCommissionItem[]>(() =>
    settlementService.getBrokerItems()
  );

  const refresh = useCallback(() => {
    setData(settlementService.getBatches(filters));
    setCarrierItems([...settlementService.getCarrierItems()]);
    setBrokerItems([...settlementService.getBrokerItems()]);
  }, [filters]);

  const applyFilters = useCallback((newFilters: Partial<SettlementFilters>) => {
    setFilters((prev) => {
      const merged = { ...prev, ...newFilters };
      setData(settlementService.getBatches(merged));
      return merged;
    });
  }, []);

  const approveBatch = useCallback(
    (batchId: string, approverName?: string, sourceAccount?: string) => {
      const updated = settlementService.approveAndDisburseBatch(
        batchId,
        approverName,
        sourceAccount
      );
      refresh();
      return updated;
    },
    [refresh]
  );

  const creditBrokerWallet = useCallback(
    (brokerId: string, amountSdg: number) => {
      const updated = settlementService.creditCommissionToBrokerWallet(brokerId, amountSdg);
      refresh();
      return updated;
    },
    [refresh]
  );

  const disburseBrokerBank = useCallback(
    (brokerId: string) => {
      const updated = settlementService.disburseBrokerCommissionBank(brokerId);
      refresh();
      return updated;
    },
    [refresh]
  );

  const disburseCarrier = useCallback(
    (carrierId: string, paymentRef?: string) => {
      const updated = settlementService.disburseCarrierPayout(carrierId, paymentRef);
      refresh();
      return updated;
    },
    [refresh]
  );

  const exportBankakCsv = useCallback((batchId: string) => {
    const csvContent = settlementService.exportBatchBankakCsv(batchId);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zoolgo_bankak_transfer_${batchId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const exportSummaryCsv = useCallback(() => {
    const csvContent = settlementService.exportSettlementsSummaryCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `zoolgo_settlements_summary_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    batches: data.batches,
    metrics: data.metrics,
    carrierItems,
    brokerItems,
    filters,
    applyFilters,
    refresh,
    approveBatch,
    creditBrokerWallet,
    disburseBrokerBank,
    disburseCarrier,
    exportBankakCsv,
    exportSummaryCsv,
  };
}
