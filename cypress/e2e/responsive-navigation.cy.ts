import { createTestJwt } from "../support/testJwt";

describe("Keyboard and mobile navigation", () => {
  it("moves from email to password by keyboard and focuses the invalid field on submit", () => {
    cy.viewport(360, 740);
    cy.visit("/login");
    cy.contains("label", "Email").click();
    cy.get("#email").should("have.focus").type("aluno@example.test");
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.get("#password").should("have.focus");
    cy.contains("button", "Entrar").click();
    cy.get("#password:invalid").should("have.focus");
    cy.location("pathname").should("eq", "/login");
  });

  it("opens and dismisses the mobile drawer and remembers the theme after navigation", () => {
    cy.viewport(390, 844);
    const user = {
      id: 9,
      name: "Aluno",
      email: "aluno@example.test",
      register: "A00001",
      role: "STUDENT",
    };
    cy.intercept("GET", "**/users/me", user);
    cy.intercept("GET", "**/students/me/turma", {
      className: "Turma E2E",
      academicYear: "6º ano",
      classmates: [],
      teachers: [],
    });
    cy.visit("/account", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", createTestJwt());
        win.localStorage.setItem("user", JSON.stringify(user));
        win.localStorage.setItem("theme", "light");
      },
    });
    cy.contains("h1", "Minha conta").should("be.visible");
    const drawer = 'aside[aria-label="Menu de navegação"]';
    cy.get('button[aria-label="Abrir menu"]').click();
    cy.get(drawer)
      .should("be.visible")
      .and("have.attr", "aria-hidden", "false");
    cy.press(Cypress.Keyboard.Keys.ESC);
    cy.get(drawer).should("not.be.visible");
    cy.get('button[aria-label="Abrir menu"]').click();
    cy.get(drawer).contains("button", "Alternar tema").click();
    cy.get("html").should("have.attr", "data-theme", "dark");
    cy.get(drawer).contains("a", "Minha turma").click();
    cy.get(drawer).should("not.be.visible");
    cy.contains("main", "Turma E2E").should("be.visible");
    cy.reload();
    cy.contains("main", "Turma E2E").should("be.visible");
    cy.get("html").should("have.attr", "data-theme", "dark");
    cy.document().should((doc) => {
      expect(doc.documentElement.scrollWidth).to.be.at.most(
        doc.documentElement.clientWidth,
      );
    });
  });
});
