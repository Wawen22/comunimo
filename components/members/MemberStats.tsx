'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api/supabase';
import { useUser } from '@/lib/hooks/useUser';
import { Users, Trophy, Flag, TrendingUp } from 'lucide-react';

interface MemberStatsData {
  total: number;
  byOrganization: Record<string, number>;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  subtitle?: string;
  delay?: number;
}

function StatCard({ title, value, icon, color, bgGradient, subtitle, delay = 0 }: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);

      // Animate counter
      const duration = 800;
      const steps = 20;
      const increment = value / steps;
      let current = 0;

      const counter = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(counter);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border-2 border-gray-200 p-4 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 ${bgGradient} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Background gradient overlay on hover */}
      <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start justify-between gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 uppercase tracking-wide truncate">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1">
            {displayValue}
          </p>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Icon */}
        <div className={`flex-shrink-0 rounded-lg ${color} p-2 sm:p-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Total Card Skeleton */}
      <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 sm:p-5 shadow-sm animate-pulse">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 sm:h-10 w-16 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 w-28 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Organization Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 sm:p-5 shadow-sm animate-pulse">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 sm:h-10 w-12 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MemberStats() {
  const { profile } = useUser();
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

  // Determine title based on user role
  const isSocietyAdmin = profile?.role === 'society_admin';
  const totalLabel = isSocietyAdmin ? 'Atleti Gestiti' : 'Totale Atleti';
  const totalSubtitle = isSocietyAdmin
    ? (stats.total === 1 ? 'atleta gestito' : 'atleti gestiti')
    : (stats.total === 1 ? 'atleta registrato' : 'atleti registrati');

  // Prepare organization stats
  const orgStats = Object.entries(stats.byOrganization)
    .sort(([, a], [, b]) => b - a)
    .map(([org, count]) => ({
      org,
      count,
      percentage: stats.total > 0 ? Math.round((count / stats.total) * 100) : 0,
    }));

  // Get FIDAL and UISP stats
  const fidalStats = orgStats.find(s => s.org === 'FIDAL');
  const uispStats = orgStats.find(s => s.org === 'UISP');
  const otherOrgs = orgStats.filter(s => s.org !== 'FIDAL' && s.org !== 'UISP');

  return (
    <>
      {/* Mobile Layout (<1024px) */}
      <div className="lg:hidden space-y-3 sm:space-y-4">
        {/* Total Athletes Card - Full Width */}
        <StatCard
          title={totalLabel}
          value={stats.total}
          icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          bgGradient="bg-gradient-to-br from-blue-50 via-blue-50/50 to-white"
          subtitle={totalSubtitle}
          delay={0}
        />

        {/* FIDAL and UISP Cards - Side by Side on Mobile */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* FIDAL Card */}
          {fidalStats && (
            <StatCard
              title="FIDAL"
              value={fidalStats.count}
              icon={<Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
              color="bg-gradient-to-br from-green-500 to-green-600"
              bgGradient="bg-gradient-to-br from-green-50 via-green-50/50 to-white"
              subtitle={`${fidalStats.percentage}% del totale`}
              delay={100}
            />
          )}

          {/* UISP Card */}
          {uispStats && (
            <StatCard
              title="UISP"
              value={uispStats.count}
              icon={<Flag className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              bgGradient="bg-gradient-to-br from-purple-50 via-purple-50/50 to-white"
              subtitle={`${uispStats.percentage}% del totale`}
              delay={200}
            />
          )}
        </div>

        {/* Other Organizations Card (if any) - Full Width */}
        {otherOrgs.length > 0 && (
          <StatCard
            title="Altri Enti"
            value={otherOrgs.reduce((sum, s) => sum + s.count, 0)}
            icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            bgGradient="bg-gradient-to-br from-orange-50 via-orange-50/50 to-white"
            subtitle={`${otherOrgs.reduce((sum, s) => sum + s.percentage, 0)}% del totale`}
            delay={300}
          />
        )}
      </div>

      {/* Desktop Layout (≥1024px) - All in One Row */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-4">
        {/* Total Athletes Card */}
        <StatCard
          title={totalLabel}
          value={stats.total}
          icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          bgGradient="bg-gradient-to-br from-blue-50 via-blue-50/50 to-white"
          subtitle={totalSubtitle}
          delay={0}
        />

        {/* FIDAL Card */}
        {fidalStats && (
          <StatCard
            title="FIDAL"
            value={fidalStats.count}
            icon={<Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
            color="bg-gradient-to-br from-green-500 to-green-600"
            bgGradient="bg-gradient-to-br from-green-50 via-green-50/50 to-white"
            subtitle={`${fidalStats.percentage}% del totale`}
            delay={100}
          />
        )}

        {/* UISP Card */}
        {uispStats && (
          <StatCard
            title="UISP"
            value={uispStats.count}
            icon={<Flag className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            bgGradient="bg-gradient-to-br from-purple-50 via-purple-50/50 to-white"
            subtitle={`${uispStats.percentage}% del totale`}
            delay={200}
          />
        )}

        {/* Other Organizations Card (if any) */}
        {otherOrgs.length > 0 && (
          <StatCard
            title="Altri Enti"
            value={otherOrgs.reduce((sum, s) => sum + s.count, 0)}
            icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            bgGradient="bg-gradient-to-br from-orange-50 via-orange-50/50 to-white"
            subtitle={`${otherOrgs.reduce((sum, s) => sum + s.percentage, 0)}% del totale`}
            delay={300}
          />
        )}
      </div>
    </>
  );
}

