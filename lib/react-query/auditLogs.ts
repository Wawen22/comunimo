import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import type { AuditLogEnriched } from '@/types/database';

export interface AuditLogFilters {
  startDate?: string;
  endDate?: string;
  resourceType?: string;
  actorRole?: string;
  actorEmail?: string;
  actionSearch?: string;
}

interface UseAuditLogsParams {
  page: number;
  pageSize: number;
  filters: AuditLogFilters;
}

interface AuditLogsQueryResult {
  logs: AuditLogEnriched[];
  count: number;
}

const auditLogKeys = {
  list: (params: UseAuditLogsParams) => [
    'audit_logs',
    params.page,
    params.pageSize,
    params.filters.startDate ?? null,
    params.filters.endDate ?? null,
    params.filters.resourceType ?? null,
    params.filters.actorRole ?? null,
    params.filters.actorEmail ?? null,
    params.filters.actionSearch ?? null,
  ] as const,
  resourceTypes: ['audit_logs', 'resource_types'] as const,
};

async function fetchAuditLogs({ page, pageSize, filters }: UseAuditLogsParams): Promise<AuditLogsQueryResult> {
  let query = supabase
    .from('audit_logs_enriched')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (filters.startDate) {
    query = query.gte('created_at', new Date(filters.startDate).toISOString());
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    query = query.lte('created_at', end.toISOString());
  }

  if (filters.resourceType) {
    query = query.eq('resource_type', filters.resourceType);
  }

  if (filters.actorRole) {
    query = query.eq('actor_role', filters.actorRole);
  }

  if (filters.actorEmail) {
    query = query.ilike('actor_email', `%${filters.actorEmail}%`);
  }

  if (filters.actionSearch) {
    const search = `%${filters.actionSearch}%`;
    query = query.or(
      `action.ilike.${search},resource_label.ilike.${search},resource_type.ilike.${search}`,
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    logs: (data as AuditLogEnriched[]) ?? [],
    count: count ?? 0,
  };
}

async function fetchResourceTypes(): Promise<string[]> {
  const { data, error } = await supabase
    .from('audit_logs_enriched')
    .select('resource_type')
    .not('resource_type', 'is', null)
    .order('resource_type', { ascending: true });

  if (error) {
    throw error;
  }

  const types = (data ?? [])
    .map((item) => item.resource_type)
    .filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);

  return types;
}

export function useAuditLogs(params: UseAuditLogsParams) {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => fetchAuditLogs(params),
    keepPreviousData: true,
  });
}

export function useAuditLogResourceTypes() {
  return useQuery({
    queryKey: auditLogKeys.resourceTypes,
    queryFn: fetchResourceTypes,
    staleTime: 1000 * 60 * 5,
  });
}
