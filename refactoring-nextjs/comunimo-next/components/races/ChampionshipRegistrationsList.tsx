'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api/supabase';
import { ChampionshipRegistrationWithDetails } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/toast';
import { Search, Loader2, UserX, Users, Hash } from 'lucide-react';

interface ChampionshipRegistrationsListProps {
  championshipId: string;
  societyId: string;
  onUpdate?: () => void;
}

export default function ChampionshipRegistrationsList({
  championshipId,
  societyId,
  onUpdate,
}: ChampionshipRegistrationsListProps) {
  const { toast } = useToast();

  const [registrations, setRegistrations] = useState<ChampionshipRegistrationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOrg, setFilterOrg] = useState<string>('all');

  useEffect(() => {
    fetchRegistrations();
  }, [championshipId, societyId]);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('championship_registrations')
        .select(`
          *,
          member:members(*),
          society:societies(*),
          championship:championships(*)
        `)
        .eq('championship_id', championshipId)
        .eq('society_id', societyId)
        .eq('status', 'confirmed')
        .order('bib_number', { ascending: true });

      if (error) throw error;

      setRegistrations(data as any || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le iscrizioni. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    try {
      // Update championship registration status
      const { error: champError } = await supabase
        .from('championship_registrations')
        // @ts-expect-error - Supabase type inference issue
        .update({ status: 'cancelled' })
        .eq('id', registrationId);

      if (champError) throw champError;

      // Also cancel all event registrations for this member in this championship
      const registration = registrations.find((r) => r.id === registrationId);
      if (registration) {
        // Get event IDs for this championship
        const eventsResult = await supabase
          .from('events')
          .select('id')
          .eq('championship_id', championshipId) as { data: any[] | null; error: any };

        const eventIds = eventsResult.data?.map((e) => e.id) || [];

        const { error: eventError } = await supabase
          .from('event_registrations')
          // @ts-expect-error - Supabase type inference issue
          .update({ status: 'cancelled' })
          .eq('member_id', registration.member_id)
          .in('event_id', eventIds);

        if (eventError) throw eventError;
      }

      toast({
        title: 'Iscrizione cancellata',
        description: 'L\'iscrizione è stata cancellata con successo.',
      });

      await fetchRegistrations();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile cancellare l\'iscrizione. Riprova.',
        variant: 'destructive',
      });
    }
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const member = reg.member as any;
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      fullName.includes(query) ||
      reg.bib_number.includes(query) ||
      member.fiscal_code?.toLowerCase().includes(query);

    const matchesOrg =
      filterOrg === 'all' || reg.organization === filterOrg;

    return matchesSearch && matchesOrg;
  });

  // Group by organization
  const orgCounts = registrations.reduce((acc, reg) => {
    const org = reg.organization || 'Altro';
    acc[org] = (acc[org] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
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
              <span className="text-2xl font-bold">{registrations.length}</span>
            </div>
          </CardContent>
        </Card>

        {Object.entries(orgCounts).map(([org, count]) => (
          <Card key={org}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                {org}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{count}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cerca per nome, pettorale o codice fiscale..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterOrg === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterOrg('all')}
          >
            Tutti
          </Button>
          <Button
            variant={filterOrg === 'FIDAL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterOrg('FIDAL')}
          >
            FIDAL
          </Button>
          <Button
            variant={filterOrg === 'UISP' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterOrg('UISP')}
          >
            UISP
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Atleti Iscritti</CardTitle>
          <CardDescription>
            {filteredRegistrations.length} atleti
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery || filterOrg !== 'all'
                  ? 'Nessun atleta trovato con questi filtri'
                  : 'Nessun atleta iscritto'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pettorale</TableHead>
                  <TableHead>Atleta</TableHead>
                  <TableHead>Data Nascita</TableHead>
                  <TableHead>Organizzazione</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tessera</TableHead>
                  <TableHead>Società</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((reg) => {
                  const member = reg.member as any;
                  const society = reg.society as any;

                  return (
                    <TableRow key={reg.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {reg.bib_number}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.fiscal_code || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {member.birth_date
                          ? new Date(member.birth_date).toLocaleDateString('it-IT')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            reg.organization === 'FIDAL'
                              ? 'default'
                              : reg.organization === 'UISP'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {reg.organization || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {reg.category || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {member.membership_number || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {society?.name || '-'}
                        {society?.society_code && (
                          <span className="text-gray-400"> ({society.society_code})</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <UserX className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Cancellare iscrizione?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Questa azione cancellerà l&apos;iscrizione di{' '}
                                <strong>
                                  {member.first_name} {member.last_name}
                                </strong>{' '}
                                da tutte le tappe del campionato.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelRegistration(reg.id)}
                              >
                                Cancella Iscrizione
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

