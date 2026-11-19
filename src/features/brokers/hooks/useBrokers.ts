import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brokerService } from '../services/brokerService';
import type { BrokersFilterState } from '../types/broker';

export const brokerKeys = {
  all: ['brokers'] as const,
  lists: () => [...brokerKeys.all, 'list'] as const,
  list: (filters: Partial<BrokersFilterState>) => [...brokerKeys.lists(), filters] as const,
  details: () => [...brokerKeys.all, 'detail'] as const,
  detail: (id: string) => [...brokerKeys.details(), id] as const,
};

export function useBrokers(filters: Partial<BrokersFilterState>) {
  return useQuery({
    queryKey: brokerKeys.list(filters),
    queryFn: () => brokerService.getBrokers(filters),
    staleTime: 1000 * 60,
  });
}

export function useBroker(id: string | undefined) {
  return useQuery({
    queryKey: brokerKeys.detail(id || ''),
    queryFn: () => (id ? brokerService.getBrokerById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
    staleTime: 1000 * 60,
  });
}

export function useTopUpBrokerWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      brokerId,
      amount,
      transactionRef,
      notes,
    }: {
      brokerId: string;
      amount: number;
      transactionRef: string;
      notes?: string;
    }) => brokerService.topUpBrokerWallet(brokerId, amount, transactionRef, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: brokerKeys.detail(variables.brokerId) });
      queryClient.invalidateQueries({ queryKey: brokerKeys.lists() });
    },
  });
}
