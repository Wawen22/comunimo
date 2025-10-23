'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api/supabase';
import { EventRegistrationWithDetails } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/toast';
import { Search, Loader2, UserX, Users, Hash, Download } from 'lucide-react';

interface EventRegistrationsListProps {
  eventId: string;
  societyId: string;
  onUpdate?: () => void;
}

export default function EventRegistrationsList({
  eventId,
  societyId,
  onUpdate,
}: EventRegistrationsListProps) {
  const { toast } = useToast();

  const [registrations, setRegistrations] = useState<EventRegistrationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOrg, setFilterOrg] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [registrationToCancel, setRegistrationToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [eventId, societyId]);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('event_registrations')
        .select(`
          *,
          member:members(*),
          society:societies(*),
          event:events(*)
        `)
        .eq('event_id', eventId);

      // Filter by society if provided
      if (societyId) {
        query = query.eq('society_id', societyId);
      }

      const { data, error } = await query.order('bib_number') as {
        data: EventRegistrationWithDetails[] | null;
        error: any
      };

      if (error) {
        console.error('Error fetching registrations:', error);
        toast({
          title: 'Errore',
          description: 'Impossibile caricare le iscrizioni',
          variant: 'destructive',
        });
        return;
      }

      setRegistrations(data || []);
    } catch (error) {
      console.error('Error in fetchRegistrations:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    try {
      setIsCancelling(true);

      const { error } = await (supabase
        .from('event_registrations') as any)
        .update({ status: 'cancelled' })
        .eq('id', registrationId);

      if (error) {
        console.error('Error cancelling registration:', error);
        toast({
          title: 'Errore',
          description: 'Impossibile annullare l\'iscrizione',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Successo',
        description: 'Iscrizione annullata',
      });

      // Refresh list
      fetchRegistrations();
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error in handleCancelRegistration:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
      setRegistrationToCancel(null);
    }
  };

  const handleExportCSV = () => {
    // Prepare CSV data
    const headers = [
      'Pettorale',
      'Cognome',
      'Nome',
      'Società',
      'Organizzazione',
      'Categoria',
      'Stato',
    ];

    const rows = filteredRegistrations.map((reg) => [
      reg.bib_number || '',
      reg.member.last_name,
      reg.member.first_name,
      reg.society?.name || '',
      reg.organization || '',
      reg.category || '',
      reg.status,
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Add UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Download file
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `iscrizioni_gara_${eventId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Successo',
      description: 'Export CSV completato',
    });
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      reg.member.first_name.toLowerCase().includes(searchLower) ||
      reg.member.last_name.toLowerCase().includes(searchLower) ||
      reg.bib_number?.toLowerCase().includes(searchLower);

    // Organization filter
    const matchesOrg = filterOrg === 'all' || reg.organization === filterOrg;

    // Status filter
    const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;

    return matchesSearch && matchesOrg && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default">Confermata</Badge>;
      case 'pending':
        return <Badge variant="secondary">In Attesa</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annullata</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Totale Iscritti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">
                {registrations.filter((r) => r.status !== 'cancelled').length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              FIDAL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {registrations.filter((r) => r.organization === 'FIDAL' && r.status !== 'cancelled').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              UISP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {registrations.filter((r) => r.organization === 'UISP' && r.status !== 'cancelled').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Iscrizioni</CardTitle>
          <CardDescription>
            Lista degli atleti iscritti alla gara
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cerca per nome o pettorale..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterOrg}
                onChange={(e) => setFilterOrg(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Tutte le organizzazioni</option>
                <option value="FIDAL">FIDAL</option>
                <option value="UISP">UISP</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Tutti gli stati</option>
                <option value="confirmed">Confermata</option>
                <option value="pending">In Attesa</option>
                <option value="cancelled">Annullata</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={filteredRegistrations.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Esporta CSV
              </Button>
            </div>
          </div>

          {/* Table */}
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nessuna iscrizione trovata</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Pettorale</TableHead>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Data Nascita</TableHead>
                    <TableHead>Org.</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tessera</TableHead>
                    <TableHead>Società</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-mono font-semibold">
                        {registration.bib_number || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {registration.member.first_name} {registration.member.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {registration.member.fiscal_code || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {registration.member.birth_date
                          ? new Date(registration.member.birth_date).toLocaleDateString('it-IT')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{registration.organization || '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {registration.category || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {registration.member.membership_number || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {registration.society?.name || '-'}
                        {registration.society?.society_code && (
                          <span className="text-gray-400"> ({registration.society.society_code})</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(registration.status)}</TableCell>
                      <TableCell className="text-right">
                        {registration.status !== 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRegistrationToCancel(registration.id)}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Annulla
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        open={!!registrationToCancel}
        onOpenChange={(open) => !open && setRegistrationToCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Annullamento</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler annullare questa iscrizione? L'azione può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => registrationToCancel && handleCancelRegistration(registrationToCancel)}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Annullamento...
                </>
              ) : (
                'Conferma'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

