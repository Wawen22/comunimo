import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | ComUniMo',
  description: 'Dashboard ComUniMo',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Benvenuto nel tuo pannello di controllo
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Società</h3>
          <p className="mt-2 text-3xl font-bold text-brand">0</p>
          <p className="mt-1 text-sm text-gray-600">Società registrate</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Soci</h3>
          <p className="mt-2 text-3xl font-bold text-brand">0</p>
          <p className="mt-1 text-sm text-gray-600">Soci attivi</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Eventi</h3>
          <p className="mt-2 text-3xl font-bold text-brand">0</p>
          <p className="mt-1 text-sm text-gray-600">Eventi programmati</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Attività Recenti
        </h2>
        <p className="mt-4 text-gray-600">Nessuna attività recente</p>
      </div>
    </div>
  );
}

