/// <reference types="cypress" />

import { createTestJwt } from "../support/testJwt";

describe("Admin — Configuração de notas", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/announcements/feed", []).as("feed");
    cy.visit("/admin/notas", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", createTestJwt());
        win.localStorage.setItem(
          "user",
          JSON.stringify({
            id: 1,
            name: "Admin Cypress",
            email: "admin@test.local",
            register: "ADM001",
            role: "ADMIN",
          }),
        );
      },
    });
  });

  it("carrega e exibe configuração de notas", () => {
    cy.intercept("GET", "**/grading-config", {
      statusCode: 200,
      body: {
        yearMaxPoints: 100,
        yearMinPercentage: 60,
        trimester1MaxPoints: 33,
        trimester1MinPercentage: 60,
        trimester2MaxPoints: 33,
        trimester2MinPercentage: 60,
        trimester3MaxPoints: 34,
        trimester3MinPercentage: 60,
        trimester1PointsProvas: 11,
        trimester1PointsAtividades: 11,
        trimester1PointsTrabalhos: 11,
        trimester2PointsProvas: 11,
        trimester2PointsAtividades: 11,
        trimester2PointsTrabalhos: 11,
        trimester3PointsProvas: 11,
        trimester3PointsAtividades: 11,
        trimester3PointsTrabalhos: 12,
      },
    }).as("config");

    cy.wait("@config");
    cy.contains("Configuração de Notas").should("be.visible");
    cy.get("#yearMax").should("have.value", "100");
  });
});
