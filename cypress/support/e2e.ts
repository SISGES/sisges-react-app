import "./commands";

// Live specs always authenticate against the running API.
if (Cypress.spec.relative.startsWith("cypress/e2e/")) {
  beforeEach(() => {
    cy.intercept("**/api/**", {
      statusCode: 503,
      body: { message: "Unstubbed API request" },
    });
    cy.intercept("POST", "**/classes/search", []);
    cy.intercept("GET", "**/auth/validate", { statusCode: 200, body: "" });
    cy.intercept("GET", "**/api/events", []);
  });
}
