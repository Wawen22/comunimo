import { describe, expect, it, beforeEach, vi } from 'vitest';
import React, { useEffect } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GuidedTourProvider, useGuidedTour } from '../GuidedTourProvider';

vi.mock('@/lib/hooks/useUser', () => ({
  useUser: () => ({
    profile: { id: 'test-user' },
    societies: [],
    loading: false,
    error: null,
  }),
}));

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  usePathname: () => '/dashboard',
}));

const TEST_TOUR_ID = 'test-tour';

function TestHarness() {
  const {
    registerTour,
    startTour,
    nextStep,
    stopTour,
    activeStep,
    activeTourId,
    isActive,
  } = useGuidedTour();

  useEffect(() => {
    const unregister = registerTour({
      id: TEST_TOUR_ID,
      meta: { title: 'Test Tour', version: '0.0.1' },
      steps: [
        {
          id: 'step-one',
          selector: '[data-tour-anchor="step-one-target"]',
          title: 'Step One',
          description: 'First step description',
          path: '/dashboard',
        },
        {
          id: 'step-two',
          selector: '[data-tour-anchor="step-two-target"]',
          title: 'Step Two',
          description: 'Second step description',
          path: '/dashboard',
        },
      ],
    });

    return unregister;
  }, [registerTour]);

  return (
    <div>
      <button type="button" onClick={() => startTour(TEST_TOUR_ID)}>
        start tour
      </button>
      <button type="button" onClick={nextStep}>
        next step
      </button>
      <button type="button" onClick={stopTour}>
        stop tour
      </button>

      <div data-testid="state">
        {isActive ? `active:${activeTourId}:${activeStep?.id}` : 'inactive'}
      </div>

      <div data-tour-anchor="step-one-target">Step one target</div>
      <div data-tour-anchor="step-two-target">Step two target</div>
    </div>
  );
}

describe('GuidedTourProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    pushMock.mockReset();
  });

  it('advances through steps and persists completion state', async () => {
    render(
      <GuidedTourProvider>
        <TestHarness />
      </GuidedTourProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText(/start tour/i));
    });

    expect(screen.getByText(/Step One/)).toBeInTheDocument();
    expect(screen.getByTestId('state').textContent).toBe('active:test-tour:step-one');

    await act(async () => {
      fireEvent.click(screen.getByText(/Avanti/i));
    });

    expect(screen.getByText(/Step Two/)).toBeInTheDocument();
    expect(screen.getByTestId('state').textContent).toBe('active:test-tour:step-two');

    await act(async () => {
      fireEvent.click(screen.getByText(/Concludi/i));
    });

    expect(screen.getByTestId('state').textContent).toBe('inactive');

    const stored = localStorage.getItem('comunimo-guided-tour-state');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored ?? '{}');
    expect(parsed['test-user'][TEST_TOUR_ID].completed).toBe(true);
  });

  it('allows manual interruption without persisting completion', async () => {
    render(
      <GuidedTourProvider>
        <TestHarness />
      </GuidedTourProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText(/start tour/i));
    });

    expect(screen.getByText(/Step One/)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText(/Salta tour/i));
    });

    const stored = localStorage.getItem('comunimo-guided-tour-state');
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed['test-user']).not.toHaveProperty(TEST_TOUR_ID);
    }
  });
});
