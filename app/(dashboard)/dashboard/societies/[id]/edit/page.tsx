'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/api/supabase';
import { Society } from '@/types/database';
import { Button } from '@/components/ui/button';
import { SocietyForm } from '@/components/societies/SocietyForm';
import { RequireRole } from '@/components/auth/RequireRole';
import { useToast } from '@/components/ui/toast';

interface EditSocietyPageProps {
  params: {
    id: string;
  };
}

export default function EditSocietyPage({ params }: EditSocietyPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [society, setSociety] = useState<Society | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSociety();
  }, [params.id]);

  const fetchSociety = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('societies')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;

      setSociety(data);
    } catch (error) {
      console.error('Error fetching society:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare la società',
        variant: 'destructive',
      });
      router.push('/dashboard/societies');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!society) {
    return null;
  }

  return (
    <RequireRole role="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/societies/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna al dettaglio
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modifica Società</h1>
          <p className="mt-2 text-gray-600">
            Modifica i dati di <strong>{society.name}</strong>
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <SocietyForm society={society} mode="edit" />
        </div>
      </div>
    </RequireRole>
  );
}

