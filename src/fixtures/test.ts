import { expect, test as base } from '@playwright/test';
import { CheckoutScreen } from '@src/pages/CheckoutScreen';
import { PaymentDecisionInterceptor } from '@src/fixtures/PaymentDecisionInterceptor';

export type Fixtures = { apiURL: string; checkout: CheckoutScreen; paymentDecision: PaymentDecisionInterceptor };
export const test = base.extend<Fixtures>({
  apiURL: ['', { option: true }],
  checkout: async ({ page }, use) => { await use(new CheckoutScreen(page)); },
  paymentDecision: async ({ page, apiURL }, use) => { await use(new PaymentDecisionInterceptor(page, apiURL)); },
});
export { expect };
