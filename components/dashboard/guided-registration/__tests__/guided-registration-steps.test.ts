import { describe, expect, it } from 'vitest';
import {
  GUIDED_REGISTRATION_STEPS,
  GUIDED_REGISTRATION_VERSION,
  GUIDED_REGISTRATION_TOUR_ID,
} from '../GuidedRegistrationTourManager';

describe('Guided registration tour specification', () => {
  it('exposes metadata for the guided registration tour', () => {
    expect(GUIDED_REGISTRATION_TOUR_ID).toBe('guided-registration');
    expect(GUIDED_REGISTRATION_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('defines unique step identifiers with selectors and paths', () => {
    expect(GUIDED_REGISTRATION_STEPS).toHaveLength(4);

    const ids = new Set<string>();
    const selectors = new Set<string>();

    GUIDED_REGISTRATION_STEPS.forEach((step) => {
      expect(step.id).toBeTruthy();
      expect(step.selector).toMatch(/^\[data-tour-anchor=".+"]$/);
      if (step.path) {
        expect(step.path).toMatch(/^\/dashboard/);
      }

      ids.add(step.id);
      selectors.add(step.selector);
    });

    expect(ids.size).toBe(GUIDED_REGISTRATION_STEPS.length);
    expect(selectors.size).toBe(GUIDED_REGISTRATION_STEPS.length);
  });

  it('includes the required high-level actions in the step sequence', () => {
    const requiredSteps = [
      'registration-open-championships-nav',
      'registration-select-championship',
      'registration-select-society',
      'registration-start-new',
    ];

    const stepIds = GUIDED_REGISTRATION_STEPS.map((step) => step.id);
    requiredSteps.forEach((stepId) => {
      expect(stepIds).toContain(stepId);
    });
  });
});
