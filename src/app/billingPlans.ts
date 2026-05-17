export type BillingPlanId = 'free' | 'plus';

export type BillingPlan = {
  id: BillingPlanId;
  name: string;
  priceLabel: string;
  description: string;
  features: string[];
  ctaLabel: string;
};

export type PlanComparisonRow = {
  label: string;
  free: boolean;
  plus: boolean;
};

export type PaymentReadinessStatus = 'done' | 'next' | 'blocked';

export type PaymentReadinessItem = {
  id: string;
  label: string;
  detail: string;
  status: PaymentReadinessStatus;
};

export const pantryPalPlans: BillingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    priceLabel: '$0',
    description: 'Track food, build grocery lists, and get basic meal ideas.',
    features: [
      'Pantry and expiration tracking',
      'Grocery list',
      'Basic meal suggestions',
      'Manual barcode fixes',
    ],
    ctaLabel: 'Current plan',
  },
  {
    id: 'plus',
    name: 'PantryPal Plus',
    priceLabel: '$4.99/mo',
    description: 'Smarter kitchen help for meal planning, savings, and iOS release.',
    features: [
      'AI Chef pantry-aware suggestions',
      'Fridge Rescue mode',
      'Shared household barcode memory',
      'Future receipt scanning support',
    ],
    ctaLabel: 'Coming soon for iOS',
  },
];

export const iosPaymentReadinessItems: PaymentReadinessItem[] = [
  {
    id: 'plans',
    label: 'Define Free and Plus plans',
    detail: 'Use the same plan names and benefits in the app and App Store Connect.',
    status: 'done',
  },
  {
    id: 'capacitor',
    label: 'Create iOS app shell',
    detail: 'Wrap PantryPal with Capacitor and generate the Xcode project.',
    status: 'next',
  },
  {
    id: 'storekit',
    label: 'Connect StoreKit purchases',
    detail: 'Use Apple In-App Purchase for iOS subscriptions before App Review.',
    status: 'blocked',
  },
  {
    id: 'testflight',
    label: 'Test with TestFlight',
    detail: 'Verify signup, restore purchases, and subscription states on a real iPhone.',
    status: 'blocked',
  },
];

export function buildPlanComparison(): PlanComparisonRow[] {
  return [
    { label: 'Pantry and grocery tracking', free: true, plus: true },
    { label: 'Basic meal suggestions', free: true, plus: true },
    { label: 'AI Chef pantry-aware suggestions', free: false, plus: true },
    { label: 'Fridge Rescue and advanced meal modes', free: false, plus: true },
    { label: 'Future receipt scanning support', free: false, plus: true },
  ];
}
