import { createTestJwt } from "../support/testJwt";

describe("Lessons recorded before weekly timetables", () => {
  it("preserves attendance for namesakes and updates the lesson through the edit screen", () => {
    const schoolClass = { id: 5, name: "Turma A", academicYear: "6º ano" };
    const meeting = {
      id: 83,
      disciplineId: 7,
      date: "2026-05-04",
      startTime: "08:00",
      endTime: "08:50",
      classInfo: {
        ...schoolClass,
        students: [
          { id: 21, userId: 61, name: "Alex Silva", present: true },
          { id: 22, userId: 62, name: "Alex Silva", present: false },
        ],
      },
      teacher: {
        id: 3,
        userId: 19,
        name: "Professor",
        email: "teacher@example.test",
      },
    };
    cy.intercept("GET", "**/teachers/me", { classes: [schoolClass] });
    cy.intercept("GET", "**/classes/5", {
      ...schoolClass,
      disciplines: [{ id: 7, name: "Artes" }],
    });
    cy.intercept("GET", "**/class/83", (req) => req.reply(meeting));
    cy.intercept("GET", "**/activities/meeting/83", []);
    cy.intercept("POST", "**/class/search", []);
    cy.intercept("POST", "**/class/83/frequency", (req) => {
      expect(req.body.entries).to.deep.equal([
        { studentId: 21, status: "P" },
        { studentId: 22, status: "F" },
      ]);
      req.reply({ statusCode: 204 });
    }).as("attendance");
    cy.intercept("PUT", "**/class/update/83", (req) => {
      expect(req.body).to.deep.equal({
        classId: 5,
        disciplineId: 7,
        date: "2026-05-04",
        startTime: "08:00",
        endTime: "09:50",
      });
      meeting.endTime = req.body.endTime;
      req.reply(meeting);
    }).as("update");
    cy.visit("/aulas/83", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", createTestJwt());
        win.localStorage.setItem(
          "user",
          JSON.stringify({ id: 19, name: "Professor", role: "TEACHER" }),
        );
      },
    });
    cy.get('main button[title="Editar"]').click();
    cy.contains("button", "Lançar Frequência").click();
    cy.get('[role="dialog"]').within(() => {
      cy.get('input[name="freq-21"]').first().should("be.checked");
      cy.get('input[name="freq-22"]').last().should("be.checked");
      cy.contains("button", /^Salvar$/).click();
    });
    cy.wait("@attendance");
    cy.contains("select", "Artes").should("have.value", "7");
    cy.contains("select", "Turma A").should("have.value", "5");
    cy.get('select[aria-label^="Fim da aula: hora"]').select("09");
    cy.get("main form").contains("button", "Salvar").click();
    cy.wait("@update");
    cy.location("pathname").should("eq", "/aulas/83");
    cy.contains("h1", "Detalhes da Aula").should("be.visible");
  });
});
