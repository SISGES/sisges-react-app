/// <reference types="cypress" />

import { createTestJwt } from "../support/testJwt";

describe("Teacher activity gradebook", () => {
  it("loads, saves and releases grades", () => {
    cy.intercept("GET", "**/activities/99/gradebook", {
      activityId: 99,
      classMeetingId: 10,
      title: "Prova Trimestral",
      activityType: "PROVA",
      trimesterNumber: 1,
      maxPoints: 10,
      released: false,
      students: [
        { studentId: 1, userId: 101, studentName: "Aluno 1", score: 7 },
        { studentId: 2, userId: 102, studentName: "Aluno 2", score: 8.5 },
      ],
    }).as("gradebook");

    cy.intercept("PUT", "**/activities/99/grades", (req) => {
      expect(req.body.entries).to.have.length(2);
      req.reply({
        activityId: 99,
        classMeetingId: 10,
        title: "Prova Trimestral",
        activityType: "PROVA",
        trimesterNumber: 1,
        maxPoints: 10,
        released: false,
        students: [
          { studentId: 1, userId: 101, studentName: "Aluno 1", score: 9 },
          { studentId: 2, userId: 102, studentName: "Aluno 2", score: 8.5 },
        ],
      });
    }).as("saveGrades");

    cy.intercept("POST", "**/activities/99/release", {
      id: 99,
      classMeetingId: 10,
      title: "Prova Trimestral",
      description: null,
      filePath: null,
      activityType: "PROVA",
      trimesterNumber: 1,
      maxPoints: 10,
      released: true,
      releasedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }).as("release");

    cy.visit("/atividades/99/notas", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", createTestJwt());
        win.localStorage.setItem(
          "user",
          JSON.stringify({
            id: 2,
            name: "Professor Cypress",
            email: "teacher-cypress@test.local",
            register: "TCH1",
            role: "TEACHER",
          }),
        );
      },
    });

    cy.wait("@gradebook");
    cy.contains("Lançamento de Notas").should("be.visible");
    cy.get("input").first().clear().type("9");
    cy.contains("button", "Salvar").click();
    cy.wait("@saveGrades");

    cy.contains("button", "Liberar notas").click();
    cy.contains("button", "Liberar").click();
    cy.wait("@release");
  });
});
