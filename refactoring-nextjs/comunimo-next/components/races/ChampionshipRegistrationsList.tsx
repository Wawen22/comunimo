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
import { Search, Loader2, UserX, Users } from 'lucide-react';

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

  useEffect(() => {
    fetchRegistrations();
  }, [championshipId, societyId]);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);

      // Build query
      let query = supabase
        .from('championship_registrations')
        .select(`
          *,
          member:members(*),
          society:societies(*),
          championship:championships(*)
        `)
        .eq('championship_id', championshipId)
        .eq('status', 'confirmed');

      // Only filter by society if not "all"
      if (societyId !== 'all') {
        query = query.eq('society_id', societyId);
      }

      const { data, error } = await query.order('bib_number', { ascending: true });

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

  // Filter registrations by search query only
  const filteredRegistrations = registrations.filter((reg) => {
    const member = reg.member as any;
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      fullName.includes(query) ||
      reg.bib_number.includes(query) ||
      member.fiscal_code?.toLowerCase().includes(query);

    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="🔍 Cerca per nome, pettorale o codice fiscale..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 border-gray-300 focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Atleti Iscritti</CardTitle>
              <CardDescription className="mt-1">
                {filteredRegistrations.length} {filteredRegistrations.length === 1 ? 'atleta' : 'atleti'}
                {searchQuery && ' trovati'}
              </CardDescription>
            </div>
            {filteredRegistrations.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span className="font-medium">{filteredRegistrations.length}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="max-w-sm mx-auto">
                <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'Nessun risultato' : 'Nessun atleta iscritto'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {searchQuery
                    ? 'Prova a modificare la ricerca'
                    : 'Non ci sono ancora atleti iscritti a questo campionato'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Pettorale</TableHead>
                  <TableHead className="font-semibold text-gray-700">Atleta</TableHead>
                  <TableHead className="font-semibold text-gray-700">Data Nascita</TableHead>
                  <TableHead className="font-semibold text-gray-700">Organizzazione</TableHead>
                  <TableHead className="font-semibold text-gray-700">Categoria</TableHead>
                  <TableHead className="font-semibold text-gray-700">Tessera</TableHead>
                  <TableHead className="font-semibold text-gray-700">Società</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((reg) => {
                  const member = reg.member as any;
                  const society = reg.society as any;

                  return (
                    <TableRow key={reg.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm min-w-[50px] font-mono">
                          {reg.bib_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-gray-900">
                          {member.first_name} {member.last_name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 font-mono">
                          {member.fiscal_code || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {member.birth_date
                          ? new Date(member.birth_date).toLocaleDateString('it-IT')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            reg.organization === 'FIDAL'
                              ? 'border-green-500 text-green-700 bg-green-50'
                              : reg.organization === 'UISP'
                              ? 'border-purple-500 text-purple-700 bg-purple-50'
                              : 'border-gray-300 text-gray-700 bg-gray-50'
                          }
                          variant="outline"
                        >
                          {reg.organization || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700 font-medium">
                        {reg.category || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 font-mono">
                        {member.membership_number || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="font-medium text-gray-900">{society?.name || '-'}</div>
                        {society?.society_code && (
                          <div className="text-xs text-gray-500 font-mono mt-0.5">{society.society_code}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

