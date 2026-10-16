import { Locator, Page } from "@playwright/test";
import { BasePage } from "@src/core/BasePage";

export class CheckoutScreen extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  productCard(productName: string): Locator {
    return this.page
      .getByTestId(/^product-/)
      .filter({ has: this.page.getByText(productName, { exact: true }) })
      .filter({ hasNot: this.page.getByTestId("out-of-stock") });
  }
  readonly addToCart = this.page.getByTestId("add-to-cart");
  readonly cartLink = this.page.getByTestId("nav-cart");
  readonly checkout = this.page.getByTestId("proceed-1");
  readonly guestTab = this.page.getByRole("tab", {
    name: /continue as guest/i,
  });
  readonly guestEmail = this.page.getByTestId("guest-email");
  readonly guestFirstName = this.page.getByTestId("guest-first-name");
  readonly guestLastName = this.page.getByTestId("guest-last-name");
  readonly guestSubmit = this.page.getByTestId("guest-submit");
  readonly proceedGuest = this.page.getByTestId("proceed-2-guest");
  readonly street = this.page.getByTestId("street");
  readonly city = this.page.getByTestId("city");
  readonly state = this.page.getByTestId("state");
  readonly country = this.page.getByTestId("country");
  readonly postalCode = this.page.getByTestId("postal_code");
  readonly houseNumber = this.page.getByTestId("house_number");
  readonly proceedAddress = this.page.getByTestId("proceed-3");
  readonly paymentMethod = this.page.getByTestId("payment-method");
  readonly installments = this.page.getByTestId("monthly_installments");
  readonly confirm = this.page.getByTestId("finish");
  readonly success = this.page.getByTestId("payment-success-message");
  readonly error = this.page.getByTestId("payment-error-message");
  readonly invoiceNumber = this.page.getByTestId("invoice-number");
}
