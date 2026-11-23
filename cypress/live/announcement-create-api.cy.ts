import { loginAs, logout } from "../support/live";

type FeedAnnouncement = {
  id: number;
  title: string;
  content: string | null;
  type: string;
};

describe("Announcement creation — real API", () => {
  it("atualiza o mural após receber uma notificação STOMP", () => {
    cy.on("window:before:load", (win) => {
      cy.spy(win.WebSocket.prototype, "send").as("enviarWebSocket");
    });
    loginAs("admin");
    cy.get("@enviarWebSocket", { timeout: 10000 }).should(
      "have.been.calledWithMatch",
      /^SUBSCRIBE\n/,
    );
    const title = `Aviso em tempo real ${Date.now()}`;
    cy.env(["apiBaseUrl"]).then(({ apiBaseUrl }) =>
      cy.window().then((win) => {
        const headers = {
          Authorization: `Bearer ${win.localStorage.getItem("token")}`,
        };
        cy.request<FeedAnnouncement>({
          method: "POST",
          url: `${apiBaseUrl}/announcements`,
          headers,
          body: { title, type: "TEXT" },
        }).then(({ body }) => {
          cy.contains("article", title, { timeout: 5000 }).should("be.visible");
          cy.request({
            method: "DELETE",
            url: `${apiBaseUrl}/announcements/${body.id}`,
            headers,
          });
        });
      }),
    );
  });

  it("logs in, creates text-only aviso via UI, verifies on GET /announcements/feed", () => {
    cy.viewport(1280, 800);
    const title = `E2E API ${Date.now()}`;
    const description =
      "Aviso criado pelo Cypress contra a API real (texto, sem imagem).";

    loginAs("teacher");
    cy.contains("button", "Criar aviso", { timeout: 20000 })
      .should("be.visible")
      .click();

    cy.get('[role="dialog"]').should("be.visible");
    cy.get("#announcementEditorTitle").should("be.visible").clear().type(title);
    cy.get("#announcementEditorContent")
      .should("be.visible")
      .clear()
      .type(description);
    cy.get('button[form="announcement-editor-form"]').click();

    cy.contains("Aviso criado com sucesso!", { timeout: 30000 }).should(
      "be.visible",
    );
    cy.get('[role="dialog"]', { timeout: 15000 }).should("not.exist");

    cy.contains(title).should("be.visible");
    cy.contains(description).should("be.visible");

    cy.contains("article", title).within(() => {
      cy.get('[title="Curtir"]').click();
      cy.get('[title="Descurtir"]').should("contain.text", "1");
      cy.get('[title="Comentários"]').click();
      cy.get('input[placeholder="Adicione um comentário..."]').type(
        "Recebido.",
      );
      cy.contains("button", "Publicar").click();
      cy.contains("li", "Recebido.").should("be.visible");
    });
    cy.reload();
    cy.contains("article", title).within(() => {
      cy.get('[title="Descurtir"]').should("contain.text", "1");
      cy.get('[title="Comentários"]').click();
      cy.contains("li", "Recebido.").should("be.visible");
    });

    cy.env(["apiBaseUrl"]).then(({ apiBaseUrl }) =>
      cy.window().then((win) => {
        const token = win.localStorage.getItem("token");
        cy.request<FeedAnnouncement[]>({
          url: `${apiBaseUrl}/announcements/feed`,
          headers: { Authorization: `Bearer ${token}` },
        }).then(({ body }) => {
          expect(body.find((item) => item.title === title)).to.include({
            content: description,
            type: "TEXT",
          });
        });
      }),
    );
    cy.env(["adminEmail", "adminPassword"]).then((credentials) => {
      if (!credentials.adminEmail || !credentials.adminPassword) return;
      logout();
      loginAs("admin");
      cy.contains("article", title)
        .find('[aria-label="Opções do aviso"]')
        .click();
      cy.contains('[role="menuitem"]', "Editar").click();
      cy.get("#announcementEditorContent")
        .clear()
        .type("Comunicado atualizado");
      cy.get('button[form="announcement-editor-form"]').click();
      cy.contains("article", title).should(
        "contain.text",
        "Comunicado atualizado",
      );
      cy.contains("article", title)
        .find('[aria-label="Opções do aviso"]')
        .click();
      cy.contains('[role="menuitem"]', "Excluir").click();
      cy.get('[role="dialog"]').contains("button", "Confirmar").click();
      cy.contains("Aviso excluído.").should("be.visible");
      cy.contains("article", title).should("not.exist");
    });
  });
});
