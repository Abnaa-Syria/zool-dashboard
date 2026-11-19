import { useState, useCallback, useMemo } from 'react';
import type {
  WalletsFilterState,
  LedgerFilterState,
  PaymentChannel,
} from '../types/financials';
import { financialService } from '../services/financialService';

const defaultWalletsFilters: WalletsFilterState = {
  searchQuery: '',
  status: 'all',
  agencyTier: 'all',
  state: 'all',
  sortBy: 'balance_desc',
  page: 1,
  pageSize: 10,
};

const defaultLedgerFilters: LedgerFilterState = {
  searchQuery: '',
  transactionType: 'all',
  targetParty: 'all',
  dateRange: 'today',
  page: 1,
  pageSize: 10,
};

export function useWallets(initialFilters?: Partial<WalletsFilterState>) {
  const [filters, setFilters] = useState<WalletsFilterState>({
    ...defaultWalletsFilters,
    ...initialFilters,
  });
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const metrics = useMemo(() => {
    void version;
    return financialService.getWalletsMetrics();
  }, [version]);

  const queryResult = useMemo(() => {
    void version;
    return financialService.getWallets(filters);
  }, [filters, version]);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery, page: 1 }));
  }, []);

  const setStatus = useCallback((status: WalletsFilterState['status']) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const setAgencyTier = useCallback((agencyTier: WalletsFilterState['agencyTier']) => {
    setFilters((prev) => ({ ...prev, agencyTier, page: 1 }));
  }, []);

  const setState = useCallback((state: string) => {
    setFilters((prev) => ({ ...prev, state, page: 1 }));
  }, []);

  const setSortBy = useCallback((sortBy: WalletsFilterState['sortBy']) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultWalletsFilters);
  }, []);

  const recordTopUp = useCallback(
    (
      brokerId: string,
      amountSdg: number,
      channel: PaymentChannel,
      bankReference: string,
      notes?: string
    ) => {
      const res = financialService.recordTopUp(
        brokerId,
        amountSdg,
        channel,
        bankReference,
        notes
      );
      refresh();
      return res;
    },
    [refresh]
  );

  const downloadCsv = useCallback(() => {
    const csv = financialService.exportWalletsCsv(filters);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zoolgo-wallets-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filters]);

  return {
    metrics,
    wallets: queryResult.wallets,
    total: queryResult.total,
    page: queryResult.page,
    pageSize: queryResult.pageSize,
    totalPages: queryResult.totalPages,
    filters,
    setSearchQuery,
    setStatus,
    setAgencyTier,
    setState,
    setSortBy,
    setPage,
    setPageSize,
    resetFilters,
    recordTopUp,
    downloadCsv,
    refresh,
  };
}

export function useGeneralLedger(initialFilters?: Partial<LedgerFilterState>) {
  const [filters, setFilters] = useState<LedgerFilterState>({
    ...defaultLedgerFilters,
    ...initialFilters,
  });
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const metrics = useMemo(() => {
    void version;
    return financialService.getLedgerMetrics();
  }, [version]);

  const queryResult = useMemo(() => {
    void version;
    return financialService.getLedgerEntries(filters);
  }, [filters, version]);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery, page: 1 }));
  }, []);

  const setTransactionType = useCallback((transactionType: LedgerFilterState['transactionType']) => {
    setFilters((prev) => ({ ...prev, transactionType, page: 1 }));
  }, []);

  const setTargetParty = useCallback((targetParty: string) => {
    setFilters((prev) => ({ ...prev, targetParty, page: 1 }));
  }, []);

  const setDateRange = useCallback((dateRange: LedgerFilterState['dateRange']) => {
    setFilters((prev) => ({ ...prev, dateRange, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultLedgerFilters);
  }, []);

  const downloadCsv = useCallback(() => {
    const csv = financialService.exportLedgerCsv(filters);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zoolgo-general-ledger-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filters]);

  return {
    metrics,
    entries: queryResult.entries,
    total: queryResult.total,
    page: queryResult.page,
    pageSize: queryResult.pageSize,
    totalPages: queryResult.totalPages,
    filters,
    setSearchQuery,
    setTransactionType,
    setTargetParty,
    setDateRange,
    setPage,
    setPageSize,
    resetFilters,
    downloadCsv,
    refresh,
  };
}

export function useTopUpQueue() {
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const queue = useMemo(() => {
    void version;
    return financialService.getTopUpQueue();
  }, [version]);

  const approveRequest = useCallback(
    (requestId: string, approvedBy: string) => {
      const success = financialService.approveTopUpRequest(requestId, approvedBy);
      refresh();
      return success;
    },
    [refresh]
  );

  const rejectRequest = useCallback(
    (requestId: string, reason: string) => {
      const success = financialService.rejectTopUpRequest(requestId, reason);
      refresh();
      return success;
    },
    [refresh]
  );

  return {
    queue,
    approveRequest,
    rejectRequest,
    refresh,
  };
}

export function useJournalEntryDetails(entryId: string) {
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const entry = useMemo(() => {
    void version;
    return financialService.getLedgerEntryById(entryId);
  }, [entryId, version]);

  return {
    entry,
    refresh,
  };
}
