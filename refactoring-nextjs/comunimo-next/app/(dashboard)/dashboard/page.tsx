'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { supabase } from '@/lib/api/supabase';
import { Building2, Users, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const { profile } = useUser();
  const [stats, setStats] = useState({
    societies: 0,
    members: 0,
    events: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadStats();
    }
  }, [profile]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Count societies (RLS will filter based on user role)
      const { count: societiesCount } = await supabase
        .from('societies')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Count members (RLS will filter based on user role)
      const { count: membersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Count events (RLS will filter based on user role)
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      setStats({
        societies: societiesCount || 0,
        members: membersCount || 0,
        events: eventsCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Benvenuto nel tuo pannello di controllo
          {profile?.role === 'society_admin' && ' - Amministratore Società'}
          {profile?.role === 'admin' && ' - Amministratore'}
          {profile?.role === 'super_admin' && ' - Super Amministratore'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                {profile?.role === 'society_admin' ? 'Società Gestite' : 'Società'}
              </h3>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.societies}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Atleti Attivi</h3>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.members}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-3">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Eventi</h3>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.events}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Attività Recenti
        </h2>
        <p className="mt-4 text-gray-600">Nessuna attività recente</p>
      </div>
    </div>
  );
}

