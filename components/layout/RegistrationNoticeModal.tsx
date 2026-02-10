'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Sparkles, CheckCircle2, ArrowRight, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function RegistrationNoticeModal() {
  const { session, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (session) {
      setOpen(false);
      return;
    }

    if (pathname?.startsWith('/register') || pathname?.startsWith('/login') || pathname?.startsWith('/registrations')) {
      setOpen(false);
      return;
    }

    setOpen(true);
  }, [loading, session, pathname]);

  if (loading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl overflow-hidden border border-blue-100/60 bg-white/95 p-0 shadow-2xl shadow-blue-500/10">
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/80">
                Comunicazione importante
              </p>
              <h2 className="text-xl font-semibold">Nuova versione di ComUniMo</h2>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl text-slate-900">
              Registrazione richiesta
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Per accedere alla nuova versione del portale è necessario registrarsi di nuovo.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 grid gap-3 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-600" />
              <p>Il nuovo accesso migliora sicurezza e gestione profili.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-600" />
              <p>La registrazione richiede meno di un minuto.</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
            <Link
              href="/registrations"
              className="group flex items-center gap-2 text-sm font-medium text-amber-800 transition hover:text-amber-900"
            >
              <UserPlus className="h-4 w-4 text-amber-600" />
              <span>
                Devi iscrivere un atleta? <span className="underline underline-offset-2">Usa il form di iscrizione libera</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Chiudi
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Accedi</Link>
            </Button>
            <Button asChild>
              <Link href="/register" className="group">
                Registrati ora
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}


