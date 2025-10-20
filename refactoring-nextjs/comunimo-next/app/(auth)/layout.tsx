import { ToastProvider } from '@/components/ui/toast';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-brand-dark">ComUniMo</h1>
            <p className="mt-2 text-sm text-gray-600">
              Comitato Unitario Modena
            </p>
          </div>
          <div className="rounded-lg bg-white px-8 py-10 shadow-md">
            {children}
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

