/// <reference types="cypress" />

import { createTestJwt } from "../support/testJwt";

describe("Próximos eventos", () => {
  it("não mostra eventos passados e usa o controle compacto para criar", () => {
    cy.intercept("GET", "**/announcements/feed", []).as("feed");
    cy.intercept("GET", "**/events", [
      {
        id: 1,
        title: "Evento passado",
        eventAt: "2020-01-01T09:00:00Z",
        audience: "ALL",
        createdAt: "2020-01-01T09:00:00Z",
      },
      {
        id: 2,
        title: "Feira de ciências",
        eventAt: "2030-09-24T09:30:00Z",
        audience: "ALL",
        createdAt: "2030-09-01T09:30:00Z",
      },
    ]).as("events");

    cy.visit("/", {
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

    cy.wait("@events");
    cy.contains("Feira de ciências").should("be.visible");
    cy.contains("Evento passado").should("not.exist");
    cy.get('button[aria-label="Criar evento"]').should("have.text", "+");
  });
});
