'use client';

import { useEffect } from 'react';
import {
  useGuidedTour,
  type GuidedTourStep,
} from '@/components/guided-tour/GuidedTourProvider';

export const GUIDED_REGISTRATION_TOUR_ID = 'guided-registration';

export const GUIDED_REGISTRATION_VERSION = '1.1.0';

export const GUIDED_REGISTRATION_STEPS: GuidedTourStep[] = [
  {
    id: 'registration-open-championships-nav',
    selector: '[data-tour-anchor="nav-championships"]',
    title: 'Apri la sezione Campionati',
    description:
      'Dal menu laterale accedi alla sezione Campionati per gestire le iscrizioni ai campionati federali.',
    path: '/dashboard',
    placement: 'right',
  },
  {
    id: 'registration-select-championship',
    selector: '[data-tour-anchor="championship-manage-button"]',
    title: 'Apri Gestisci Iscrizioni',
    description:
      'Seleziona il campionato corretto e premi “Gestisci Iscrizioni” per entrare nella pagina dedicata.',
    path: '/dashboard/races/championships',
    placement: 'bottom',
    advanceAction: 'click-target',
  },
  {
    id: 'registration-select-society',
    selector: '[data-tour-anchor="championship-society-selector"]',
    title: 'Seleziona la società da iscrivere',
    description:
      'Scegli la società con cui stai operando: solamente dopo averla selezionata potrai creare nuove iscrizioni.',
    placement: 'bottom',
  },
  {
    id: 'registration-start-new',
    selector: '[data-tour-anchor="championship-new-registration"]',
    title: 'Avvia una nuova iscrizione',
    description:
      'Usa il pulsante “Nuova Iscrizione” per aprire la procedura guidata e aggiungere gli atleti al campionato.',
    placement: 'left',
  },
];

export function GuidedRegistrationTourManager() {
  const {
    registerTour,
    activeStep,
    activeTourId,
    isActive,
    nextStep,
  } = useGuidedTour();

  useEffect(() => {
    const unregister = registerTour({
      id: GUIDED_REGISTRATION_TOUR_ID,
      meta: {
        title: 'Percorso iscrizione campionato',
        version: GUIDED_REGISTRATION_VERSION,
      },
      steps: GUIDED_REGISTRATION_STEPS,
    });

    return unregister;
  }, [registerTour]);

  useEffect(() => {
    if (!isActive || activeTourId !== GUIDED_REGISTRATION_TOUR_ID) return;
    if (activeStep?.id !== 'registration-select-society') return;

    let advanced = false;
    let selectorOpened = false;
    let openRequested = false;

    const openSelector = () => {
      if (selectorOpened) return;
      const selector = document.querySelector('[data-tour-anchor="championship-society-selector"]') as HTMLElement | null;
      if (selector && typeof selector.click === 'function') {
        selector.click();
        selectorOpened = true;
      }
    };

    const checkAndAdvance = () => {
      if (advanced) return;
      const button = document.querySelector('[data-tour-anchor="championship-new-registration"]') as HTMLButtonElement | null;
      if (button && !button.disabled && !button.classList.contains('pointer-events-none')) {
        advanced = true;
        nextStep();
        return;
      }
      if (openRequested) {
        openSelector();
      }
    };

    checkAndAdvance();

    const observer = new MutationObserver(() => {
      checkAndAdvance();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'disabled', 'aria-disabled'],
    });

    const interval = window.setInterval(checkAndAdvance, 300);

    const handleOpenRequest = () => {
      if (advanced) return;
      openRequested = true;
      window.setTimeout(openSelector, 120);
    };

    window.addEventListener('guided-tour-society-open-request', handleOpenRequest);

    return () => {
      advanced = true;
      observer.disconnect();
      window.clearInterval(interval);
      window.removeEventListener('guided-tour-society-open-request', handleOpenRequest);
    };
  }, [isActive, activeStep, activeTourId, nextStep]);

  return null;
}
