type Role = "admin" | "teacher" | "student";

export function loginAs(role: Role, destination = "/") {
  cy.visit(destination);
  cy.location("pathname").should("eq", "/login");
  cy.env([`${role}Email`, `${role}Password`]).then((credentials) => {
    const email = credentials[`${role}Email`];
    const password = credentials[`${role}Password`];
    if (!email || !password)
      throw new Error(`Missing credentials for the seeded ${role} account`);
    cy.get("#email").type(email);
    cy.get("#password").type(password, { log: false });
  });
  cy.contains("button", "Entrar").click();
  cy.location("pathname").should("eq", destination);
}

export function logout() {
  cy.get('button[aria-label="Sair"]:visible').first().click();
  cy.location("pathname").should("eq", "/login");
}

export function openPage(label: string) {
  cy.get('nav[aria-label="Páginas"]:visible').contains("a", label).click();
}
