'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api/supabase';
import { Users, UserCheck, AlertTriangle, Building2, Trophy, Calendar } from 'lucide-react';
import { getDaysUntilExpiry } from '@/lib/utils/expiryCheck';

interface MemberStatsData {
  total: number;
  active: number;
  expiringSoon: number;
  byOrganization: Record<string, number>;
  byCategory: Record<string, number>;
  averageAge: number;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

function StatCard({ title, value, icon: Icon, description, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'text-blue-600 bg-blue-50',
    success: 'text-green-600 bg-green-50',
    warning: 'text-orange-600 bg-orange-50',
    danger: 'text-red-600 bg-red-50',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
        <div className={`rounded-lg p-3 ${variantStyles[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="mt-2 h-8 w-16 bg-gray-200 rounded"></div>
          <div className="mt-1 h-3 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
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

      // Fetch all active members
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, membership_status, organization, category, birth_date, card_expiry_date, medical_certificate_expiry')
        .eq('is_active', true) as { data: any[] | null; error: any };

      if (membersError) throw membersError;

      if (!members) {
        setStats({
          total: 0,
          active: 0,
          expiringSoon: 0,
          byOrganization: {},
          byCategory: {},
          averageAge: 0,
        });
        return;
      }

      // Calculate stats
      const total = members.length;
      const active = members.filter(m => m.membership_status === 'active').length;

      // Count expiring soon (medical certificate expiring in ≤30 days)
      const expiringSoon = members.filter(m => {
        const medicalDays = getDaysUntilExpiry(m.medical_certificate_expiry);
        const medicalExpiring = medicalDays !== null && medicalDays >= 0 && medicalDays <= 30;
        return medicalExpiring;
      }).length;

      // Group by organization
      const byOrganization: Record<string, number> = {};
      members.forEach(m => {
        if (m.organization) {
          byOrganization[m.organization] = (byOrganization[m.organization] || 0) + 1;
        }
      });

      // Group by category
      const byCategory: Record<string, number> = {};
      members.forEach(m => {
        if (m.category) {
          byCategory[m.category] = (byCategory[m.category] || 0) + 1;
        }
      });

      // Calculate average age
      const ages = members
        .filter(m => m.birth_date)
        .map(m => {
          const birthDate = new Date(m.birth_date!);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age;
        });

      const averageAge = ages.length > 0
        ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)
        : 0;

      setStats({
        total,
        active,
        expiringSoon,
        byOrganization,
        byCategory,
        averageAge,
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
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Get top organization
  const topOrg = Object.entries(stats.byOrganization)
    .sort(([, a], [, b]) => b - a)[0];
  const topOrgText = topOrg ? `${topOrg[0]}: ${topOrg[1]}` : 'Nessuno';

  // Get top category
  const topCategory = Object.entries(stats.byCategory)
    .sort(([, a], [, b]) => b - a)[0];
  const topCategoryText = topCategory ? `${topCategory[0]}: ${topCategory[1]}` : 'Nessuna';

  // Default color scheme (blue)
  const colors = {
    primary: 'text-blue-600 bg-blue-50',
    badge: 'bg-blue-100 text-blue-800',
    bar: 'bg-blue-600',
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Totale Atleti"
          value={stats.total}
          icon={Users}
          description="Atleti registrati"
          variant="default"
        />

        <StatCard
          title="Atleti Attivi"
          value={stats.active}
          icon={UserCheck}
          description={stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% del totale` : '0%'}
          variant="success"
        />

        <StatCard
          title="In Scadenza"
          value={stats.expiringSoon}
          icon={AlertTriangle}
          description="Documenti in scadenza"
          variant={stats.expiringSoon > 0 ? 'warning' : 'default'}
        />

        <StatCard
          title="Età Media"
          value={stats.averageAge > 0 ? `${stats.averageAge} anni` : '-'}
          icon={Calendar}
          description="Media età atleti"
          variant="default"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Organization breakdown */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg p-2 bg-blue-50 text-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Per Ente</h3>
          </div>

          {Object.keys(stats.byOrganization).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.byOrganization)
                .sort(([, a], [, b]) => b - a)
                .map(([org, count]) => {
                  const orgColor = org === 'FIDAL' ? 'bg-orange-600' : org === 'UISP' ? 'bg-green-600' : 'bg-blue-600';
                  return (
                    <div key={org} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{org}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${orgColor} rounded-full`}
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nessun dato disponibile</p>
          )}
        </div>

        {/* Category breakdown */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className={`rounded-lg p-2 ${colors.primary}`}>
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Per Categoria</h3>
          </div>

          {Object.keys(stats.byCategory).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.byCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5) // Show top 5 categories
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bar} rounded-full`}
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nessun dato disponibile</p>
          )}
        </div>
      </div>
    </div>
  );
}

