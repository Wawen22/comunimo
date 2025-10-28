'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-brand-red">
          Si è verificato un errore
        </h2>
        <p className="text-muted-foreground mb-6">
          {error.message || 'Qualcosa è andato storto. Riprova più tardi.'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark transition-colors"
        >
          Riprova
        </button>
      </div>
    </div>
  );
}

