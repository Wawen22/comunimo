'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Pencil, Trash2, Building2, MapPin, Mail, Phone, Globe } from 'lucide-react';
import { Society } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { useIsAdmin } from '@/components/auth/RequireRole';
import { DeleteSocietyDialog } from './DeleteSocietyDialog';
import { SocietyDetailModal } from './SocietyDetailModal';
import { useActiveSocieties, useDeactivateSociety } from '@/lib/react-query/societies';

export function SocietiesList() {
  const router = useRouter();
  const { toast } = useToast();
  const isAdmin = useIsAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [societyToDelete, setSocietyToDelete] = useState<Society | null>(null);
  const [selectedSocietyId, setSelectedSocietyId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const {
    data: societies = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useActiveSocieties();
  const deactivateSociety = useDeactivateSociety();

  useEffect(() => {
    if (isError && error) {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile caricare le società',
        variant: 'destructive',
      });
    }
  }, [isError, error, toast]);

  // Filter societies by search query
  const filteredSocieties = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return societies.filter((society) =>
      society.name.toLowerCase().includes(query) ||
      society.society_code?.toLowerCase().includes(query) ||
      society.city?.toLowerCase().includes(query) ||
      society.email?.toLowerCase().includes(query) ||
      society.organization?.toLowerCase().includes(query),
    );
  }, [societies, searchQuery]);

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
      await deactivateSociety.mutateAsync(societyToDelete.id);

      toast({
        title: 'Successo',
        description: 'Società eliminata con successo',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error deleting society:', error);
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : 'Impossibile eliminare la società',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSocietyToDelete(null);
    }
  };

  if (isLoading) {
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
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Cerca società..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-brand-blue focus:ring-brand-blue/20"
          />
        </div>

        {isAdmin && (
          <Button
            onClick={() => router.push('/dashboard/societies/new')}
            className="bg-gradient-to-r from-brand-blue to-brand-blue-dark hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuova Società
          </Button>
        )}
      </div>

      {/* Stats Badge */}
      <div className="flex items-center gap-2">
        <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 px-4 py-2 text-sm font-semibold">
          <Building2 className="mr-2 h-4 w-4" />
          {filteredSocieties.length} {filteredSocieties.length === 1 ? 'Società' : 'Società'}
        </Badge>
      </div>

      {/* Cards Grid */}
      {filteredSocieties.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Building2 className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'Nessuna società trovata' : 'Nessuna società presente'}
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              {searchQuery
                ? 'Prova a modificare i criteri di ricerca'
                : 'Inizia creando la prima società sportiva'}
            </p>
            {!searchQuery && isAdmin && (
              <Button
                onClick={() => router.push('/dashboard/societies/new')}
                className="mt-6 bg-gradient-to-r from-brand-blue to-brand-blue-dark"
              >
                <Plus className="mr-2 h-4 w-4" />
                Crea Prima Società
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSocieties.map((society, index) => (
            <Card
              key={society.id}
              className="group relative overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-brand-blue hover:shadow-xl transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => {
                setSelectedSocietyId(society.id);
                setShowDetailModal(true);
              }}
            >
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <CardContent className="relative p-6 space-y-4">
                {/* Header with Logo/Icon and Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {society.logo_url ? (
                      <img
                        src={society.logo_url}
                        alt={society.name}
                        className="h-12 w-12 rounded-lg object-cover ring-2 ring-gray-200 group-hover:ring-brand-blue transition-all"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white ring-2 ring-gray-200 group-hover:ring-brand-blue transition-all">
                        <Building2 className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate group-hover:text-brand-blue transition-colors">
                        {society.name}
                      </h3>
                      {society.society_code && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {society.society_code}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/societies/${society.id}/edit`);
                          }}
                          className="h-8 w-8 p-0 hover:bg-brand-blue/10 hover:text-brand-blue"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(society);
                          }}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Organization Badge */}
                {society.organization && (
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getOrganizationColor(society.organization)}`}>
                      {society.organization}
                    </span>
                    <StatusBadge
                      variant={society.is_active ? 'success' : 'inactive'}
                      label={society.is_active ? 'Attiva' : 'Inattiva'}
                      size="sm"
                      showIcon={false}
                    />
                  </div>
                )}

                {/* Info Grid */}
                <div className="space-y-2 text-sm">
                  {society.city && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{society.city}</span>
                    </div>
                  )}
                  {society.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{society.email}</span>
                    </div>
                  )}
                  {society.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{society.phone}</span>
                    </div>
                  )}
                  {society.website && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{society.website}</span>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <div className="pt-2 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center text-brand-blue hover:bg-brand-blue/10 group-hover:bg-brand-blue group-hover:text-white transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSocietyId(society.id);
                      setShowDetailModal(true);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizza Dettagli
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteSocietyDialog
        open={deleteDialogOpen}
        society={societyToDelete}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />

      {/* Detail Modal */}
      <SocietyDetailModal
        societyId={selectedSocietyId}
        open={showDetailModal}
        onOpenChange={(open) => {
          setShowDetailModal(open);
          if (!open) {
            setSelectedSocietyId(null);
            void refetch();
          }
        }}
      />
    </div>
  );
}
