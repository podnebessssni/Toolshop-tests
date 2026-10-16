# Part 3 — How I worked with AI

- I used OpenAI Codex (GPT-6) to inspect the project, implement the Playwright layers and fixtures, revise the scenario factory, and help shape the test plan. I used no other AI models.
- I delegated code changes and command-based checks to Codex, but did not create subagents. I kept the scenario choices, defect interpretation, and final review decisions with myself.
- I added value by asking Codex to verify the intercepted endpoint against actual browser traffic instead of assuming the URL, and by reporting that the guest form accepts `some@email`. I kept that email finding separate because it is outside the payment-step plan.
- I checked `GET /status` for API version `5.0`, observed `POST https://api.practicesoftwaretesting.com/payment/check` in the browser, ran `npm ci` and `npx tsc --noEmit`, then ran all four Playwright scenarios. Declined and serverError passed; approved exposed the missing invoice, and slowDecision exposed the still-enabled Confirm button.
- Codex initially treated both a broad `**/payment/check` route as adequate and `toHaveCount(0)` as proof that no invoice existed. I asked it to verify the actual API URL and pointed out that wizard steps stay in the DOM, so it configured the exact API URL and `POST` method and changed the invoice check to a visibility assertion.
- On a larger codebase, I would set up a stable staging environment and a short browser/API smoke run first, then agree on invoice-recovery and pending-submit contracts before expanding the scenario matrix.
