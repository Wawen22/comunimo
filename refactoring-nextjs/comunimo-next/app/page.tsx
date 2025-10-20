export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 text-brand-blue-dark">
          ComUniMo - Comitato Unitario Modena
        </h1>
        <p className="text-center text-lg text-muted-foreground">
          Sistema di gestione modernizzato con Next.js 14 + Supabase
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-2 text-brand-blue">
              Next.js 14
            </h2>
            <p className="text-sm text-muted-foreground">
              App Router con Server Components
            </p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-2 text-brand-blue">
              TypeScript
            </h2>
            <p className="text-sm text-muted-foreground">
              Type safety completa
            </p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-2 text-brand-blue">
              Tailwind CSS
            </h2>
            <p className="text-sm text-muted-foreground">
              Design system moderno
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

