import { expect, Page, Response, test } from "@playwright/test";
import { ScenarioData } from "@src/data/scenarioData";
import { CheckoutScreen } from "@src/pages/CheckoutScreen";
import { PaymentDecisionInterceptor } from "@src/fixtures/PaymentDecisionInterceptor";

export class CheckoutFunctions {
  private invoiceRequests = 0;

  constructor(
    private readonly page: Page,
    private readonly screen: CheckoutScreen,
    private readonly interceptor: PaymentDecisionInterceptor,
  ) {
    this.page.on("request", (request) => {
      if (
        request.url() === this.interceptor.guestInvoiceURL &&
        request.method() === "POST"
      ) {
        this.invoiceRequests += 1;
      }
    });
  }

  async approved(data: ScenarioData): Promise<void> {
    await test.step("Complete an approved guest checkout", async () => {
      await this.prepareCheckout(data);
      const response = await this.submitDecision();
      await this.assertApproved(data, response);
    });
  }

  async declined(data: ScenarioData): Promise<void> {
    await test.step("Complete a declined guest checkout", async () => {
      await this.prepareCheckout(data);
      const response = await this.submitDecision();
      await this.assertDeclined(data, response);
    });
  }

  async serverError(data: ScenarioData): Promise<void> {
    await test.step("Handle a payment decision service error", async () => {
      await this.prepareCheckout(data);
      const response = await this.submitDecision();
      await this.assertServerError(data, response);
    });
  }

  async slowDecision(data: ScenarioData): Promise<void> {
    await test.step("Handle a slow payment decision", async () => {
      await this.prepareCheckout(data);
      const { responsePromise } = await this.beginSlowDecision();
      await this.assertSlowDecision(data, responsePromise);
    });
  }

  private async prepareCheckout(data: ScenarioData): Promise<void> {
    await test.step(`Prepare guest checkout with ${data.product.name} and select financing`, async () => {
      await this.interceptor.install(data);
      await this.page.goto("/");
      await this.addProductToCart(data);
      await this.continueAsGuest(data);
      await this.fillAddressAndContinue(data);
      await this.selectPayment(data);
    });
  }

  private async addProductToCart(data: ScenarioData): Promise<void> {
    await test.step(`Add ${data.product.name} to the cart`, async () => {
      await this.screen.productCard(data.product.name).click();
      await this.screen.addToCart.click();
      await this.screen.cartLink.click();
      await this.screen.checkout.click();
    });
  }

  private async continueAsGuest(data: ScenarioData): Promise<void> {
    await test.step("Continue checkout as a guest", async () => {
      await this.screen.guestTab.click();
      await this.screen.guestEmail.fill(data.consumer.email);
      await this.screen.guestFirstName.fill(data.consumer.firstName);
      await this.screen.guestLastName.fill(data.consumer.lastName);
      await this.screen.guestSubmit.click();
      await this.screen.proceedGuest.click();
    });
  }

  private async fillAddressAndContinue(data: ScenarioData): Promise<void> {
    await test.step("Fill the guest shipping address and continue", async () => {
      await this.screen.country.selectOption({
        label: data.consumer.address.country,
      });
      await this.screen.postalCode.fill(data.consumer.address.postalCode);
      await this.screen.houseNumber.fill(data.consumer.address.houseNumber);
      await this.screen.street.fill(data.consumer.address.street);
      await this.screen.city.fill(data.consumer.address.city);
      await this.screen.state.fill(data.consumer.address.state);
      await this.screen.proceedAddress.click();
    });
  }

  private async selectPayment(data: ScenarioData): Promise<void> {
    await test.step("Select the financing payment option", async () => {
      await this.screen.paymentMethod.selectOption(data.payment.method);
      await this.screen.installments.selectOption(data.payment.installments);
    });
  }

  private async submitDecision(): Promise<Response> {
    return test.step("Submit payment and capture the decision response", async () => {
      const responseListener = this.responseListener();
      // Register the response listener before clicking so a fast response cannot be missed.
      const [response] = await Promise.all([
        responseListener,
        this.screen.confirm.click(),
      ]);
      return response;
    });
  }

