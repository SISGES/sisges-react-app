/// <reference types="cypress" />

import { createTestJwt } from "../support/testJwt";

describe("Student boletim screen", () => {
  it("renders trimester and recovery rows with blanks for unreleased scores", () => {
    cy.intercept("GET", "**/boletim/me", {
      fixedApprovalPercentage: 70,
      yearMaxPoints: 100,
      totalReleasedScore: 54,
      eligibleForYearRecovery: true,
      trimesters: [
        {
          trimester: 1,
          trimesterMaxPoints: 33,
          totalReleasedScore: 18,
          allActivitiesReleased: false,
          eligibleForRecovery: false,
          activities: [
            {
              activityId: 1,
              title: "Prova 1",
              activityType: "PROVA",
              maxPoints: 10,
              score: 8,
              released: true,
            },
            {
              activityId: 2,
              title: "Atividade 1",
              activityType: "ATIVIDADE",
              maxPoints: 8,
              score: null,
              released: false,
            },
          ],
        },
        {
          trimester: 2,
          trimesterMaxPoints: 33,
          totalReleasedScore: 20,
          allActivitiesReleased: true,
          eligibleForRecovery: true,
          activities: [
            {
              activityId: 3,
              title: "Trabalho 1",
              activityType: "TRABALHO",
              maxPoints: 20,
              score: 20,
              released: true,
            },
          ],
        },
        {
          trimester: 3,
          trimesterMaxPoints: 34,
          totalReleasedScore: 16,
          allActivitiesReleased: true,
          eligibleForRecovery: true,
          activities: [
            {
              activityId: 4,
              title: "Prova 3",
              activityType: "PROVA",
              maxPoints: 16,
              score: 16,
              released: true,
            },
          ],
        },
      ],
      recoveryRow: {
        trimesterRecoveryScores: [null, 75, null],
        yearRecoveryScore: null,
      },
    }).as("boletim");

    cy.visit("/boletim", {
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

    cy.wait("@boletim");
    cy.contains("Boletim").should("be.visible");
    cy.contains("1º Trimestre").should("be.visible");
    cy.contains("Recuperação (trimestres)").should("be.visible");
    cy.contains("Anual:").should("be.visible");
    cy.contains("Média mínima fixa:").should("be.visible");
  });
});
