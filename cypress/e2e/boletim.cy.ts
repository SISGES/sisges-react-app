/// <reference types="cypress" />

import { createTestJwt } from "../support/testJwt";

function visitarBoletim() {
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
}

describe("Boletim do aluno", () => {
  it("exibe trimestres e recuperações e mantém em branco as notas ainda não liberadas", () => {
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

    visitarBoletim();

    cy.wait("@boletim");
    cy.contains("h1", "Boletim").should("be.visible");
    cy.contains("tr", "1º Trimestre").within(() => {
      cy.get("td").eq(1).should("have.text", "8");
      cy.get("td").eq(2).should("have.text", "");
    });
    cy.contains("Recuperação (trimestres)").should("be.visible");
    cy.contains("Anual:").scrollIntoView().should("be.visible");
    cy.contains("Percentual mínimo de aprovação no ano:").should("be.visible");
    cy.get("#report-cycle").should("not.exist");
  });
  it("consulta o resultado de um ciclo encerrado e volta ao vigente", () => {
    const atual = {
      cycleId: 2,
      availableCycles: [
        {
          id: 2,
          yearStartDate: "2026-02-02",
          yearEndDate: "2026-12-15",
          status: "IN_PROGRESS",
        },
        {
          id: 1,
          yearStartDate: null,
          yearEndDate: "2025-12-15",
          status: "FINISHED",
        },
      ],
      yearResult: null,
      fixedApprovalPercentage: 65,
      yearMaxPoints: 100,
      totalReleasedScore: 0,
      eligibleForYearRecovery: false,
      trimesters: [
        {
          trimester: 1,
          trimesterMaxPoints: 30,
          totalReleasedScore: 0,
          allActivitiesReleased: false,
          eligibleForRecovery: false,
          activities: [],
        },
      ],
      recoveryRow: {
        trimesterRecoveryScores: [null, null, null],
        yearRecoveryScore: null,
      },
    };
    cy.intercept("GET", "**/boletim/me", { body: atual });
    cy.intercept("GET", "**/boletim/me?cycleId=1", {
      body: {
        ...atual,
        cycleId: 1,
        yearResult: {
          baseScore: 65,
          finalScore: 70,
          approved: true,
          promoted: true,
        },
      },
    }).as("anterior");
    cy.intercept("GET", "**/boletim/me?cycleId=2", { body: atual }).as(
      "vigente",
    );
    visitarBoletim();
    cy.get("#report-cycle").select("1");
    cy.wait("@anterior");
    cy.get("section[aria-label='Resultado anual']")
      .should("contain", "Aprovado")
      .and("contain", "Promovido")
      .and("contain", "Pontuação final: 70");
    cy.get("#report-cycle").select("2");
    cy.wait("@vigente");
    cy.get("section[aria-label='Resultado anual']").should("not.exist");
  });
});
