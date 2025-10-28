'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUser } from '@/lib/hooks/useUser';
import { MemberForm } from '@/components/members/MemberForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewMemberPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUser();

  const loading = authLoading || profileLoading;

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || (profile?.role !== 'admin' && profile?.role !== 'super_admin'))) {
      router.push('/dashboard/members');
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (!user || (profile?.role !== 'admin' && profile?.role !== 'super_admin')) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/members"
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna agli Atleti
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nuovo Atleta</h1>
        <p className="mt-2 text-gray-600">
          Compila il form multi-step per creare un nuovo atleta
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <MemberForm mode="create" />
      </div>
    </div>
  );
}

