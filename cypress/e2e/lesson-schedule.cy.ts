/// <reference types="cypress" />
import { createTestJwt } from "../support/testJwt";

function visit(path: string, role: "ADMIN" | "TEACHER") {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem("token", createTestJwt());
      win.localStorage.setItem(
        "user",
        JSON.stringify({
          id: 1,
          name: "Teste",
          email: "test@example.com",
          role,
        }),
      );
    },
  });
}
const pending = {
  slot: 0,
  disciplineId: 3,
  disciplineName: "Matemática",
  startTime: "07:00",
  endTime: "07:50",
  meetingId: null,
  content: "",
  attachments: [],
};

describe("Grade horária e registro diário", () => {
  beforeEach(() => {
    cy.intercept("**/api/**", []);
  });
  it("atribui uma disciplina ao intervalo e salva a revisão da grade", () => {
    cy.intercept("POST", "**/classes/search", [{ id: 1, name: "9º Ano A" }]);
    cy.intercept("GET", "**/classes/1", {
      id: 1,
      name: "9º Ano A",
      disciplines: [{ id: 3, name: "Matemática" }],
    });
    cy.intercept("GET", "**/classes/1/schedule", { revision: 4, slots: [] });
    cy.intercept("PUT", "**/classes/1/schedule", (req) => {
      expect(req.body).to.deep.equal({
        revision: 4,
        slots: [{ weekday: 1, slot: 0, disciplineId: 3 }],
      });
      req.reply({ ...req.body, revision: 5 });
    }).as("save");
    visit("/admin/grade-horaria", "ADMIN");
    cy.get(
      'button[aria-label="Segunda, 07:00 – 07:50: Adicionar disciplina"]',
    ).click();
    cy.get('select[aria-label="Disciplina do horário"]').select("3");
    cy.contains("button", "Salvar grade").click();
    cy.wait("@save");
    cy.contains("Grade salva com sucesso.").should("be.visible");
    cy.contains("09:30 – 09:45 · Intervalo").should("exist");
  });

  it("preserva o conteúdo após falha de upload e permite salvar novamente", () => {
    cy.viewport(390, 844);
    cy.intercept("GET", "**/teachers/me", {
      classes: [{ id: 1, name: "9º Ano A" }],
    });
    cy.intercept("GET", "**/classes/1/lesson-day?*", [pending]);
    cy.intercept("POST", "**/upload", {
      statusCode: 500,
      body: { error: "Falha de upload" },
    }).as("failedUpload");
    cy.intercept("PUT", "**/classes/1/lesson-day", (req) => {
      expect(req.body.content).to.equal("Frações e exercícios");
      expect(req.body.slot).to.equal(0);
      expect(req.body.attachments[0].name).to.equal("aula.pdf");
      req.reply({ id: 22 });
    }).as("record");
    visit("/aulas/new", "TEACHER");
    cy.get('textarea[aria-label="Conteúdo da aula"]').type(
      "Frações e exercícios",
    );
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("%PDF-test"),
        fileName: "aula.pdf",
        mimeType: "application/pdf",
      },
      { force: true },
    );
    cy.contains("button", "Salvar registro").click();
    cy.wait("@failedUpload");
    cy.contains('[data-testid="toast"]', "Falha de upload")
      .find("button")
      .click();
    cy.get("textarea").should("have.value", "Frações e exercícios");
    cy.intercept("POST", "**/upload", {
      path: "/api/files/lesson-files/1/aula.pdf",
    });
    cy.intercept("GET", "**/classes/1/lesson-day?*", [
      {
        ...pending,
        meetingId: 22,
        content: "Frações e exercícios",
        attachments: [
          { name: "aula.pdf", path: "/api/files/lesson-files/1/aula.pdf" },
        ],
      },
    ]);
    cy.contains("button", "Salvar registro").click();
    cy.wait("@record");
    cy.contains("Registrada").should("exist");
    cy.reload();
    cy.get("textarea").should("have.value", "Frações e exercícios");
    cy.document().then((doc) =>
      expect(doc.documentElement.scrollWidth).to.be.at.most(390),
    );
  });

  it("explica quando não há aulas disponíveis", () => {
    cy.intercept("GET", "**/teachers/me", {
      classes: [{ id: 1, name: "9º Ano A" }],
    });
    cy.intercept("GET", "**/classes/1/lesson-day?*", []);
    visit("/aulas/new", "TEACHER");
    cy.contains("Nenhuma aula disponível neste dia").should("be.visible");
    cy.contains("button", "Salvar registro").should("not.exist");
  });
});
