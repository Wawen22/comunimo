'use client';

import { Championship } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Flag, FileText } from 'lucide-react';

interface ChampionshipInfoModalProps {
  championship: Championship & { race_count: number };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChampionshipInfoModal({ championship, open, onOpenChange }: ChampionshipInfoModalProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'cross_country':
        return 'Corsa Campestre';
      case 'road':
        return 'Strada';
      case 'track':
        return 'Pista';
      case 'other':
        return 'Altro';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cross_country':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'road':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'track':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'other':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Non specificata';
    return new Date(date).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-2xl">Informazioni Campionato</DialogTitle>
          </div>
          <DialogDescription>
            Dettagli completi del campionato selezionato
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Nome e Anno */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">{championship.name}</h3>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1.5 text-white shadow-md">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-bold">{championship.year}</span>
              </div>
              <Badge className={`${getTypeColor(championship.championship_type)} border shadow-sm`}>
                {getTypeLabel(championship.championship_type)}
              </Badge>
              {championship.season && (
                <Badge variant="outline" className="border-gray-300">
                  Stagione {championship.season}
                </Badge>
              )}
            </div>
          </div>

          {/* Descrizione */}
          {championship.description && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Descrizione</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">{championship.description}</p>
            </div>
          )}

          {/* Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Data Inizio</h4>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatDate(championship.start_date)}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <h4 className="text-sm font-semibold text-orange-700 uppercase tracking-wide">Data Fine</h4>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatDate(championship.end_date)}</p>
            </div>
          </div>

          {/* Numero Tappe */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Flag className="h-4 w-4 text-orange-600" />
              <h4 className="text-sm font-semibold text-orange-700 uppercase tracking-wide">Tappe del Campionato</h4>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">
              {championship.race_count} {championship.race_count === 1 ? 'Tappa' : 'Tappe'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

