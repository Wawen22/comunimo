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
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <Link href={`/dashboard/races/championships/${championship.id}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <Badge variant="outline">{championship.year}</Badge>
                  <Badge className={getTypeColor(championship.championship_type)}>
                    {getTypeLabel(championship.championship_type)}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{championship.name}</CardTitle>
                {championship.season && (
                  <CardDescription className="mt-1">
                    Stagione {championship.season}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
        </Link>

        <CardContent>
          <div className="space-y-3">
            {championship.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {championship.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {championship.start_date && championship.end_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(championship.start_date)} - {formatDate(championship.end_date)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {championship.race_count} {championship.race_count === 1 ? 'gara' : 'gare'}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Link href={`/dashboard/races/championships/${championship.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              Visualizza
            </Button>
          </Link>
          
          {isAdmin && (
            <>
              <Link href={`/dashboard/races/championships/${championship.id}/edit`}>
                <Button variant="outline" size="sm">
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
              >
                <Trash2 className="h-4 w-4 text-destructive" />
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

