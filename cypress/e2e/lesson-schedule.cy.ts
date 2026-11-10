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

describe("Rascunhos da grade horária", () => {
  beforeEach(() => {
    cy.viewport(1440, 1000);
    cy.intercept("**/api/**", []);
    cy.intercept("POST", "**/classes/search", [
      { id: 1, name: "Turma A" },
      { id: 2, name: "Turma B" },
    ]);
    for (const id of [1, 2]) {
      cy.intercept("GET", `**/classes/${id}`, {
        id,
        disciplines: [
          { id: 3, name: "Matemática" },
          { id: 4, name: "Português" },
        ],
      });
      cy.intercept("GET", `**/classes/${id}/schedule`, {
        revision: 4,
        slots: [{ weekday: 1, slot: 0, disciplineId: 4 }],
      });
    }
    visit("/admin/grade-horaria", "ADMIN");
  });
  function edit() {
    cy.get('button[aria-label="Segunda, 07:00 – 07:50: Português"]').click();
    cy.get('select[aria-label="Disciplina do horário"]').select("3");
  }
  function warning(expected: boolean) {
    cy.window().should((win) => {
      const event = new win.Event("beforeunload", { cancelable: true });
      win.dispatchEvent(event);
      expect(event.defaultPrevented).to.equal(expected);
    });
  }
  function math() {
    cy.get('button[aria-label="Segunda, 07:00 – 07:50: Matemática"]').should(
      "exist",
    );
  }
  function reset() {
    cy.contains("button", "Redefinir").click();
    cy.get('[role="dialog"]').contains("button", "Redefinir").click();
  }
  it("mantém rascunhos por turma ao navegar e só redefine após confirmação", () => {
    edit();
    cy.get('select[aria-label="Turma"]').select("2");
    edit();
    cy.get('a[href="/aulas"]').first().click();
    warning(true);
    cy.get('a[href="/admin/grade-horaria"]').first().click();
    cy.get('select[aria-label="Turma"]').should("have.value", "2");
    math();
    cy.contains("button", "Redefinir").click();
    cy.get('[role="dialog"]').contains("button", "Cancelar").click();
    math();
    reset();
    cy.get('button[aria-label="Segunda, 07:00 – 07:50: Português"]').should(
      "exist",
    );
    warning(true); // The other class still has a draft.
    cy.get('select[aria-label="Turma"]').select("1");
    math();
    reset();
    warning(false);
  });
  it("retém alterações após erro e limpa o rascunho somente após salvar", () => {
    edit();
    cy.intercept("PUT", "**/classes/1/schedule", {
      statusCode: 500,
      body: { message: "Erro ao salvar" },
    }).as("failed");
    cy.contains("button", "Salvar grade").click();
    cy.wait("@failed");
    warning(true);
    cy.get('[data-testid="toast"]')
      .contains("Erro ao salvar")
      .parent()
      .find("button")
      .click();
    cy.get('a[href="/aulas"]').first().click();
    cy.get('a[href="/admin/grade-horaria"]').first().click();
    math();
    cy.intercept("PUT", "**/classes/1/schedule", (req) =>
      req.reply({ ...req.body, revision: 5 }),
    ).as("saved");
    cy.contains("button", "Salvar grade").click();
    cy.wait("@saved");
    warning(false);
  });
  it("descarta rascunhos ao atualizar a página", () => {
    edit();
    warning(true);
    cy.reload();
    cy.get('button[aria-label="Segunda, 07:00 – 07:50: Português"]').should(
      "exist",
    );
    warning(false);
  });
  it("limpa os rascunhos e o aviso de atualização no logout", () => {
    edit();
    warning(true);
    cy.get('button[aria-label="Sair"]').filter(":visible").click();
    cy.location("pathname").should("eq", "/login");
    warning(false);
    cy.intercept("POST", "**/auth/login", {
      accessToken: createTestJwt(),
      user: { id: 1, name: "Teste", email: "test@example.com", role: "ADMIN" },
    });
    cy.get('input[type="email"]').type("test@example.com");
    cy.get('input[type="password"]').type("password123");
    cy.contains("button", "Entrar").click();
    cy.get('a[href="/admin/grade-horaria"]').first().click();
    cy.get('button[aria-label="Segunda, 07:00 – 07:50: Português"]').should(
      "exist",
    );
    warning(false);
  });
});
