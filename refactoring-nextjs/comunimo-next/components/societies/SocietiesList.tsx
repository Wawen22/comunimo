'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/api/supabase';
import { Society } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { useIsAdmin } from '@/components/auth/RequireRole';
import { DeleteSocietyDialog } from './DeleteSocietyDialog';

export function SocietiesList() {
  const router = useRouter();
  const { toast } = useToast();
  const isAdmin = useIsAdmin();

  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [societyToDelete, setSocietyToDelete] = useState<Society | null>(null);

  // Fetch societies
  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async () => {
    try {
      setLoading(true);

      // Fetch all societies (RLS will filter based on user role)
      // Admins can see all, regular users only see active ones
      const { data, error } = await supabase
        .from('societies')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      setSocieties(data || []);
    } catch (error: any) {
      console.error('Error fetching societies:', error);
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile caricare le società',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter societies by search query
  const filteredSocieties = societies.filter((society) => {
    const query = searchQuery.toLowerCase();
    return (
      society.name.toLowerCase().includes(query) ||
      society.society_code?.toLowerCase().includes(query) ||
      society.city?.toLowerCase().includes(query) ||
      society.email?.toLowerCase().includes(query) ||
      society.organization?.toLowerCase().includes(query)
    );
  });

  // Helper function to get organization badge color
  const getOrganizationColor = (org: string | null) => {
    switch (org) {
      case 'FIDAL':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'UISP':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CSI':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RUNCARD':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDelete = (society: Society) => {
    setSocietyToDelete(society);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!societyToDelete) return;

    try {
      const { error } = await supabase
        .from('societies')
        // @ts-expect-error - Supabase type inference issue
        .update({ is_active: false })
        .eq('id', societyToDelete.id);

      if (error) throw error;

      toast({
        title: 'Successo',
        description: 'Società eliminata con successo',
        variant: 'success',
      });

      // Refresh list
      fetchSocieties();
    } catch (error) {
      console.error('Error deleting society:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare la società',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSocietyToDelete(null);
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

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Cerca società..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isAdmin && (
          <Button onClick={() => router.push('/dashboard/societies/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nuova Società
          </Button>
        )}
      </div>

      {/* Table */}
      {filteredSocieties.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">
            {searchQuery
              ? 'Nessuna società trovata con i criteri di ricerca'
              : 'Nessuna società presente'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Codice</TableHead>
                <TableHead>Ente</TableHead>
                <TableHead>Città</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSocieties.map((society) => (
                <TableRow key={society.id}>
                  <TableCell className="font-medium">{society.name}</TableCell>
                  <TableCell>
                    {society.society_code ? (
                      <Badge variant="outline">{society.society_code}</Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {society.organization ? (
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getOrganizationColor(society.organization)}`}>
                        {society.organization}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{society.city || '-'}</TableCell>
                  <TableCell>{society.email || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={society.is_active ? 'success' : 'secondary'}>
                      {society.is_active ? 'Attiva' : 'Inattiva'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/societies/${society.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/dashboard/societies/${society.id}/edit`)
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(society)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteSocietyDialog
        open={deleteDialogOpen}
        society={societyToDelete}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

