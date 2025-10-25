'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api/supabase';
import { Users, Building2 } from 'lucide-react';

interface MemberStatsData {
  total: number;
  byOrganization: Record<string, number>;
}

function StatsSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-sm animate-pulse">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
          <div className="h-12 w-24 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-16 w-16 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
}

export function MemberStats() {
  const [stats, setStats] = useState<MemberStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use RPC function to get aggregated stats efficiently
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_member_stats') as { data: Array<{ total_count: number; organization: string; org_count: number }> | null; error: any };

      if (statsError) throw statsError;

      if (!statsData || statsData.length === 0) {
        setStats({
          total: 0,
          byOrganization: {},
        });
        return;
      }

      // Calculate total and group by organization
      let total = 0;
      const byOrganization: Record<string, number> = {};

      statsData.forEach(row => {
        if (row.organization) {
          byOrganization[row.organization] = row.org_count;
          total += row.org_count;
        }
      });

      setStats({
        total,
        byOrganization,
      });
    } catch (error: any) {
      console.error('Error fetching member stats:', error);
      setError('Impossibile caricare le statistiche');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return <StatsSkeleton />;
  }

  if (!stats) {
    return null;
  }

  // Organization colors
  const getOrgColor = (org: string) => {
    switch (org) {
      case 'FIDAL':
        return {
          bg: 'bg-orange-500',
          text: 'text-orange-700',
          light: 'bg-orange-50',
        };
      case 'UISP':
        return {
          bg: 'bg-green-500',
          text: 'text-green-700',
          light: 'bg-green-50',
        };
      default:
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-700',
          light: 'bg-blue-50',
        };
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-6">
        {/* Left side - Main stats */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-5 w-5 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Atleti Registrati
            </h3>
          </div>

          <div className="mb-6">
            <p className="text-5xl font-bold text-gray-900 mb-1">
              {stats.total}
            </p>
            <p className="text-sm text-gray-500">
              {stats.total === 1 ? 'atleta totale' : 'atleti totali'}
            </p>
          </div>

          {/* Organization breakdown */}
          {Object.keys(stats.byOrganization).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.byOrganization)
                .sort(([, a], [, b]) => b - a)
                .map(([org, count]) => {
                  const colors = getOrgColor(org);
                  const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

                  return (
                    <div key={org} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colors.bg}`}></div>
                          <span className="text-sm font-semibold text-gray-700">{org}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-gray-500">
                            {percentage}%
                          </span>
                          <span className="text-lg font-bold text-gray-900 min-w-[2.5rem] text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bg} rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Nessun dato disponibile</p>
          )}
        </div>

        {/* Right side - Icon */}
        <div className="flex-shrink-0">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 shadow-lg">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

