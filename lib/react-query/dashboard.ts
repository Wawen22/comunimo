import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/api/supabase';
import type { Event, OrganizationCode, Society, UserRole } from '@/types/database';
import { getUserSocietyIds } from '@/lib/utils/userSocietyUtils';

const dashboardKeys = {
  insights: ['dashboard', 'insights'] as const,
};

export interface DashboardInsights {
  activeSocieties: number;
  activeMembers: number;
  newMembersLast14Days: number;
  upcomingEventsCount: number;
  upcomingEvents: Array<Pick<Event, 'id' | 'title' | 'event_date' | 'location' | 'registration_deadline'>>;
  societiesByOrganization: Array<{ organization: OrganizationCode | 'ALTRO'; count: number }>;
  lastUpdatedAt: string;
}

export interface DashboardInsightsOptions {
  userId?: string | null;
  role?: UserRole | null;
}

function getOrganizationKey(organization: Society['organization']): OrganizationCode | 'ALTRO' {
  return organization ?? 'ALTRO';
}

async function fetchDashboardInsights(options: DashboardInsightsOptions): Promise<DashboardInsights> {
  const { userId, role } = options;
  const isSocietyAdmin = role === 'society_admin';
  const societyIds = isSocietyAdmin && userId ? await getUserSocietyIds(userId) : [];
  const now = new Date();
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 14);
  const thirtyDaysAhead = new Date(now);
  thirtyDaysAhead.setDate(now.getDate() + 30);

  if (isSocietyAdmin && societyIds.length === 0) {
    return {
      activeSocieties: 0,
      activeMembers: 0,
      newMembersLast14Days: 0,
      upcomingEventsCount: 0,
      upcomingEvents: [],
      societiesByOrganization: [],
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  const societiesQuery = supabase
    .from('societies')
    .select('id, organization')
    .eq('is_active', true);
  const membersQuery = supabase
    .from('members')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);
  const newMembersQuery = supabase
    .from('members')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
    .gte('created_at', fourteenDaysAgo.toISOString());
  const upcomingEventsQuery = supabase
    .from('events')
    .select('id, title, event_date, location, registration_deadline')
    .eq('is_active', true)
    .gte('event_date', now.toISOString())
    .lte('event_date', thirtyDaysAhead.toISOString())
    .order('event_date', { ascending: true })
    .limit(5);

  if (isSocietyAdmin) {
    societiesQuery.in('id', societyIds);
    membersQuery.in('society_id', societyIds);
    newMembersQuery.in('society_id', societyIds);
    upcomingEventsQuery.or(`society_id.is.null,society_id.in.(${societyIds.join(',')})`);
  }

  const [societiesRes, membersRes, newMembersRes, upcomingEventsRes] = await Promise.all([
    societiesQuery,
    membersQuery,
    newMembersQuery,
    upcomingEventsQuery,
  ]);

  if (societiesRes.error) throw new Error(societiesRes.error.message);
  if (membersRes.error) throw new Error(membersRes.error.message);
  if (newMembersRes.error) throw new Error(newMembersRes.error.message);
  if (upcomingEventsRes.error) throw new Error(upcomingEventsRes.error.message);

  const activeSocieties = (societiesRes.data ?? []) as Array<Pick<Society, 'id' | 'organization'>>;
  const societiesByOrganizationMap = activeSocieties.reduce<Partial<Record<OrganizationCode | 'ALTRO', number>>>((acc, society) => {
    const key = getOrganizationKey(society.organization);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const societiesByOrganization = Object.entries(societiesByOrganizationMap)
    .filter(([_, count]) => count && count > 0)
    .map(([organization, count]) => ({ organization: organization as OrganizationCode | 'ALTRO', count: count as number }))
    .sort((a, b) => b.count - a.count);

  const upcomingEvents = ((upcomingEventsRes.data ?? []) as Array<Pick<Event, 'id' | 'title' | 'event_date' | 'location' | 'registration_deadline'>>).map((event) => ({
    id: event.id,
    title: event.title,
    event_date: event.event_date,
    location: event.location,
    registration_deadline: event.registration_deadline,
  }));

  return {
    activeSocieties: activeSocieties.length,
    activeMembers: membersRes.count ?? 0,
    newMembersLast14Days: newMembersRes.count ?? 0,
    upcomingEventsCount: upcomingEvents.length,
    upcomingEvents,
    societiesByOrganization,
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function useDashboardInsights(options: DashboardInsightsOptions = {}) {
  const userId = options.userId ?? null;
  const role = options.role ?? null;
  return useQuery<DashboardInsights, Error>({
    queryKey: [...dashboardKeys.insights, userId, role],
    queryFn: () => fetchDashboardInsights({ userId, role }),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
    enabled: Boolean(userId),
  });
}

export const dashboardQueryKeys = dashboardKeys;
