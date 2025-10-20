'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/api/supabase';
import { Member } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useIsAdmin } from '@/lib/hooks/useUser';
import { Plus, Search, Download, Filter } from 'lucide-react';
import { MemberStatusBadge } from './MemberStatusBadge';
import { MemberFilters } from './MemberFilters';

interface MemberWithSociety extends Member {
  society?: {
    id: string;
    name: string;
  } | null;
}

interface MemberFiltersState {
  search: string;
  societyId: string;
  organization: string;
  category: string;
  status: string;
  showExpiring: boolean;
}

export function MembersList() {
  const router = useRouter();
  const { toast } = useToast();
  const isAdmin = useIsAdmin();
  
  const [members, setMembers] = useState<MemberWithSociety[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MemberFiltersState>({
    search: '',
    societyId: '',
    organization: '',
    category: '',
    status: '',
    showExpiring: false,
  });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    fetchMembers();
  }, [filters, page]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);

      // Build query
      let query = supabase
        .from('members')
        .select(`
          *,
          society:societies(id, name)
        `, { count: 'exact' })
        .eq('is_active', true)
        .order('last_name', { ascending: true })
        .range((page - 1) * pageSize, page * pageSize - 1);

      // Apply filters
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,fiscal_code.ilike.%${filters.search}%,membership_number.ilike.%${filters.search}%`);
      }

      if (filters.societyId) {
        query = query.eq('society_id', filters.societyId);
      }

      if (filters.organization) {
        query = query.eq('organization', filters.organization);
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
        query = query.lte('card_expiry_date', thirtyDaysFromNow.toISOString());
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setMembers(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      console.error('Error fetching members:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare gli atleti',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: 'Info',
      description: 'Funzionalità di export in arrivo',
      variant: 'default',
    });
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('it-IT');
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 30) return 'expiring';
    return 'valid';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Atleti</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestisci gli atleti e le iscrizioni alle gare
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Esporta
          </Button>
          {isAdmin && (
            <Link href="/dashboard/members/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuovo Atleta
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Cerca per nome, cognome, codice fiscale o numero tessera..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtri
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <MemberFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

      {/* Members Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-sm text-gray-500">Caricamento...</p>
            </div>
          </div>
        ) : members.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">Nessun atleta trovato</p>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search || filters.societyId || filters.organization || filters.category || filters.status
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Inizia creando il primo atleta'}
              </p>
              {isAdmin && !filters.search && (
                <Link href="/dashboard/members/new">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Crea Primo Atleta
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Società
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Ente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Tessera
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {members.map((member) => {
                    const expiryStatus = getExpiryStatus(member.card_expiry_date);
                    
                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/dashboard/members/${member.id}`)}
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <div>
                              <div className="font-medium text-gray-900">
                                {member.first_name} {member.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.fiscal_code || '-'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {member.society?.name || '-'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {member.organization || '-'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {member.category || '-'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <div>
                            <div className="text-gray-900">{member.membership_card_number || '-'}</div>
                            {member.card_expiry_date && (
                              <div className={`text-xs ${
                                expiryStatus === 'expired' ? 'text-red-600' :
                                expiryStatus === 'expiring' ? 'text-orange-600' :
                                'text-gray-500'
                              }`}>
                                Scad: {formatDate(member.card_expiry_date)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <MemberStatusBadge status={member.membership_status} />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <Link
                            href={`/dashboard/members/${member.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Dettagli
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(page - 1) * pageSize + 1}</span> -{' '}
                  <span className="font-medium">{Math.min(page * pageSize, totalCount)}</span> di{' '}
                  <span className="font-medium">{totalCount}</span> risultati
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Precedente
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Successivo
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

