/// <reference types="cypress" />

import { createTestJwt } from "../support/testJwt";

const admin = {
  id: 1,
  name: "Admin Cypress",
  email: "admin@test.local",
  register: "ADM001",
  role: "ADMIN",
} as const;

const classes = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  name: `Turma ${index + 1}`,
  academicYear: "6º ano",
  studentCount: 20,
  teacherCount: 2,
}));

function visitClasses() {
  cy.visit("/admin/classes", {
    onBeforeLoad(win) {
      win.localStorage.setItem("token", createTestJwt());
      win.localStorage.setItem("user", JSON.stringify(admin));
    },
  });
}

describe("Paginação de listas administrativas", () => {
  it("mostra somente uma página, navega e respeita os limites", () => {
    cy.intercept("POST", "**/classes/search", classes).as("searchClasses");
    cy.intercept("GET", "**/announcements/feed", []).as("feed");

    visitClasses();
    cy.wait("@searchClasses");
    cy.contains("td", /^Turma 1$/).should("be.visible");
    cy.contains("td", /^Turma 11$/).should("not.exist");
    cy.contains("Exibindo 1–10 de 23").should("be.visible");
    cy.contains("button", "Anterior").should("be.disabled");

    cy.contains("button", "Próxima").click();
    cy.contains("td", /^Turma 11$/).should("be.visible");
    cy.contains("td", /^Turma 1$/).should("not.exist");
    cy.contains("Exibindo 11–20 de 23").should("be.visible");

    cy.contains("button", "Próxima").click();
    cy.contains("td", /^Turma 21$/).should("be.visible");
    cy.contains("Exibindo 21–23 de 23").should("be.visible");
    cy.contains("button", "Próxima").should("be.disabled");
  });

  it("não mostra controles quando todos os itens cabem em uma página", () => {
    cy.intercept("POST", "**/classes/search", classes.slice(0, 10)).as(
      "searchClasses",
    );
    cy.intercept("GET", "**/announcements/feed", []).as("feed");

    visitClasses();
    cy.wait("@searchClasses");
    cy.get('nav[aria-label="Paginação da lista"]').should("not.exist");
  });
});
