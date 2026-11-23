describe("Admin event management", () => {
  it("creates a class event, opens its details and confirms deletion", () => {
    const title = "Reunião de turma";
    const description = "Encontro com as famílias";
    const event = {
      id: 31,
      title,
      description,
      audience: "CLASS",
      classId: 4,
      className: "Turma 04",
      eventAt: new Date("2026-06-16T15:30").toISOString(),
      createdAt: "2026-06-01T12:00:00Z",
    };
    let events: (typeof event)[] = [];
    cy.viewport(1280, 800);
    cy.clock(Date.parse("2026-06-01T12:00:00Z"), ["Date"]);
    cy.intercept("GET", "**/announcements/feed", []);
    cy.intercept("POST", "**/classes/search", [{ id: 4, name: "Turma 04" }]);
    cy.intercept("GET", "**/events?includePast=true", (req) =>
      req.reply(events),
    );
    cy.intercept("POST", "**/events", (req) => {
      expect(req.body).to.deep.equal({
        title,
        description,
        audience: "CLASS",
        classId: 4,
        eventAt: event.eventAt,
      });
      events = [event];
      req.reply({ statusCode: 201, body: event });
    }).as("createEvent");
    cy.intercept("DELETE", "**/events/31", (req) => {
      events = [];
      req.reply({ statusCode: 204 });
    }).as("deleteEvent");
    cy.visitHomeAuthenticated({
      id: 1,
      name: "Admin",
      email: "admin@example.test",
      register: "ADM1",
      role: "ADMIN",
    });
    cy.get('nav[aria-label="Páginas"]:visible')
      .contains("a", "Eventos")
      .click();
    cy.contains("main h1", "Eventos").should("be.visible");
    cy.get('[aria-label="Criar evento"]').click();
    cy.get("#event-form").within(() => {
      cy.get('[placeholder="Título"]').type(title);
      cy.get("textarea").type(description);
      cy.get('[aria-label="Data do evento"]').type("16062026");
      cy.get('select[aria-label^="Horário do evento: hora"]').select("15");
      cy.get('select[aria-label^="Horário do evento: minuto"]').select("30");
      cy.contains("select", "Uma turma").select("CLASS");
      cy.contains("select", "Selecione a turma").select("4");
    });
    cy.get('button[form="event-form"]').click();
    cy.wait("@createEvent");
    cy.contains("button", title).click();
    cy.get('[role="dialog"]')
      .should("contain.text", description)
      .and("contain.text", "Turma 04")
      .contains("button", "Excluir")
      .click();
    cy.contains('[role="dialog"]', "Excluir este evento?")
      .contains("button", "Confirmar")
      .click();
    cy.wait("@deleteEvent");
    cy.contains("Nenhum evento agendado.").should("be.visible");
  });
});
