/// <reference types="cypress" />

describe("Professor — Materiais", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/announcements/feed", []).as("feed");
    cy.intercept("POST", "**/classes/search", {
      statusCode: 200,
      body: [
        {
          id: 1,
          name: "Turma 8A",
          academicYear: "8º ano",
          studentCount: 20,
          teacherCount: 2,
        },
      ],
    }).as("classes");
    cy.intercept("GET", "**/disciplines", {
      statusCode: 200,
      body: [{ id: 2, name: "Matemática", description: null }],
    }).as("disciplines");
    cy.visitHomeAuthenticated();
    cy.wait("@feed");
  });

  it("lista materiais da turma selecionada", () => {
    cy.intercept("GET", "**/materials?*", {
      statusCode: 200,
      body: [
        {
          id: 1,
          title: "Apostila Cap. 1",
          description: "Introdução",
          materialType: "PDF",
          disciplineName: "Matemática",
          className: "Turma 8A",
        },
      ],
    }).as("materials");

    cy.visit("/materiais");
    cy.wait("@classes");
    cy.wait("@disciplines");
    cy.get("select").first().select("1");
    cy.wait("@materials");
    cy.contains("Apostila Cap. 1").should("be.visible");
  });
});
