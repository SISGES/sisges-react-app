/// <reference types="cypress" />

import { createTestJwt } from "../support/testJwt";

const initialCycle = {
  id: 11,
  status: "NOT_STARTED",
  gradingLocked: false,
  currentTrimester: 1,
  yearStartDate: null,
  yearEndDate: null,
  yearStartedAt: null,
  yearFinishedAt: null,
};
const endYear = new Date().getFullYear() + 1;
const inProgress = {
  ...initialCycle,
  status: "IN_PROGRESS",
  gradingLocked: true,
  yearStartDate: `${endYear - 1}-02-01`,
  yearEndDate: `${endYear}-12-15`,
};

function visitPage(cycle: typeof initialCycle | typeof inProgress) {
  cy.intercept("GET", "**/academic-cycle", { body: cycle });
  cy.intercept("GET", "**/grading-config", {
    body: {
      yearMaxPoints: 90,
      yearMinPercentage: 70,
      ...Object.fromEntries(
        [1, 2, 3].flatMap((n) => [
          [`trimester${n}MaxPoints`, 30],
          [`trimester${n}MinPercentage`, 70],
          [`trimester${n}PointsProvas`, 10],
          [`trimester${n}PointsTrabalhos`, 10],
          [`trimester${n}PointsAtividades`, 10],
        ]),
      ),
    },
  });
  cy.visit("/admin/notas", {
    onBeforeLoad(win) {
      win.localStorage.setItem("token", createTestJwt());
      win.localStorage.setItem(
        "user",
        JSON.stringify({
          id: 1,
          name: "Gestão escolar",
          email: "admin@test.local",
          register: "ADM001",
          role: "ADMIN",
        }),
      );
    },
  });
}

describe("Ciclo letivo na configuração de notas", () => {
  it("inicia o ano com data futura e bloqueia a edição das regras", () => {
    visitPage(initialCycle);
    cy.intercept("POST", "**/academic-cycle/start-year", {
      body: inProgress,
    }).as("start");
    cy.contains("button", "Iniciar ano letivo").click();
    cy.get("[role=dialog]").within(() => {
      cy.contains("button", "Iniciar ano letivo").should("be.disabled");
      cy.get("#cycle-end-date").type(`1512${endYear}`);
      cy.contains("button", "Iniciar ano letivo").click();
    });
    cy.wait("@start")
      .its("request.body")
      .should("deep.equal", {
        yearEndDate: `${endYear}-12-15`,
        expectedCycleId: 11,
      });
    cy.contains("Em andamento · 1º trimestre").should("be.visible");
    cy.get("#yearMax").should("be.disabled");
  });

  it("reconsulta as pendências do trimestre e confirma a passagem com senha", () => {
    visitPage(inProgress);
    cy.intercept("GET", "**/pending-releases?trimester=1", {
      body: { trimester: 1, teachers: ["Professora Ana"] },
    }).as("pending");
    cy.contains("button", "Encerrar trimestre").click();
    cy.wait("@pending");
    cy.get("[role=dialog]").within(() => {
      cy.contains("Professora Ana").should("be.visible");
      cy.get("#cycle-password").should("be.disabled");
      cy.contains("button", "Encerrar trimestre").should("be.disabled");
    });
    cy.intercept("GET", "**/pending-releases?trimester=1", {
      body: { trimester: 1, teachers: [] },
    });
    cy.intercept("POST", "**/academic-cycle/end-trimester", {
      body: { ...inProgress, currentTrimester: 2 },
    }).as("next");
    cy.get("[role=dialog]").within(() => {
      cy.contains("button", "Atualizar pendências").click();
      cy.get("#cycle-password").type("senha-de-teste", { log: false });
      cy.contains("button", "Encerrar trimestre").click();
    });
    cy.wait("@next").its("request.body").should("deep.equal", {
      password: "senha-de-teste",
      expectedCycleId: 11,
      expectedTrimester: 1,
    });
    cy.contains("Em andamento · 2º trimestre").should("be.visible");
  });

  it("mantém o ano em andamento após erro e libera as regras no encerramento confirmado", () => {
    visitPage({ ...inProgress, currentTrimester: 3 });
    cy.intercept("GET", "**/academic-cycle/pending-releases", {
      body: { trimester: null, teachers: [] },
    }).as("all");
    cy.contains("button", "Encerrar trimestre").should("not.exist");
    cy.contains("button", "Encerrar ano letivo").click();
    cy.wait("@all");
    cy.intercept("POST", "**/academic-cycle/end-year", {
      statusCode: 400,
      body: {
        status: 400,
        code: "BUSINESS_RULE_VIOLATION",
        message: "Senha inválida.",
      },
    });
    cy.get("[role=dialog]").within(() => {
      cy.get("#cycle-password").type("senha-incorreta", { log: false });
      cy.contains("button", "Encerrar ano letivo").click();
      cy.get("[role=alert]").should("contain", "Senha inválida");
    });
    cy.intercept("POST", "**/academic-cycle/end-year", {
      body: {
        ...inProgress,
        status: "FINISHED",
        gradingLocked: false,
        currentTrimester: 3,
      },
    }).as("finish");
    cy.get("[role=dialog]").within(() => {
      cy.get("#cycle-password").clear().type("senha-correta", { log: false });
      cy.contains("button", "Encerrar ano letivo").click();
    });
    cy.wait("@finish").its("request.body").should("deep.equal", {
      password: "senha-correta",
      expectedCycleId: 11,
      expectedTrimester: 3,
    });
    cy.contains("Encerrado").should("be.visible");
    cy.get("#yearMax").should("be.enabled");
  });
});

