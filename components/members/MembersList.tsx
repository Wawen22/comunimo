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
import { Plus, Search, Download, Filter, FileSpreadsheet, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { MemberStatusBadge } from './MemberStatusBadge';
import { MemberFilters } from './MemberFilters';
import { ExpiryAlert } from './ExpiryAlert';
import { exportMembersToCSV } from '@/lib/utils/csvExport';
import { BulkImportExcelDialog } from './BulkImportExcelDialog';
import { SocietyMultiSelect } from './SocietyMultiSelect';
import { MemberCard } from './MemberCard';
import { Card, CardContent } from '@/components/ui/card';
import { MemberDetailModal } from './MemberDetailModal';

interface MemberWithSociety extends Member {
  society?: {
    id: string;
    name: string;
    society_code: string | null;
  } | null;
}

interface MemberFiltersState {
  search: string;
  societyIds: string[]; // Changed from societyId to societyIds (array)
  category: string;
  status: string;
  showExpiring: boolean;
}

export function MembersList() {
  const router = useRouter();
  const { toast } = useToast();
  const isAdmin = useIsAdmin();

  const [members, setMembers] = useState<MemberWithSociety[]>([]);
  const [societies, setSocieties] = useState<{ id: string; name: string; society_code: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showImportExcelDialog, setShowImportExcelDialog] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [filters, setFilters] = useState<MemberFiltersState>({
    search: '',
    societyIds: [],
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
    fetchSocieties();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [filters, page]);

  const fetchSocieties = async () => {
    try {
      const { data, error } = await supabase
        .from('societies')
        .select('id, name, society_code')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setSocieties(data || []);
    } catch (error: any) {
      console.error('Error fetching societies:', error);
    }
  };

  const buildSearchFilter = (searchTerm: string) => {
    if (!searchTerm.trim()) return null;

    const trimmedSearch = searchTerm.trim();

    // Split search term into words (for multi-word searches like "Mario Rossi" or "Rossi Mario")
    const words = trimmedSearch.split(/\s+/).filter(w => w.length > 0);

    if (words.length === 0) return null;

    if (words.length === 1) {
      // Single word: search in first_name, last_name, fiscal_code, membership_number
      const word = words[0];
      return `first_name.ilike.%${word}%,last_name.ilike.%${word}%,fiscal_code.ilike.%${word}%,membership_number.ilike.%${word}%`;
    } else {
      // Multiple words: search for each word in both first_name AND last_name
      // This allows "Mario Rossi" to match both "Mario Rossi" and "Rossi Mario"
      const conditions: string[] = [];

      // For each word, it should match either first_name OR last_name
      words.forEach(word => {
        conditions.push(`first_name.ilike.%${word}%`);
        conditions.push(`last_name.ilike.%${word}%`);
      });

      // Also search the full term in fiscal_code and membership_number
      conditions.push(`fiscal_code.ilike.%${trimmedSearch}%`);
      conditions.push(`membership_number.ilike.%${trimmedSearch}%`);

      return conditions.join(',');
    }
  };

  const fetchMembers = async () => {
    try {
      setIsLoading(true);

      // Build query
      let query = supabase
        .from('members')
        .select(`
          *,
          society:societies(id, name, society_code)
        `, { count: 'exact' })
        .eq('is_active', true)
        .order('last_name', { ascending: true })
        .range((page - 1) * pageSize, page * pageSize - 1);

      // Apply filters
      if (filters.search) {
        const searchFilter = buildSearchFilter(filters.search);
        if (searchFilter) {
          query = query.or(searchFilter);
        }
      }

      if (filters.societyIds.length > 0) {
        query = query.in('society_id', filters.societyIds);
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
        query = query.lte('medical_certificate_expiry', thirtyDaysFromNow.toISOString());
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

  const handleExport = async () => {
    try {
      // Fetch ALL members with current filters (no pagination) for export
      let query = supabase
        .from('members')
        .select(`
          *,
          society:societies(id, name, society_code)
        `)
        .eq('is_active', true)
        .order('last_name', { ascending: true });

      // Apply same filters as the list
      if (filters.search) {
        const searchFilter = buildSearchFilter(filters.search);
        if (searchFilter) {
          query = query.or(searchFilter);
        }
      }

      if (filters.societyIds.length > 0) {
        query = query.in('society_id', filters.societyIds);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.status) {
        query = query.eq('membership_status', filters.status);
      }

      const { data: membersToExport, error } = await query;

      if (error) throw error;

      if (!membersToExport || membersToExport.length === 0) {
        toast({
          title: 'Attenzione',
          description: 'Nessun atleta da esportare',
          variant: 'default',
        });
        return;
      }

      exportMembersToCSV(membersToExport);

      toast({
        title: 'Successo',
        description: `${membersToExport.length} atleti esportati in CSV`,
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Error exporting members:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile esportare gli atleti',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Atleti</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestisci gli atleti e le iscrizioni alle gare
          </p>
        </div>

        {/* Action Buttons - Responsive Layout */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap md:flex-nowrap">
          <Button
            variant="outline"
            onClick={handleExport}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Esporta
          </Button>
          {isAdmin && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowImportExcelDialog(true)}
                className="w-full sm:w-auto"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Importa Excel
              </Button>
              <Link href="/dashboard/members/new" className="w-full sm:w-auto">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuovo Atleta
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Society Filter - Always Visible */}
        <div className="w-full md:w-80">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Società
          </label>
          <SocietyMultiSelect
            selectedIds={filters.societyIds}
            onSelectionChange={(ids) => setFilters({ ...filters, societyIds: ids })}
            societies={societies}
          />
        </div>

        {/* Search Bar */}
        <div className="relative flex-1">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Ricerca
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Cerca per nome, cognome, codice fiscale o numero tessera..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Advanced Filters Button */}
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Altri Filtri
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <MemberFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

      {/* Members List */}
      {isLoading ? (
        <Card className="border-2 shadow-sm">
          <CardContent className="p-0">
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <p className="text-sm text-gray-500">Caricamento...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : members.length === 0 ? (
        <Card className="border-2 shadow-sm">
          <CardContent className="p-0">
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">Nessun atleta trovato</p>
                <p className="mt-1 text-sm text-gray-500">
                  {filters.search || filters.societyIds.length > 0 || filters.category || filters.status
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
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Members Cards */}
          <Card className="border-2 shadow-md">
            <CardContent className="p-0">
              <div className="space-y-2 p-4">
                {members.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    onClick={() => {
                      setSelectedMemberId(member.id);
                      setShowMemberModal(true);
                    }}
                    compact={true}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="border-2 shadow-sm">
              <CardContent className="p-0">
                <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="text-sm text-gray-700 text-center sm:text-left">
                    Mostrando <span className="font-medium">{(page - 1) * pageSize + 1}</span> -{' '}
                    <span className="font-medium">{Math.min(page * pageSize, totalCount)}</span> di{' '}
                    <span className="font-medium">{totalCount}</span> risultati
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {/* Prima pagina */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      title="Prima pagina"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>

                    {/* Precedente */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      title="Pagina precedente"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Numeri pagina */}
                    <div className="flex flex-wrap items-center justify-center gap-1">
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

                    {/* Successivo */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      title="Pagina successiva"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    {/* Ultima pagina */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      title="Ultima pagina"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Bulk Import Excel Dialog (FIDAL/UISP) */}
      <BulkImportExcelDialog
        isOpen={showImportExcelDialog}
        onClose={() => setShowImportExcelDialog(false)}
        onSuccess={() => {
          setShowImportExcelDialog(false);
          fetchMembers();
        }}
      />

      {/* Member Detail Modal */}
      <MemberDetailModal
        memberId={selectedMemberId}
        open={showMemberModal}
        onOpenChange={(open) => {
          setShowMemberModal(open);
          if (!open) {
            setSelectedMemberId(null);
          }
        }}
      />
    </div>
  );
}
