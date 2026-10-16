import { Page, Route } from '@playwright/test';
import { ScenarioData } from '@src/data/scenarioData';

export class PaymentDecisionInterceptor {
  private decisions = 0;
  readonly paymentCheckURL: string;
  readonly guestInvoiceURL: string;

  constructor(private readonly page: Page, apiURL: string) {
    this.paymentCheckURL = new URL('/payment/check', apiURL).toString();
    this.guestInvoiceURL = new URL('/invoices/guest', apiURL).toString();
  }

  get decisionCount(): number { return this.decisions; }

  async install(data: ScenarioData): Promise<void> {
    this.decisions = 0;
    await this.page.route(this.paymentCheckURL, async (route: Route) => {
      if (route.request().method() !== 'POST') return route.continue();
      this.decisions += 1;
      if (data.delayMs > 0) await new Promise<void>((resolve) => setTimeout(resolve, data.delayMs));
      await route.fulfill({ status: data.expected.status, contentType: 'application/json', body: JSON.stringify(data.expected.body) });
    });
  }
}
