import { expectNotification } from "../support/notifications";
import { loginAs, logout, openPage } from "../support/live";

describe("From the weekly timetable to the student's report", () => {
  it("publishes a material, records attendance, saves grades and releases them to the class", () => {
    cy.viewport(1440, 900);
    const suffix = Date.now();
    const monday = new Date();
    monday.setDate(monday.getDate() + ((8 - monday.getDay()) % 7));
    const subject = `E2E Disciplina ${suffix}`;
    const material = `Leitura ${suffix}`;
    const activity = `Exercício ${suffix}`;
    loginAs("admin", "/admin/disciplines");
    cy.contains("button", "Nova disciplina").click();
    cy.get("#discipline-form input[placeholder]").type(subject);
    cy.contains("label", "Ana Clara Ferreira").find("input").check();
    cy.get('[role="dialog"]')
      .contains("button", /^Criar$/)
      .click();
    cy.contains("tr", subject)
      .should("contain.text", "Ana Clara Ferreira")
      .find('[title="Editar disciplina"]')
      .click();
    cy.get("#discipline-form textarea").type("Oficina da turma");
    cy.get('[role="dialog"]').contains("button", "Salvar").click();
    cy.contains("tr", subject).should("contain.text", "Oficina da turma");

    cy.reload();
    cy.contains("tr", subject).should("contain.text", "Oficina da turma");
    openPage("Turmas");
    cy.contains("tr", "Turma 01").find('[title="Editar"]').click();
    cy.get('form[aria-label="Vincular disciplina existente"]').within(() => {
      cy.get("select").select(subject);
      cy.contains("button", "Salvar vínculo")
        .scrollIntoView()
        .click({ scrollBehavior: "center" });
    });
    cy.contains("li", subject).should("exist");
    openPage("Grade horária");
    cy.get('select[aria-label="Turma"]').select("Turma 01");
    cy.get('button[aria-label^="Segunda, 07:00"]').click();
    cy.get('select[aria-label="Disciplina do horário"]').select(subject);
    cy.contains("button", "Salvar grade").click();
    expectNotification("Grade salva com sucesso.");

    // The academic cycle is managed through the API. Start it for the lesson fixture.
    cy.env(["apiBaseUrl"]).then(({ apiBaseUrl }) =>
      cy.window().then((win) => {
        const headers = {
          Authorization: `Bearer ${win.localStorage.getItem("token")}`,
        };
        const url = `${apiBaseUrl}/academic-cycle`;
        cy.request({ url, headers }).then(({ body }) => {
          if (body.status !== "IN_PROGRESS") {
            cy.request({
              url: url + "/start-year",
              method: "POST",
              headers,
              body: { yearEndDate: `${new Date().getFullYear() + 1}-12-31` },
            })
              .its("body.status")
              .should("eq", "IN_PROGRESS");
          }
        });
      }),
    );
    logout();
    loginAs("teacher", "/materiais");
    cy.get("main select").first().select("Turma 01 – 6º ano");
    cy.contains("button", "Novo material").click();
    cy.get("#material-form select").select(subject);
    cy.get("#material-form input[required]").type(material);
    cy.get('[role="dialog"]')
      .contains("button", /^Criar$/)
      .click();
    cy.contains("main", material).should("be.visible");

    openPage("Aulas");
    cy.contains("button", "Registrar aula").click();
    cy.get('input[aria-label="Data da aula"]')
      .clear()
      .type(monday.toLocaleDateString("pt-BR").replace(/\//g, ""));
    cy.get('select[aria-label="Turma"]').select("Turma 01");
    cy.get('textarea[aria-label="Conteúdo da aula"]').clear().type(material);
    cy.contains("button", "Salvar registro").click();
    cy.contains("a", "Ver aula e chamada").click();
    cy.contains("main", material).should("be.visible");
    cy.location("pathname").as("lessonPath", { type: "static" });
    cy.contains("li", "Alice Almeida").find('[title="Marcar falta"]').click();
    cy.contains("li", "Alice Almeida").should("contain.text", "FALTOU");
    cy.contains("button", "Nova atividade").click();
    cy.get("#activity-form input[maxlength]").type(activity);
    cy.get('[name="maxPoints"]').type("10");
    cy.contains("#activity-form", "Período: 1º trimestre").should("be.visible");
    cy.get('[role="dialog"]')
      .contains("button", /^Criar$/)
      .click();
    cy.contains("a", activity).click();
    cy.contains("tr", "Alice Almeida").find("input").type("8.5");
    cy.contains("button", /^Salvar$/).click();
    expectNotification("Notas salvas com sucesso.");
    cy.location("pathname").as("gradebookPath", { type: "static" });

    logout();
    loginAs("student");
    cy.contains("li", material).should("be.visible");
    cy.contains("li", activity).should("be.visible");
    openPage("Faltas");
    cy.contains("tr", subject).should("contain.text", "1");
    openPage("Boletim");
    cy.contains("tr", "1º Trimestre").should(
      "contain.text",
      "pendente liberação",
    );
    cy.contains("td", /^8\.50$/).should("not.exist");
    logout();
    cy.get<string>("@gradebookPath").then((path) => loginAs("teacher", path));
    cy.contains("tr", "Alice Almeida")
      .find("input")
      .should("have.value", "8.5");
    cy.contains("button", "Liberar notas").click();
    cy.get('[role="dialog"]')
      .contains("button", /^Liberar$/)
      .click();
    cy.contains("tr", "Alice Almeida").find("input").should("be.disabled");
    logout();
    loginAs("student", "/boletim");
    cy.contains("tr", "1º Trimestre")
      .contains("td", /^8\.50$/)
      .should("be.visible");
    logout();
    cy.get<string>("@lessonPath").then((path) => loginAs("admin", path));
    cy.contains("li", "Alice Almeida").find('[title="Ver detalhes"]').click();
    cy.contains("main h2", "Alice Almeida").should("be.visible");
    cy.get<string>("@lessonPath").then((path) => cy.visit(path));
    cy.get('button[title="Ver detalhes do professor"]').click();
    cy.contains("main h2", "Ana Clara Ferreira").should("be.visible");
    cy.get<string>("@lessonPath").then((path) => cy.visit(path));
    cy.get('main button[title="Excluir"]').first().click();
    cy.get('[role="dialog"]')
      .contains("button", /^Excluir$/)
      .click();
    expectNotification("Não é possível excluir uma aula com notas liberadas.");
    cy.get<string>("@lessonPath").then((path) =>
      cy.location("pathname").should("eq", path),
    );
    cy.get('[role="dialog"]').contains("button", "Cancelar").click();
    logout();
    loginAs("teacher", "/materiais");
    cy.get("main select").first().select("Turma 01 – 6º ano");
    cy.contains("span", material)
      .parent()
      .siblings('button[title="Excluir material"]')
      .click();
    cy.get('[role="dialog"]').contains("button", "Confirmar").click();
    expectNotification("Material excluído.");
    cy.intercept("GET", "**/api/materials?classId=*").as(
      "materialsAfterDelete",
    );
    cy.reload();
    cy.get("main select").first().select("Turma 01 – 6º ano");
    cy.wait("@materialsAfterDelete")
      .its("response.statusCode")
      .should("eq", 200);
    cy.contains("main span", material).should("not.exist");
  });
});
