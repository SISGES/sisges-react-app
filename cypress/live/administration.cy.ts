import { loginAs, logout, openPage } from "../support/live";

describe("School administration against the seeded API", () => {
  beforeEach(() => cy.viewport(1440, 900));

  it("creates a class, links a discipline, reloads its roster and deletes it", () => {
    const name = `E2E Turma ${Date.now()}`;
    loginAs("admin", "/admin/classes");
    cy.contains("button", "Nova turma").click();
    cy.get("#class-form input").type(name);
    cy.get("#class-form select").select("7º ano");
    cy.contains("button", "Criar Turma").click();
    cy.contains(
      '[data-testid="toast"]',
      `Turma "${name}" criada com sucesso!`,
    ).should("have.css", "pointer-events", "none");
    cy.contains("tr", name).find('[title="Editar"]').click();
    cy.contains("h1", "Editar Turma").should("be.visible");
    cy.get('form[aria-label="Vincular disciplina existente"]').within(() => {
      cy.get("select").select("Matemática");
      cy.contains("button", "Salvar vínculo").click();
    });
    cy.contains("li", "Matemática").should("be.visible");
    cy.reload();
    cy.contains("li", "Matemática").should("be.visible");
    openPage("Turmas");
    cy.contains("tr", name).find('[title="Excluir"]').click();
    cy.get('[role="dialog"]').contains("button", "Cancelar").click();
    cy.contains("tr", name).find('[title="Excluir"]').click();
    cy.get('[role="dialog"]')
      .contains("button", /^Excluir$/)
      .click();
    cy.contains("Turma excluída.").should("be.visible");
    cy.contains("tr", name).should("not.exist");
  });

  it("validates the annual points total and persists a grading configuration change", () => {
    loginAs("admin", "/admin/notas");
    cy.get("#yearMax").should("have.value", "100").clear().type("101");
    cy.contains("button", "Salvar configuração").should("be.disabled");
    cy.get("#yearMax").clear().type("100");
    cy.get("#yearMin").clear().type("65");
    cy.contains("button", "Salvar configuração").click();
    cy.contains("Configuração de notas salva com sucesso.").should(
      "be.visible",
    );
    cy.reload();
    cy.get("#yearMin").should("have.value", "65");
  });

  for (const person of [
    { list: "Alunos", action: "Novo aluno", guardian: "new" },
    { list: "Alunos", action: "Novo aluno", guardian: "existing" },
    { list: "Professores", action: "Novo professor", guardian: "" },
  ]) {
    it(`registers a member from ${person.list} and authenticates the new account${person.guardian ? " with " + person.guardian + " guardian" : ""}`, () => {
      const name = `AAA E2E ${person.list} ${Date.now()}`;
      const password = "Escola123!";
      loginAs("admin");
      openPage(person.list);
      cy.contains("button", person.action).click();
      cy.get('input[placeholder="Nome completo"]').first().type(name);
      cy.get('input[type="password"]').type(password, { log: false });
      cy.contains("select", "Masculino").select("Outro");
      cy.get('input[aria-label="Data de nascimento"]').type("02032010");
      if (person.guardian) {
        cy.contains("select", "Turma 01").select("Turma 01 (6º ano)");
        if (person.guardian === "existing") {
          cy.contains("button", "Responsável existente").click();
          cy.contains("select", "Selecione um responsável").select(
            "Adriana Almeida - adriana.almeida001@sisges.local",
          );
        } else {
          cy.get('input[placeholder="Nome completo"]')
            .last()
            .type("Responsável E2E");
          cy.get('input[placeholder="(31) 97215-2822"]')
            .first()
            .type("31987654321");
          cy.get('input[placeholder="responsavel@email.com"]').type(
            "family@example.test",
          );
        }
      }
      cy.contains("button", "Cadastrar Usuário").click();
      cy.contains(`Usuário "${name}" cadastrado`).should("be.visible");
      openPage(person.list);
      cy.contains("tr", name)
        .children("td")
        .eq(1)
        .invoke("text")
        .then((email) => {
          cy.contains("tr", name).find('[title="Ver detalhes"]').click();
          cy.contains("main h2", name).should("be.visible");
          cy.contains("main", email).should("be.visible");
          logout();
          cy.get("#email").type(email);
          cy.get("#password").type(password, { log: false });
          cy.contains("button", "Entrar").click();
          cy.get('button[aria-label="Abrir minha conta"]:visible').click();
          cy.contains("main", email).should("be.visible");
          if (person.guardian) {
            cy.get("main form input").should("be.disabled");
            openPage("Minha turma");
            cy.contains("main", "Turma 01").should("be.visible");
          } else {
            cy.contains("label", "Nome")
              .find("input")
              .clear()
              .type(name + " Silva");
            const newPassword = "NovaSenha123!";
            cy.contains("label", "Nova senha")
              .find("input")
              .type(newPassword, { log: false });
            cy.contains("label", "Senha atual")
              .find("input")
              .type(password, { log: false });
            cy.contains("button", "Salvar alterações").click();
            cy.contains("Perfil atualizado.").should("be.visible");
            cy.reload();
            cy.contains("label", "Nome")
              .find("input")
              .should("have.value", name + " Silva");
            logout();
            cy.get("#email").type(email);
            cy.get("#password").type(password, { log: false });
            cy.contains("button", "Entrar").click();
            cy.contains("E-mail ou senha inválidos").should("be.visible");
            cy.get("#password").clear().type(newPassword, { log: false });
            cy.contains("button", "Entrar").click();
            cy.get('button[aria-label="Abrir minha conta"]:visible').should(
              "contain.text",
              name + " Silva",
            );
          }
        });
    });
  }
});
