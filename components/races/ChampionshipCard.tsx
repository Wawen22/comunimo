'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Championship } from '@/types/database';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, Flag, Edit, Trash2, Eye } from 'lucide-react';
import { useIsAdmin } from '@/lib/hooks/useUser';
import { DeleteChampionshipDialog } from './DeleteChampionshipDialog';

interface ChampionshipCardProps {
  championship: Championship & { race_count: number };
  onUpdate: () => void;
}

export function ChampionshipCard({ championship, onUpdate }: ChampionshipCardProps) {
  const isAdmin = useIsAdmin();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
        return 'bg-green-100 text-green-800';
      case 'road':
        return 'bg-blue-100 text-blue-800';
      case 'track':
        return 'bg-purple-100 text-purple-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <>
      <Card className="group relative overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-yellow-500 hover:shadow-2xl transition-all duration-300 cursor-pointer">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <Link href={`/dashboard/races/championships/${championship.id}/registrations`}>
          <CardHeader className="relative">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 text-white shadow-lg">
                    <Trophy className="h-4 w-4" />
                    <span className="text-sm font-bold">{championship.year}</span>
                  </div>
                  <Badge className={`${getTypeColor(championship.championship_type)} border-0 shadow-sm`}>
                    {getTypeLabel(championship.championship_type)}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-yellow-600 transition-colors line-clamp-2">
                  {championship.name}
                </CardTitle>
                {championship.season && (
                  <CardDescription className="mt-2 font-medium">
                    Stagione {championship.season}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
        </Link>

        <CardContent className="relative space-y-4">
          {championship.description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {championship.description}
            </p>
          )}

          <div className="space-y-2">
            {championship.start_date && championship.end_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                <Calendar className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <span className="font-medium">
                  {formatDate(championship.start_date)} - {formatDate(championship.end_date)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-2">
              <Flag className="h-4 w-4 text-yellow-600 flex-shrink-0" />
              <span className="text-sm font-bold text-gray-900">
                {championship.race_count} {championship.race_count === 1 ? 'Tappa' : 'Tappe'}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="relative flex gap-2 pt-4 border-t border-gray-200">
          <Link href={`/dashboard/races/championships/${championship.id}/registrations`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white group-hover:bg-yellow-500 group-hover:text-white transition-all"
            >
              <Eye className="h-4 w-4 mr-2" />
              Gestisci Iscrizioni
            </Button>
          </Link>

          {isAdmin && (
            <>
              <Link href={`/dashboard/races/championships/${championship.id}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-brand-blue hover:text-white hover:border-brand-blue"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  setShowDeleteDialog(true);
                }}
                className="hover:bg-red-50 hover:border-red-500"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {showDeleteDialog && (
        <DeleteChampionshipDialog
          championship={championship}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onSuccess={onUpdate}
        />
      )}
    </>
  );
}

