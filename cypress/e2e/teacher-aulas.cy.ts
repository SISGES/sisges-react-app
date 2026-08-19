/// <reference types="cypress" />

describe("Professor — Aulas", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/announcements/feed", []).as("feed");
    cy.visitHomeAuthenticated();
    cy.wait("@feed");
  });

  it("lista aulas do professor", () => {
    cy.intercept("POST", "**/class/search", {
      statusCode: 200,
      body: [
        {
          id: 5,
          date: "2026-06-10",
          startTime: "08:00:00",
          endTime: "09:00:00",
          disciplineName: "Matemática",
          schoolClassName: "Turma 7B",
          teacherName: "Professor Cypress",
        },
      ],
    }).as("aulas");

    cy.visit("/aulas");
    cy.wait("@aulas");
    cy.contains("Matemática").should("be.visible");
    cy.contains("Turma 7B").should("be.visible");
  });

  it("exibe botão para nova aula", () => {
    cy.intercept("POST", "**/class/search", []).as("aulas");
    cy.visit("/aulas");
    cy.wait("@aulas");
    cy.contains("a, button", "Nova aula").should("be.visible");
  });
});
