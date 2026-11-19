import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carrierService } from '../services/carrierService';
import type { CarriersFilterState, CarrierAssignedBroker } from '../types/carrier';

export const carrierKeys = {
  all: ['carriers'] as const,
  lists: () => [...carrierKeys.all, 'list'] as const,
  list: (filters: Partial<CarriersFilterState>) => [...carrierKeys.lists(), filters] as const,
  details: () => [...carrierKeys.all, 'detail'] as const,
  detail: (id: string) => [...carrierKeys.details(), id] as const,
};

export function useCarriers(filters: Partial<CarriersFilterState>) {
  return useQuery({
    queryKey: carrierKeys.list(filters),
    queryFn: () => carrierService.getCarriers(filters),
    staleTime: 1000 * 60,
  });
}

export function useCarrier(id: string | undefined) {
  return useQuery({
    queryKey: carrierKeys.detail(id || ''),
    queryFn: () => (id ? carrierService.getCarrierById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
    staleTime: 1000 * 60,
  });
}

export function useAssignBrokerToCarrier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      carrierId,
      assignment,
    }: {
      carrierId: string;
      assignment: Omit<
        CarrierAssignedBroker,
        'assignedAt' | 'assignedBy' | 'totalBookingsThisMonth' | 'totalGmvThisMonthSdg'
      >;
    }) => carrierService.assignBrokerToCarrier(carrierId, assignment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: carrierKeys.detail(variables.carrierId) });
      queryClient.invalidateQueries({ queryKey: carrierKeys.lists() });
    },
  });
}
