import { ToastProvider } from '@/components/ui/toast';

/**
 * Layout for public pages
 * Simple wrapper with ToastProvider
 * No authentication required
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}

