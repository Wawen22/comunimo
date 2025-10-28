'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUser } from '@/lib/hooks/useUser';
import { supabase } from '@/lib/api/supabase';
import { Member } from '@/lib/types/database';
import { MemberForm } from '@/components/members/MemberForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUser();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const memberId = params.id as string;
  const isLoadingAuth = authLoading || profileLoading;

  // Redirect if not admin
  useEffect(() => {
    if (!isLoadingAuth && (!user || (profile?.role !== 'admin' && profile?.role !== 'super_admin'))) {
      router.push('/dashboard/members');
    }
  }, [user, profile, isLoadingAuth, router]);

  // Fetch member data
  useEffect(() => {
    const fetchMember = async () => {
      if (!memberId) return;

      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('id', memberId)
          .eq('is_active', true)
          .single();

        if (error) throw error;

        if (!data) {
          setError('Atleta non trovato');
          return;
        }

        setMember(data);
      } catch (err: any) {
        console.error('Error fetching member:', err);
        setError('Errore nel caricamento dell\'atleta');
      } finally {
        setLoading(false);
      }
    };

    if (user && (profile?.role === 'admin' || profile?.role === 'super_admin')) {
      fetchMember();
    }
  }, [memberId, user, profile]);

  if (isLoadingAuth || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (!user || (profile?.role !== 'admin' && profile?.role !== 'super_admin')) {
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-800">{error}</p>
          <Link
            href="/dashboard/members"
            className="mt-4 inline-flex items-center text-sm text-red-600 hover:text-red-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna agli Atleti
          </Link>
        </div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/members/${memberId}`}
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna al Dettaglio
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Modifica Atleta: {member.first_name} {member.last_name}
        </h1>
        <p className="mt-2 text-gray-600">
          Aggiorna i dati dell'atleta utilizzando il form multi-step
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <MemberForm member={member} mode="edit" />
      </div>
    </div>
  );
}

