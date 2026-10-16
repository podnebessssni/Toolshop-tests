import { expect, test } from "@src/fixtures/test";
import { CheckoutFunctions } from "@src/functions/CheckoutFunctions";
import { scenarioData } from "@src/data/scenarioData";

test("approved decision creates an invoice", async ({
  page,
  checkout,
  paymentDecision,
}) => {
  await new CheckoutFunctions(page, checkout, paymentDecision).approved(
    scenarioData("approved"),
  );
});

test("declined decision does not create an invoice", async ({
  page,
  checkout,
  paymentDecision,
}) => {
  await new CheckoutFunctions(page, checkout, paymentDecision).declined(
    scenarioData("declined"),
  );
});

test("server error fails safely without creating an invoice", async ({
  page,
  checkout,
  paymentDecision,
}) => {
  await new CheckoutFunctions(page, checkout, paymentDecision).serverError(
    scenarioData("serverError"),
  );
});

test("slow decision shows pending state and prevents duplicate submission", async ({
  page,
  checkout,
  paymentDecision,
}) => {
  await new CheckoutFunctions(page, checkout, paymentDecision).slowDecision(
    scenarioData("slowDecision"),
  );
});
