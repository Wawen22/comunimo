'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Users, Trophy, Flag, TrendingUp, Award, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegistrationsStatsProps {
  registrations: any[];
  loading?: boolean;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: number;
  delay?: number;
}

function StatCard({ title, value, icon, color, subtitle, trend, delay = 0 }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      
      // Animate counter if value is a number
      if (typeof value === 'number') {
        const duration = 1000;
        const steps = 30;
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
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-2 p-6 transition-all duration-500',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        'hover:shadow-xl hover:scale-105'
      )}
    >
      {/* Background gradient */}
      <div className={cn('absolute inset-0 opacity-5', color)} />

      {/* Icon */}
      <div className="relative flex items-start justify-between mb-4">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl shadow-lg', color)}>
          {icon}
        </div>
        {trend !== undefined && trend !== 0 && (
          <div className={cn(
            'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}>
            <TrendingUp className={cn('h-3 w-3', trend < 0 && 'rotate-180')} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">
          {typeof value === 'number' ? displayValue : value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}

/**
 * Statistics dashboard for registrations
 * Features:
 * - Animated counters
 * - Color-coded stats
 * - Trend indicators
 * - Responsive grid layout
 * - Smooth animations
 */
export function RegistrationsStats({ registrations, loading = false }: RegistrationsStatsProps) {
  const [stats, setStats] = useState({
    total: 0,
    fidal: 0,
    uisp: 0,
    csi: 0,
    runcard: 0,
    male: 0,
    female: 0,
    categories: {} as Record<string, number>,
  });

  useEffect(() => {
    if (!registrations || registrations.length === 0) {
      setStats({
        total: 0,
        fidal: 0,
        uisp: 0,
        csi: 0,
        runcard: 0,
        male: 0,
        female: 0,
        categories: {},
      });
      return;
    }

    const newStats = {
      total: registrations.length,
      fidal: registrations.filter(r => r.organization === 'FIDAL').length,
      uisp: registrations.filter(r => r.organization === 'UISP').length,
      csi: registrations.filter(r => r.organization === 'CSI').length,
      runcard: registrations.filter(r => r.organization === 'RUNCARD').length,
      male: registrations.filter(r => r.member?.gender === 'M').length,
      female: registrations.filter(r => r.member?.gender === 'F').length,
      categories: {} as Record<string, number>,
    };

    // Count categories
    registrations.forEach(r => {
      if (r.category) {
        newStats.categories[r.category] = (newStats.categories[r.category] || 0) + 1;
      }
    });

    setStats(newStats);
  }, [registrations]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4" />
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </Card>
        ))}
      </div>
    );
  }

  const topCategory = Object.entries(stats.categories).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-6 mb-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Totale Iscritti"
          value={stats.total}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-brand-blue to-brand-blue-dark"
          subtitle="Atleti confermati"
          delay={0}
        />

        <StatCard
          title="FIDAL"
          value={stats.fidal}
          icon={<Trophy className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-green-500 to-green-600"
          subtitle={`${stats.total > 0 ? Math.round((stats.fidal / stats.total) * 100) : 0}% del totale`}
          delay={100}
        />

        <StatCard
          title="UISP"
          value={stats.uisp}
          icon={<Flag className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          subtitle={`${stats.total > 0 ? Math.round((stats.uisp / stats.total) * 100) : 0}% del totale`}
          delay={200}
        />

        <StatCard
          title="Categoria Top"
          value={topCategory ? topCategory[0] : '-'}
          icon={<Award className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          subtitle={topCategory ? `${topCategory[1]} atleti` : 'Nessuna categoria'}
          delay={300}
        />
      </div>

      {/* Secondary Stats */}
      {(stats.male > 0 || stats.female > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Uomini"
            value={stats.male}
            icon={<Users className="h-5 w-5 text-white" />}
            color="bg-gradient-to-br from-blue-400 to-blue-500"
            subtitle={`${stats.total > 0 ? Math.round((stats.male / stats.total) * 100) : 0}% del totale`}
            delay={400}
          />

          <StatCard
            title="Donne"
            value={stats.female}
            icon={<Users className="h-5 w-5 text-white" />}
            color="bg-gradient-to-br from-pink-400 to-pink-500"
            subtitle={`${stats.total > 0 ? Math.round((stats.female / stats.total) * 100) : 0}% del totale`}
            delay={450}
          />

          {(stats.csi > 0 || stats.runcard > 0) && (
            <StatCard
              title="Altri Enti"
              value={stats.csi + stats.runcard}
              icon={<Target className="h-5 w-5 text-white" />}
              color="bg-gradient-to-br from-gray-400 to-gray-500"
              subtitle={`CSI: ${stats.csi}, Runcard: ${stats.runcard}`}
              delay={500}
            />
          )}
        </div>
      )}

      {/* Categories Breakdown */}
      {Object.keys(stats.categories).length > 0 && (
        <Card className="p-6 border-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-brand-blue" />
            Distribuzione per Categoria
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(stats.categories)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count], index) => (
                <div
                  key={category}
                  className="flex flex-col items-center justify-center p-3 rounded-lg bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-brand-blue hover:shadow-md transition-all duration-300"
                  style={{
                    animation: `fadeIn 0.5s ease-out ${index * 50}ms both`
                  }}
                >
                  <span className="text-2xl font-bold text-brand-blue">{count}</span>
                  <span className="text-xs font-semibold text-gray-600 mt-1">{category}</span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}