describe("Período das atividades avaliativas", () => {
  it("usa o trimestre vigente e omite o trimestre na recuperação anual", () => {
    cy.intercept("GET", "**/class/7", {
      body: {
        id: 7,
        date: "2026-08-10",
        startTime: "07:00:00",
        endTime: "07:50:00",
        classInfo: {
          id: 2,
          name: "Turma B",
          academicYear: "7º ano",
          students: [],
        },
      },
    });
    cy.intercept("GET", "**/activities/meeting/7", []);
    cy.intercept("GET", "**/academic-cycle", {
      body: { ...inProgress, currentTrimester: 2 },
    });
    cy.intercept("POST", "**/api/activities", {
      statusCode: 201,
      body: { id: 21 },
    }).as("criar");
    cy.visit("/aulas/7", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", createTestJwt());
        win.localStorage.setItem(
          "user",
          JSON.stringify({
            id: 1,
            name: "Professor",
            email: "p@test.local",
            register: "P001",
            role: "TEACHER",
          }),
        );
      },
    });
    for (const tipo of ["PROVA", "RECUPERACAO_ANUAL"]) {
      cy.contains("button", "Nova atividade").click();
      cy.get("[role=dialog]").within(() => {
        cy.contains("Período: 2º trimestre").should("be.visible");
        cy.get("#activity-form input").first().type("Avaliação da turma");
        cy.get("input[name=maxPoints]").type("10");
        cy.get("select[name=activityType]").select(tipo);
        if (tipo === "RECUPERACAO_ANUAL")
          cy.contains("Período:").should("not.exist");
        cy.contains("button", "Criar").click();
      });
      cy.wait("@criar").then(({ request }) => {
        expect(request.body.activityType).to.equal(tipo);
        if (tipo === "PROVA") expect(request.body.trimesterNumber).to.equal(2);
        else expect(request.body).not.to.have.property("trimesterNumber");
      });
      cy.get("[role=dialog]").should("not.exist");
      cy.contains('[data-testid="toast"]', "Atividade criada")
        .find('button[aria-label="Fechar notificação"]')
        .click();
    }
  });
});
