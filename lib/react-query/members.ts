import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/api/supabase';
import type { Member } from '@/lib/types/database';

export interface MemberWithSociety extends Member {
  society?: {
    id: string;
    name: string;
    society_code: string | null;
  } | null;
}

export interface MembersFilters {
  search: string;
  societyIds: string[];
  category: string;
  status: string;
  showExpiring: boolean;
}

interface MembersQueryParams {
  page: number;
  pageSize: number;
  filters: MembersFilters;
}

interface MembersQueryResult {
  members: MemberWithSociety[];
  count: number;
}

const membersKeys = {
  all: ['members'] as const,
  list: (params: MembersQueryParams) => (
    [
      'members',
      'list',
      params.page,
      params.pageSize,
      params.filters.search,
      params.filters.category,
      params.filters.status,
      params.filters.showExpiring ? '1' : '0',
      [...params.filters.societyIds].sort().join('|'),
    ] as const
  ),
  detail: (id: string) => ['members', 'detail', id] as const,
  base: (id: string) => ['members', 'base', id] as const,
};

function buildSearchFilter(searchTerm: string) {
  const trimmedSearch = searchTerm.trim();
  if (!trimmedSearch) return null;

  const words = trimmedSearch.split(/\s+/).filter((word) => word.length > 0);

  if (words.length === 0) return null;

  if (words.length === 1) {
    const word = words[0];
    return `first_name.ilike.%${word}%,last_name.ilike.%${word}%,fiscal_code.ilike.%${word}%,membership_number.ilike.%${word}%`;
  }

  const conditions: string[] = [];

  words.forEach((word) => {
    conditions.push(`first_name.ilike.%${word}%`);
    conditions.push(`last_name.ilike.%${word}%`);
  });

  conditions.push(`fiscal_code.ilike.%${trimmedSearch}%`);
  conditions.push(`membership_number.ilike.%${trimmedSearch}%`);

  return conditions.join(',');
}

async function fetchMembers(params: MembersQueryParams): Promise<MembersQueryResult> {
  const { page, pageSize, filters } = params;

  let query = supabase
    .from('members')
    .select(
      `
        *,
        society:societies(id, name, society_code)
      `,
      { count: 'exact' }
    )
    .eq('is_active', true)
    .order('last_name', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const searchFilter = buildSearchFilter(filters.search);
  if (searchFilter) {
    query = query.or(searchFilter);
  }

  if (filters.societyIds.length > 0) {
    query = query.in('society_id', filters.societyIds);
  }

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.status) {
    query = query.eq('membership_status', filters.status);
  }

  if (filters.showExpiring) {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    query = query.lte('medical_certificate_expiry', thirtyDaysFromNow.toISOString());
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    members: (data as MemberWithSociety[]) ?? [],
    count: count ?? 0,
  };
}

async function fetchMemberDetail(id: string) {
  const { data, error } = await supabase
    .from('members')
    .select(
      `
        *,
        society:societies(id, name, society_code)
      `,
    )
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as MemberWithSociety;
}

async function fetchMember(id: string) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Member;
}

export function useMembersQuery(params: MembersQueryParams) {
  return useQuery<MembersQueryResult, Error>({
    queryKey: membersKeys.list(params),
    queryFn: () => fetchMembers(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useMemberDetail(memberId: string | null) {
  return useQuery<MemberWithSociety, Error>({
    queryKey: memberId ? membersKeys.detail(memberId) : ['members', 'detail'],
    queryFn: () => {
      if (!memberId) throw new Error('Member id non valido');
      return fetchMemberDetail(memberId);
    },
    enabled: Boolean(memberId),
  });
}

export function useMember(memberId: string | null) {
  return useQuery<Member, Error>({
    queryKey: memberId ? membersKeys.base(memberId) : ['members', 'base'],
    queryFn: () => {
      if (!memberId) throw new Error('Member id non valido');
      return fetchMember(memberId);
    },
    enabled: Boolean(memberId),
  });
}

export const membersQueryKeys = membersKeys;
