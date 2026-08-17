/// <reference types="cypress" />

import { createTestJwt } from "../support/testJwt";

function visitAs(role: "STUDENT" | "TEACHER" | "ADMIN", email: string) {
  cy.visit("/", {
    onBeforeLoad(win) {
      win.localStorage.setItem("token", createTestJwt());
      win.localStorage.setItem(
        "user",
        JSON.stringify({
          id: role === "ADMIN" ? 1 : role === "TEACHER" ? 2 : 3,
          name: `User ${role}`,
          email,
          register: "REG001",
          role,
        }),
      );
    },
  });
}

describe("Controle de acesso por perfil", () => {
  it("usuário não autenticado é redirecionado para login", () => {
    cy.visit("/admin/classes");
    cy.location("pathname").should("eq", "/login");
  });

  it("STUDENT não acessa rota admin", () => {
    cy.intercept("GET", "**/announcements/feed", []).as("feed");
    visitAs("STUDENT", "student@test.local");
    cy.wait("@feed");
    cy.visit("/admin/classes");
    cy.location("pathname").should("eq", "/");
  });

  it("TEACHER acessa /aulas", () => {
    cy.intercept("GET", "**/announcements/feed", []).as("feed");
    cy.intercept("POST", "**/class/search", []).as("aulas");
    visitAs("TEACHER", "teacher@test.local");
    cy.wait("@feed");
    cy.visit("/aulas");
    cy.wait("@aulas");
    cy.location("pathname").should("eq", "/aulas");
  });

  it("STUDENT não vê botão Criar aviso", () => {
    cy.intercept("GET", "**/announcements/feed", []).as("feed");
    cy.intercept("GET", "**/materials**", []).as("materials");
    cy.intercept("GET", "**/activities/my", []).as("activities");
    visitAs("STUDENT", "student@test.local");
    cy.wait("@feed");
    cy.contains("button", "Criar aviso").should("not.exist");
  });

  it("ADMIN vê item CLASSES na sidebar", () => {
    cy.viewport(1280, 800);
    cy.intercept("GET", "**/announcements/feed", []).as("feed");
    visitAs("ADMIN", "admin@test.local");
    cy.wait("@feed");
    cy.get("nav").contains("CLASSES").should("be.visible");
  });
});
