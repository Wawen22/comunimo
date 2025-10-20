import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold mb-4 text-brand-blue-dark">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Pagina non trovata</h2>
        <p className="text-muted-foreground mb-6">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark transition-colors"
        >
          Torna alla home
        </Link>
      </div>
    </div>
  );
}