  private async beginSlowDecision(): Promise<{
    responsePromise: Promise<Response>;
  }> {
    return test.step("Submit payment and wait for the delayed decision", async () => {
      const responseListener = this.responseListener();
      await this.screen.confirm.click();
      return { responsePromise: responseListener };
    });
  }

  private async assertApproved(
    data: ScenarioData,
    response: Response,
  ): Promise<void> {
    await test.step("Verify approval and the created invoice", async () => {
      expect
        .soft(response.status(), "Payment decision returns approval")
        .toBe(data.expected.status);
      expect
        .soft(await response.json(), "Payment decision body confirms success")
        .toEqual(data.expected.body);
      await expect
        .soft(this.screen.success, "Approved decision is shown to the shopper")
        .toBeVisible();
      await expect
        .soft(
          this.screen.invoiceNumber,
          "Successful checkout displays an invoice number",
        )
        .toBeVisible();
      expect
        .soft(this.invoiceRequests, "Approval creates one guest invoice")
        .toBe(1);
      this.gate();
    });
  }

  private async assertDeclined(
    data: ScenarioData,
    response: Response,
  ): Promise<void> {
    await test.step("Verify financing decline and absence of an invoice", async () => {
      expect
        .soft(
          response.status(),
          "Decline response has its expected non-success status",
        )
        .toBe(data.expected.status);
      expect
        .soft(
          await response.json(),
          "Decline response has its expected error shape",
        )
        .toEqual(data.expected.body);
      await expect
        .soft(this.screen.error, "Specific financing decline is visible")
        .toHaveText(data.expected.uiMessage);
      await expect
        .soft(
          this.screen.invoiceNumber,
          "Invoice number stays hidden after a declined payment",
        )
        .toBeHidden();
      expect
        .soft(this.invoiceRequests, "Decline does not submit a guest invoice")
        .toBe(0);
      this.gate();
    });
  }

  private async assertServerError(
    data: ScenarioData,
    response: Response,
  ): Promise<void> {
    await test.step("Verify payment service error and absence of an invoice", async () => {
      expect
        .soft(response.status(), "Server failure response has status 500")
        .toBe(data.expected.status);
      expect
        .soft(
          await response.json(),
          "Server failure response has an error body",
        )
        .toEqual(data.expected.body);
      await expect
        .soft(
          this.screen.error,
          "Payment service failure is surfaced to the shopper",
        )
        .toHaveText(data.expected.uiMessage);
      await expect
        .soft(
          this.screen.invoiceNumber,
          "Invoice number stays hidden after a payment service failure",
        )
        .toBeHidden();
      expect
        .soft(this.invoiceRequests, "Payment service failure does not submit a guest invoice")
        .toBe(0);
      this.gate();
    });
  }

  private async assertSlowDecision(
    data: ScenarioData,
    responsePromise: Promise<Response>,
  ): Promise<void> {
    await test.step("Verify pending state, one submission, and the eventual result", async () => {
      await expect
        .soft(
          this.screen.confirm,
          "Submit is disabled while the decision is pending",
        )
        .toBeDisabled({ timeout: 500 });
      await expect
        .soft(
          this.screen.success,
          "Success is not shown before the delayed response",
        )
        .toBeHidden({ timeout: 500 });
      await expect
        .soft(
          this.screen.error,
          "Error is not shown before the delayed response",
        )
        .toBeHidden({ timeout: 500 });
      const response = await responsePromise;
      expect
        .soft(response.status(), "Delayed decision eventually succeeds")
        .toBe(data.expected.status);
      expect
        .soft(
          this.interceptor.decisionCount,
          "Checkout sent one decision request despite the pending state",
        )
        .toBe(1);
      await expect
        .soft(this.screen.success, "Approval appears after the delayed response")
        .toBeVisible();
      this.gate();
    });
  }

  private responseListener(): Promise<Response> {
    return this.page.waitForResponse(
      (response) =>
        response.url() === this.interceptor.paymentCheckURL &&
        response.request().method() === "POST",
    );
  }

  private gate(): void {
    expect(
      test.info().errors,
      "All soft assertions in this flow step should pass",
    ).toHaveLength(0);
  }
}
