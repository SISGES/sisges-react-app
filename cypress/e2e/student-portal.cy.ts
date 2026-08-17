/// <reference types="cypress" />

import { createTestJwt } from "../support/testJwt";

function visitAsStudent(path: string) {
  cy.intercept("GET", "**/announcements/feed", []).as("feed");
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem("token", createTestJwt());
      win.localStorage.setItem(
        "user",
        JSON.stringify({
          id: 9,
          name: "Aluno Cypress",
          email: "student-cypress@test.local",
          register: "STU1",
          role: "STUDENT",
        }),
      );
    },
  });
}

describe("Portal do aluno", () => {
  it("exibe turma do aluno em /minha-turma", () => {
    cy.intercept("GET", "**/students/me/turma", {
      statusCode: 200,
      body: {
        className: "Turma Cypress E2E",
        academicYear: "6º ano",
        classmates: [],
        teachers: [
          { id: 1, name: "Cypress E2E Teacher", email: "teacher@test.local" },
        ],
      },
    }).as("turma");

    visitAsStudent("/minha-turma");
    cy.wait("@turma");
    cy.contains("Turma Cypress E2E").should("be.visible");
    cy.contains("Cypress E2E Teacher").should("be.visible");
  });

  it("exibe faltas por disciplina em /faltas", () => {
    cy.intercept("GET", "**/students/me/turma", {
      statusCode: 200,
      body: {
        className: "Turma Cypress E2E",
        academicYear: "6º ano",
        classmates: [],
        teachers: [],
      },
    }).as("turma");
    cy.intercept("GET", "**/students/me/faltas-por-disciplina", {
      statusCode: 200,
      body: [
        {
          disciplineId: 1,
          disciplineName: "Matemática Cypress",
          absenceCount: 2,
        },
        { disciplineId: 2, disciplineName: "Português", absenceCount: 0 },
      ],
    }).as("faltas");

    visitAsStudent("/faltas");
    cy.wait("@turma");
    cy.wait("@faltas");
    cy.contains("Matemática Cypress").should("be.visible");
    cy.contains("td", "2").should("be.visible");
  });
});
