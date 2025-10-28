'use client';

import { useParams } from 'next/navigation';
import { RaceForm } from '@/components/races/RaceForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function NewRacePage() {
  const params = useParams();
  const championshipId = params.id as string;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Nuova Tappa
        </h1>
        <p className="text-muted-foreground mt-2">
          Crea una nuova tappa per il campionato
        </p>
      </div>

      <RaceForm championshipId={championshipId} mode="create" />
    </div>
  );
}

