import { useState, useCallback, useMemo } from 'react';
import { reportsService } from '../services/reportsService';

export function useFinancialReports(initialFilters?: {
  quarter?: string;
  state?: string;
  carrier?: string;
  channel?: string;
}) {
  const [filters, setFilters] = useState({
    quarter: 'Q4 2024',
    state: 'all',
    carrier: 'all',
    channel: 'all',
    ...initialFilters,
  });
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const metrics = useMemo(() => {
    void version;
    return reportsService.getDashboardMetrics(filters);
  }, [filters, version]);

  const setQuarter = useCallback((quarter: string) => {
    setFilters((prev) => ({ ...prev, quarter }));
  }, []);

  const setState = useCallback((state: string) => {
    setFilters((prev) => ({ ...prev, state }));
  }, []);

  const setCarrier = useCallback((carrier: string) => {
    setFilters((prev) => ({ ...prev, carrier }));
  }, []);

  const setChannel = useCallback((channel: string) => {
    setFilters((prev) => ({ ...prev, channel }));
  }, []);

  const downloadTrialBalanceCsv = useCallback(() => {
    const csv = reportsService.exportTrialBalanceCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zoolgo-trial-balance-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return {
    metrics,
    filters,
    setQuarter,
    setState,
    setCarrier,
    setChannel,
    downloadTrialBalanceCsv,
    refresh,
  };
}

export function useTrialBalance(initialCategory: string = 'all') {
  const [category, setCategory] = useState(initialCategory);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const data = useMemo(() => {
    void version;
    return reportsService.getTrialBalance(category);
  }, [category, version]);

  const downloadCsv = useCallback(() => {
    const csv = reportsService.exportTrialBalanceCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zoolgo-trial-balance-statement-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return {
    metrics: data,
    data,
    loading: false,
    error: null,
    category,
    setCategory,
    downloadCsv,
    exportCsv: downloadCsv,
    refresh,
  };
}

export function useCarrierShares(initialTier: string = 'all') {
  const [tier, setTier] = useState(initialTier);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const data = useMemo(() => {
    void version;
    return reportsService.getCarrierShares(tier);
  }, [tier, version]);

  const downloadCsv = useCallback(() => {
    const csv = reportsService.exportCarrierSharesCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zoolgo-carrier-shares-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return {
    metrics: data,
    data,
    loading: false,
    error: null,
    tier,
    setTier,
    downloadCsv,
    exportCsv: downloadCsv,
    refresh,
  };
}

export function useExportCenter() {
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const catalog = useMemo(() => {
    void version;
    return reportsService.getExportCatalog();
  }, [version]);

  const history = useMemo(() => {
    void version;
    return reportsService.getExportHistory();
  }, [version]);

  const triggerExport = useCallback(
    (reportId: string, format: 'PDF' | 'Excel' | 'CSV', dateRange: string) => {
      const record = reportsService.triggerReportExport(reportId, format, dateRange);
      refresh();
      return record;
    },
    [refresh]
  );

  return {
    catalog,
    history,
    triggerExport,
    refresh,
  };
}
