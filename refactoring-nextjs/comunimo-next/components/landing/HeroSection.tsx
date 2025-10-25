'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RegistrationStatusBadge } from './RegistrationStatusBadge';
import { AnimatedBackground } from './AnimatedBackground';
import type { Championship } from '@/types/database';

interface HeroSectionProps {
  championship: Championship | null;
  registrationStatus: 'open' | 'closed';
  loading: boolean;
}

/**
 * Hero section - Ultra-modern first impression with animated gradients
 */
export function HeroSection({ championship, registrationStatus, loading }: HeroSectionProps) {
  const router = useRouter();

  const handleCTAClick = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <section className="relative min-h-[700px] overflow-hidden bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-dark animate-gradient py-20 md:py-32">
        <AnimatedBackground />
        <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-64 animate-pulse rounded-full bg-white/20" />
            <div className="mt-6 h-20 w-full max-w-3xl animate-pulse rounded-lg bg-white/20" />
            <div className="mt-4 h-8 w-96 animate-pulse rounded-lg bg-white/20" />
            <div className="mt-8 h-14 w-56 animate-pulse rounded-lg bg-white/20" />
          </div>
        </div>
      </section>
    );
  }

  if (!championship) {
    return (
      <section className="relative min-h-[700px] overflow-hidden bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-dark animate-gradient py-20 md:py-32">
        <AnimatedBackground />
        <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-5xl font-extrabold text-white md:text-7xl">
              <span className="block">ComUniMo</span>
              <span className="mt-2 block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Atletica Modena
              </span>
            </h1>
            <p className="mt-8 text-xl text-white/90 md:text-2xl">
              Comitato Unitario Modena
            </p>
            <p className="mt-4 text-lg text-white/70">
              Nessun campionato attivo al momento
            </p>
            <Button
              onClick={handleCTAClick}
              size="lg"
              className="group mt-10 bg-white px-8 py-6 text-lg font-semibold text-brand-blue shadow-2xl transition-all hover:scale-105 hover:bg-white/90"
            >
              Vai alla Dashboard
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const isOpen = registrationStatus === 'open';
  const ctaText = isOpen ? 'Iscriviti Ora' : 'Vai alla Dashboard';

  return (
    <section className="relative min-h-[700px] overflow-hidden bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-dark animate-gradient py-20 md:py-32">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Content */}
      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Registration Status Badge with Float Animation */}
          <div className="animate-float">
            <div className="glass rounded-full p-1">
              <RegistrationStatusBadge isOpen={isOpen} className="shadow-lg" />
            </div>
          </div>

          {/* Year Badge */}
          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span>Campionato {championship.year}</span>
          </div>

          {/* Championship Title with Gradient */}
          <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            <span className="block">{championship.name.split(' ').slice(0, 2).join(' ')}</span>
            <span className="mt-2 block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              {championship.name.split(' ').slice(2).join(' ')}
            </span>
          </h1>

          {/* Season */}
          {championship.season && (
            <p className="mt-6 text-xl capitalize text-white/90 md:text-2xl">
              Stagione {championship.season}
            </p>
          )}

          {/* Description */}
          {championship.description && (
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
              {championship.description}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              onClick={handleCTAClick}
              size="lg"
              className={`group relative overflow-hidden px-8 py-6 text-lg font-semibold shadow-2xl transition-all hover:scale-105 ${
                isOpen
                  ? 'bg-white text-brand-blue hover:bg-white/90'
                  : 'glass-dark border-white/30 text-white hover:bg-white/20'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {ctaText}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              {isOpen && (
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-brand-blue via-brand-red to-brand-blue opacity-0 transition-opacity group-hover:opacity-20" />
              )}
            </Button>

            {!isOpen && (
              <Button
                onClick={() => router.push('/auth/register')}
                size="lg"
                variant="ghost"
                className="px-8 py-6 text-lg font-semibold text-white hover:bg-white/10"
              >
                Crea Account
              </Button>
            )}
          </div>

          {/* Stats Card */}
          <div className="mt-16 flex justify-center">
            <div className="glass-dark group rounded-2xl p-8 backdrop-blur-md transition-all hover:scale-105 hover:bg-white/10">
              <div className="text-4xl font-bold text-white md:text-5xl">{championship.year}</div>
              <div className="mt-3 text-base text-white/70">Anno</div>
            </div>
          </div>

          {/* Date Range */}
          {championship.start_date && championship.end_date && (
            <p className="mt-8 text-sm text-white/60">
              Dal {new Date(championship.start_date).toLocaleDateString('it-IT')} al{' '}
              {new Date(championship.end_date).toLocaleDateString('it-IT')}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
            fillOpacity="1"
          />
        </svg>
      </div>
    </section>
  );
}

