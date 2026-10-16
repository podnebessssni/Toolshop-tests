# Design answers

## Trade-offs

- **Kept:** one `CheckoutScreen` holds the checkout locators. This kept a four-test, payment-focused assignment small and avoided screen abstractions used only once.
- **Would reverse:** `CheckoutFunctions` currently counts guest-invoice requests while orchestrating the UI. At a larger size I would move that observation into a small typed network observer fixture, leaving the flow responsible for checkout behavior and assertions. The separation would make request assertions reusable and easier to isolate.

## Growth and CI

- **At 50 tests:** the single checkout screen and flow class would become the first maintenance pressure. I would split screen locators by wizard step and flow methods by customer journey, keep shared scenario builders and typed fixtures, and group specs by risk/outcome. Avoid a helper for every click; extract only repeated behavior.
- **At 300 tests:** shared mutable accounts/carts and repeated live setup would become the main reliability and runtime problems. I would add isolated data provisioning, API setup/cleanup where supported, contract-focused API tests, and a small set of end-to-end checkout tests. Run Playwright with `--shard=x/n`; each shard uploads a blob report, then a dependent report job downloads all blobs and runs `playwright merge-reports` to publish one HTML report, retaining traces for failures. Retries should be visible in that report, not treated as passes without review.

## Three environments

- Select an explicit environment profile (for example, `TARGET_ENV=dev|stage|prod`) that provides UI URL, API URL, and backend capabilities. Validate the profile at startup and keep credentials in CI secrets. Keep scenario intent the same across environments; use an adapter for backend contract differences and environment-owned data provisioning for accounts/products. Use isolated or synthetic records and clean them up where the API permits. Do not silently fall back to production URLs.

## Change request: decision returns financing offers

- **`src/data/scenarioData.ts`:** change expected decision data from one verdict to a typed offer array and selected offer (for example, 12 months); keep variation in the scenario factory. First clarify how a decline is represented—an empty array, a separate error, or a later selection failure—because the new contract does not specify it.
- **`src/fixtures/PaymentDecisionInterceptor.ts`:** keep the same exact `POST /payment/check` route, but fulfill it with the scenario's offers array. Add no offer-selection behavior to the interceptor; it mocks the decision boundary only.
- **`src/pages/CheckoutScreen.ts`:** add locators for the returned offer choices, their terms/rates, and the selection/continue control. Keep the class locator-only.
- **`src/functions/CheckoutFunctions.ts`:** after observing the offer response, assert the displayed terms/rates, select the scenario's expected offer, then assert the order result. Update slow-decision assertions to cover the pending decision and the offer-selection state. Preserve status/body assertions for server errors.
- **`tests/checkout.spec.ts`:** no edits if the four spec calls and flow method signatures remain unchanged. The `approved` and `slowDecision` scenario expectations change through the factory/flow. `declined` must be redesigned after the API owner confirms the decline contract; `serverError` remains applicable. Add a separate offer-choice spec only if the team wants explicit coverage for each term/rate combination.
