# Toolshop guest checkout decision tests

Standalone Playwright + TypeScript assignment repository. From a clean clone (Node.js and npm required):

```sh
npm ci
npx playwright install chromium
npx tsc --noEmit
npx playwright test
```

`npm ci` uses the committed `package-lock.json` for a reproducible dependency install. Playwright browsers are installed separately because they are platform-specific. The same commands work locally and in CI after the browser install; CI sets `CI` so the config forbids focused tests, retries failures twice, and uses two workers. Locally, retries are disabled and Playwright chooses its default worker count.

Specs import `test` from `src/fixtures/test`, never directly from `@playwright/test`, so the typed project fixtures provide the checkout screen and decision interceptor consistently. The API origin is configured as `use.apiURL`; the interceptor and response listener target its exact `POST /payment/check` URL. Checkout and invoice traffic use the deployed application.

Layer map:

- `src/core/BasePage.ts` owns the shared Playwright page handle.
- `src/pages/CheckoutScreen.ts` owns checkout locators.
- `src/functions/CheckoutFunctions.ts` owns the guest-checkout and payment flows, steps, and assertions.
- `src/fixtures/` creates typed screen/interceptor fixtures and mocks the payment-decision API.
- `tests/checkout.spec.ts` only selects a scenario and invokes a flow method.

Four scenarios cover approval, decline, server error, and a 2.5 second delayed decision. The factory pins fictional consumer and payment data and randomizes only the product name. Product IDs are generated dynamically by the app, so the screen locates the product card by its generated `product-*` test ID and exact product name. Names, email, and address stay fixed so failures are easy to reproduce and compare; randomizing personal fields would add little coverage to these payment-decision scenarios. A data generator such as Faker would make sense if the suite were testing input validation or many distinct customer profiles, with a fixed seed if reproducibility were important. No real credentials or payment details are used. The config sets `data-test` as the test ID attribute, forbids `.only` in CI, and uses different retry and worker settings locally and in CI.

The app is third-party and its selectors can change. Run against the deployed v5.0 app and confirm `GET https://api.practicesoftwaretesting.com/status` reports version `5.0`.

Against the current deployment, `declined` and `serverError` pass. `approved` and `slowDecision` intentionally fail on the reproduced invoice-creation and pending-submit defects documented in the test design; a non-zero full-suite result is expected until those defects are fixed by the application team.

Part 2 is documented in [TEST-DESIGN.md](TEST-DESIGN.md), Part 3 in [AI_NOTES.md](AI_NOTES.md), and the remaining written answers in [DESIGN.md](DESIGN.md).
