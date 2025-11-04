'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { RequireRole } from '@/components/auth/RequireRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuditLogs, useAuditLogResourceTypes, type AuditLogFilters } from '@/lib/react-query/auditLogs';
import { useToast } from '@/components/ui/toast';
import type { AuditLogEnriched, UserRole } from '@/types/database';
import { RefreshCcw, Search, Filter } from 'lucide-react';

const PAGE_SIZE = 20;
const ALL_VALUE = 'all';
const ACTOR_ROLE_OPTIONS: UserRole[] = ['society_admin', 'admin', 'super_admin'];

export default function AuditLogPage() {
  return (
    <RequireRole role="super_admin" fallback={<UnauthorizedMessage />}>
      <AuditLogPageContent />
    </RequireRole>
  );
}

function UnauthorizedMessage() {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
      Non hai i permessi per visualizzare il registro delle attività.
    </div>
  );
}

function AuditLogPageContent() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogEnriched | null>(null);

  const logsQuery = useAuditLogs({ page, pageSize: PAGE_SIZE, filters });
  const resourceTypesQuery = useAuditLogResourceTypes();

  const totalPages = useMemo(() => {
    if (!logsQuery.data?.count) return 1;
    return Math.max(1, Math.ceil(logsQuery.data.count / PAGE_SIZE));
  }, [logsQuery.data?.count]);

  useEffect(() => {
    if (logsQuery.error) {
      toast({
        title: 'Errore',
        description: logsQuery.error.message || 'Impossibile caricare i log',
        variant: 'destructive',
      });
    }
  }, [logsQuery.error, toast]);

  const handleFilterChange = (partial: Partial<AuditLogFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Registro Attività</h1>
        <p className="text-sm text-gray-600">
          Monitora le azioni amministrative eseguite sulla piattaforma. I log sono disponibili solo ai Super Amministratori.
        </p>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Filtri</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={logsQuery.isFetching}
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => logsQuery.refetch()}
              disabled={logsQuery.isFetching}
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${logsQuery.isFetching ? 'animate-spin' : ''}`} />
              Aggiorna
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Dal</label>
            <Input
              type="date"
              value={filters.startDate ?? ''}
              onChange={(event) => handleFilterChange({ startDate: event.target.value || undefined })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Al</label>
            <Input
              type="date"
              value={filters.endDate ?? ''}
              onChange={(event) => handleFilterChange({ endDate: event.target.value || undefined })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Tipo Risorsa</label>
            <Select
              value={filters.resourceType ?? ALL_VALUE}
              onValueChange={(value) =>
                handleFilterChange({ resourceType: value === ALL_VALUE ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tutte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Tutte</SelectItem>
                {(resourceTypesQuery.data ?? []).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Ruolo attore</label>
            <Select
              value={filters.actorRole ?? ALL_VALUE}
              onValueChange={(value) =>
                handleFilterChange({ actorRole: value === ALL_VALUE ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tutti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Tutti</SelectItem>
                {ACTOR_ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2 lg:col-span-4">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Ricerca</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Cerca per azione, risorsa o etichetta"
                value={filters.actionSearch ?? ''}
                onChange={(event) => handleFilterChange({ actionSearch: event.target.value || undefined })}
              />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2 lg:col-span-4">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Email attore</label>
            <Input
              placeholder="es. admin@comunimo.it"
              value={filters.actorEmail ?? ''}
              onChange={(event) => handleFilterChange({ actorEmail: event.target.value || undefined })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Log recenti</CardTitle>
            <p className="text-sm text-gray-500">Totale risultati: {logsQuery.data?.count ?? 0}</p>
          </div>
          {logsQuery.isFetching && (
            <Badge className="flex items-center gap-2 bg-blue-50 text-blue-700">
              <Filter className="h-3.5 w-3.5" /> Aggiornamento in corso...
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {logsQuery.isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="h-16 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : (logsQuery.data?.logs.length ?? 0) === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Nessun log corrisponde ai filtri selezionati.
            </div>
          ) : (
            <div className="space-y-3">
              {logsQuery.data?.logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/40"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700">{log.resource_type}</Badge>
                        <span className="text-sm font-semibold text-gray-900">{log.action}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {log.resource_label ?? '—'}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span>
                          Attore: <span className="font-medium text-gray-700">{log.actor_email ?? 'N/A'}</span>
                        </span>
                        {log.actor_role && (
                          <span>
                            Ruolo: <span className="font-medium text-gray-700">{log.actor_role}</span>
                          </span>
                        )}
                        {log.actor_name && (
                          <span>
                            Nome: <span className="font-medium text-gray-700">{log.actor_name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs font-medium text-gray-500">
                        {format(new Date(log.created_at), 'PPpp', { locale: it })}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => setSelectedLog(log)}>
                        Dettagli
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(logsQuery.data?.logs.length ?? 0) > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-4 text-sm text-gray-600 md:flex-row">
              <span>
                Pagina {page} di {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  Indietro
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Avanti
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedLog)} onOpenChange={(open) => setSelectedLog(open ? selectedLog : null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Dettagli Log</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 md:grid-cols-2">
                <InfoItem label="Azione" value={selectedLog.action} />
                <InfoItem label="Risorsa" value={selectedLog.resource_type} />
                <InfoItem label="Etichetta" value={selectedLog.resource_label ?? '—'} />
                <InfoItem label="Attore" value={selectedLog.actor_email ?? '—'} />
                <InfoItem label="Ruolo" value={selectedLog.actor_role ?? '—'} />
                <InfoItem
                  label="Data"
                  value={format(new Date(selectedLog.created_at), 'PPpp', { locale: it })}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Payload</p>
                <pre className="max-h-64 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
                  {selectedLog.payload ? JSON.stringify(selectedLog.payload, null, 2) : '—'}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}
