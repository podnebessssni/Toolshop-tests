export type ScenarioName =
  | "approved"
  | "declined"
  | "serverError"
  | "slowDecision";

export interface ScenarioData {
  consumer: {
    email: string;
    firstName: string;
    lastName: string;
    address: {
      country: string;
      postalCode: string;
      houseNumber: string;
      street: string;
      city: string;
      state: string;
    };
  };
  product: { name: string };
  payment: { method: string; installments: string };
  expected: {
    status: number;
    body: { message?: string; error?: string };
    uiMessage: string;
  }
  delayMs: number;
}

export function scenarioData(scenario: ScenarioName): ScenarioData {
  return new ScenarioDataFactory().create(scenario);
}

class ScenarioDataFactory {
  private readonly availableProductNames = [
    "Combination Pliers",
    "Pliers",
    "Bolt Cutters",
    "Slip Joint Pliers",
    "Claw Hammer with Shock Reduction Grip",
    "Hammer",
    "Claw Hammer",
  ] as const;

  create(scenario: ScenarioName): ScenarioData {
    return this.templateFor(scenario);
  }

  private templateFor(scenario: ScenarioName): ScenarioData {
    switch (scenario) {
      case "approved":
        return this.approvedTemplate();
      case "declined":
        return this.declinedTemplate();
      case "serverError":
        return this.serverErrorTemplate();
      case "slowDecision":
        return this.slowDecisionTemplate();
    }
  };

  private baseData(): Omit<ScenarioData, "expected" | "delayMs"> {
    // Pin consumer/payment data, but randomize only the product name; the UI supplies its current dynamic product ID.
    const productIndex = Math.floor(Math.random() * this.availableProductNames.length);
    return {
      consumer: {
        email: "toolshop.qa@example.test",
        firstName: "Taylor",
        lastName: "Example",
        address: {
          country: "United States of America (the)",
          postalCode: "10001",
          houseNumber: "56",
          street: "1 Test Street",
          city: "Testville",
          state: "Test State",
        },
      },
      product: { name: this.availableProductNames[productIndex] },
      payment: { method: "buy-now-pay-later", installments: "3" },
    };
  }

  private approvedTemplate(): ScenarioData {
    return {
      ...this.baseData(),
      expected: {
        status: 200,
        body: { message: "Payment was successful" },
        uiMessage: "Payment was successful",
      },
      delayMs: 0,
    };
  }

  private declinedTemplate(): ScenarioData {
    return {
      ...this.baseData(),
      expected: {
        status: 402,
        body: { error: "Financing declined" },
        uiMessage: "Financing declined",
      },
      delayMs: 0,
    };
  }

  private serverErrorTemplate(): ScenarioData {
    return {
      ...this.baseData(),
      expected: {
        status: 500,
        body: { error: "Payment service unavailable" },
        uiMessage: "Payment service unavailable",
      },
      delayMs: 0,
    };
  }

  private slowDecisionTemplate(): ScenarioData {
    return {
      ...this.baseData(),
      expected: {
        status: 200,
        body: { message: "Payment was successful" },
        uiMessage: "Payment was successful",
      },
      delayMs: 2500,
    };
  }
}
