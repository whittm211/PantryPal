import { describe, expect, it } from 'vitest';
import {
  buildPlanComparison,
  iosPaymentReadinessItems,
  pantryPalPlans,
} from './billingPlans';

describe('billing plans', () => {
  it('defines a free plan and a Plus plan for the upgrade screen', () => {
    expect(pantryPalPlans.map((plan) => plan.id)).toEqual(['free', 'plus']);
    expect(pantryPalPlans.find((plan) => plan.id === 'plus')?.priceLabel).toBe('$4.99/mo');
  });

  it('marks Plus-only features in the plan comparison', () => {
    expect(buildPlanComparison()).toContainEqual({
      label: 'AI Chef pantry-aware suggestions',
      free: false,
      plus: true,
    });
  });

  it('keeps iOS payment setup explicitly blocked until StoreKit is wired', () => {
    expect(iosPaymentReadinessItems.some((item) => item.status === 'blocked')).toBe(true);
    expect(iosPaymentReadinessItems.find((item) => item.id === 'storekit')?.label).toBe('Connect StoreKit purchases');
  });
});
