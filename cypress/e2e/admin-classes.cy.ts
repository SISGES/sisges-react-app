/// <reference types="cypress" />

import { createTestJwt } from "../support/testJwt";

describe("Admin — Turmas", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/announcements/feed", []).as("feed");
    cy.visit("/admin/classes", {
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

  it("lista turmas retornadas pela API", () => {
    cy.intercept("POST", "**/classes/search", {
      statusCode: 200,
      body: [
        {
          id: 10,
          name: "Turma 6A",
          academicYear: "6º ano",
          studentCount: 25,
          teacherCount: 3,
        },
      ],
    }).as("search");

    cy.wait("@search");
    cy.contains("Turma 6A").should("be.visible");
    cy.contains("6º ano").should("be.visible");
  });

  it("exibe estado vazio quando não há turmas", () => {
    cy.intercept("POST", "**/classes/search", []).as("search");
    cy.wait("@search");
    cy.contains("Nenhuma turma cadastrada.").should("be.visible");
  });
});
