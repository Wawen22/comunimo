import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/api/supabase';
import type { Society } from '@/types/database';

const societiesKeys = {
  all: ['societies'] as const,
  list: ['societies', 'list'] as const,
  activeList: ['societies', 'list', 'active'] as const,
  detail: (id: string) => ['societies', 'detail', id] as const,
};

async function fetchSocieties({ isActive }: { isActive?: boolean } = {}) {
  let query = supabase
    .from('societies')
    .select('*')
    .order('name', { ascending: true });

  if (typeof isActive === 'boolean') {
    query = query.eq('is_active', isActive);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data as Society[]) ?? [];
}

export function useActiveSocieties() {
  return useQuery<Society[], Error>({
    queryKey: societiesKeys.activeList,
    queryFn: () => fetchSocieties({ isActive: true }),
  });
}

async function deactivateSociety(societyId: string) {
  const { error } = await supabase
    .from('societies')
    // @ts-expect-error - Supabase type inference issue
    .update({ is_active: false })
    .eq('id', societyId);

  if (error) {
    throw new Error(error.message);
  }
}

export function useDeactivateSociety() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, { previousActive?: Society[] }>({
    mutationFn: deactivateSociety,
    onMutate: async (societyId) => {
      await queryClient.cancelQueries({ queryKey: societiesKeys.activeList });

      const previousActive = queryClient.getQueryData<Society[]>(societiesKeys.activeList);

      if (previousActive) {
        queryClient.setQueryData<Society[]>(
          societiesKeys.activeList,
          previousActive.filter((society) => society.id !== societyId),
        );
      }

      return { previousActive };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousActive) {
        queryClient.setQueryData(societiesKeys.activeList, context.previousActive);
      }
    },
    onSuccess: (_data, societyId) => {
      if (societyId) {
        void queryClient.invalidateQueries({ queryKey: societiesKeys.detail(societyId) });
      }
      void queryClient.invalidateQueries({ queryKey: societiesKeys.all });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: societiesKeys.activeList });
    },
  });
}

async function fetchSocietyById(id: string) {
  const { data, error } = await supabase
    .from('societies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Society;
}

export function useSocietyDetail(id: string | null) {
  return useQuery<Society, Error>({
    queryKey: id ? societiesKeys.detail(id) : ['societies', 'detail'],
    queryFn: () => {
      if (!id) throw new Error('Society id non valido');
      return fetchSocietyById(id);
    },
    enabled: Boolean(id),
  });
}

export const societiesQueryKeys = societiesKeys;
