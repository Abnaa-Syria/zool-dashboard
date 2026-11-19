import { useState, useCallback, useMemo } from 'react';
import type {
  TravelerFilterState,
  TravelerAccountStatus,
  TravelerVerificationStatus,
} from '../types/traveler';
import { travelerService } from '../services/travelerService';

const defaultFilters: TravelerFilterState = {
  searchQuery: '',
  accountStatus: 'all',
  verificationStatus: 'all',
  bookingActivity: 'all',
  mainCity: '',
  page: 1,
  pageSize: 10,
};

export function useTravelers(initialFilters?: Partial<TravelerFilterState>) {
  const [filters, setFilters] = useState<TravelerFilterState>({
    ...defaultFilters,
    ...initialFilters,
  });

  const [version, setVersion] = useState(0);
  const [selectedTravelerId, setSelectedTravelerId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const kpis = useMemo(() => {
    // depend on version to recompute
    void version;
    return travelerService.getKpis();
  }, [version]);

  const queryResult = useMemo(() => {
    void version;
    return travelerService.getTravelers(filters);
  }, [filters, version]);

  const selectedTraveler = useMemo(() => {
    if (!selectedTravelerId) return null;
    void version;
    return travelerService.getTravelerById(selectedTravelerId) || null;
  }, [selectedTravelerId, version]);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery, page: 1 }));
  }, []);

  const setAccountStatus = useCallback((accountStatus: TravelerAccountStatus | 'all') => {
    setFilters((prev) => ({ ...prev, accountStatus, page: 1 }));
  }, []);

  const setVerificationStatus = useCallback((verificationStatus: TravelerVerificationStatus | 'all') => {
    setFilters((prev) => ({ ...prev, verificationStatus, page: 1 }));
  }, []);

  const setBookingActivity = useCallback((bookingActivity: TravelerFilterState['bookingActivity']) => {
    setFilters((prev) => ({ ...prev, bookingActivity, page: 1 }));
  }, []);

  const setMainCity = useCallback((mainCity: string) => {
    setFilters((prev) => ({ ...prev, mainCity, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const verifyKyc = useCallback(
    (travelerId: string, decision: 'approve' | 'reject', notes?: string) => {
      const res = travelerService.verifyKyc(travelerId, decision, notes);
      refresh();
      return res;
    },
    [refresh]
  );

  const updateAccountStatus = useCallback(
    (travelerId: string, status: TravelerAccountStatus, reason?: string) => {
      const res = travelerService.updateAccountStatus(travelerId, status, reason);
      refresh();
      return res;
    },
    [refresh]
  );

  const terminateSession = useCallback(
    (travelerId: string, sessionId: string) => {
      const success = travelerService.terminateSession(travelerId, sessionId);
      refresh();
      return success;
    },
    [refresh]
  );

  const addNote = useCallback(
    (travelerId: string, author: string, role: string, content: string) => {
      const res = travelerService.addTravelerNote(travelerId, author, role, content);
      refresh();
      return res;
    },
    [refresh]
  );

  const downloadCsv = useCallback(() => {
    const csv = travelerService.exportTravelersCsv(filters);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zoolgo-travelers-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filters]);

  return {
    kpis,
    travelers: queryResult.travelers,
    total: queryResult.total,
    page: queryResult.page,
    pageSize: queryResult.pageSize,
    totalPages: queryResult.totalPages,
    filters,
    selectedTraveler,
    setSelectedTravelerId,
    setSearchQuery,
    setAccountStatus,
    setVerificationStatus,
    setBookingActivity,
    setMainCity,
    setPage,
    setPageSize,
    resetFilters,
    refresh,
    verifyKyc,
    updateAccountStatus,
    terminateSession,
    addNote,
    downloadCsv,
  };
}

export function useTravelerDetails(travelerId: string) {
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const traveler = useMemo(() => {
    void version;
    return travelerService.getTravelerById(travelerId);
  }, [travelerId, version]);

  const trips = useMemo(() => {
    void version;
    return travelerService.getTravelerTrips(travelerId);
  }, [travelerId, version]);

  const sessions = useMemo(() => {
    void version;
    return travelerService.getTravelerSecuritySessions(travelerId);
  }, [travelerId, version]);

  const securityLogs = useMemo(() => {
    void version;
    return travelerService.getTravelerSecurityLogs(travelerId);
  }, [travelerId, version]);

  const verifyKyc = useCallback(
    (decision: 'approve' | 'reject', notes?: string) => {
      const res = travelerService.verifyTravelerKyc(travelerId, decision, notes);
      refresh();
      return res;
    },
    [travelerId, refresh]
  );

  const updateAccountStatus = useCallback(
    (status: TravelerAccountStatus, reason?: string) => {
      const res = travelerService.updateAccountStatus(travelerId, status, reason);
      refresh();
      return res;
    },
    [travelerId, refresh]
  );

  const terminateSession = useCallback(
    (sessionId: string) => {
      const res = travelerService.terminateSession(travelerId, sessionId);
      refresh();
      return res;
    },
    [travelerId, refresh]
  );

  const addNote = useCallback(
    (author: string, role: string, content: string) => {
      const res = travelerService.addTravelerNote(travelerId, author, role, content);
      refresh();
      return res;
    },
    [travelerId, refresh]
  );

  return {
    traveler,
    trips,
    sessions,
    securityLogs,
    refresh,
    verifyKyc,
    updateAccountStatus,
    terminateSession,
    addNote,
  };
}
