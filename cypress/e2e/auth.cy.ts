/// <reference types="cypress" />

describe("Autenticação", () => {
  it("redireciona usuário autenticado de /login para /", () => {
    cy.visitHomeAuthenticated();
    cy.visit("/login");
    cy.location("pathname").should("eq", "/");
  });

  it("exibe erro com credenciais inválidas", () => {
    cy.intercept("POST", "**/auth/login", {
      statusCode: 401,
      body: {
        code: "AUTH_INVALID_CREDENTIALS",
        message: "E-mail ou senha inválidos",
      },
    }).as("login");

    cy.visit("/login");
    cy.get("#email").type("invalido@test.local");
    cy.get("#password").type("senhaerrada", { log: false });
    cy.contains("button", "Entrar").click();
    cy.wait("@login");
    cy.contains("E-mail ou senha inválidos").should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });

  it("faz login com sucesso e redireciona para home", () => {
    cy.intercept("POST", "**/auth/login", {
      statusCode: 200,
      body: {
        accessToken: "fake-jwt",
        tokenType: "Bearer",
        user: {
          id: 1,
          name: "Professor Cypress",
          email: "teacher-cypress@test.local",
          register: "TCH001",
          role: "TEACHER",
        },
      },
    }).as("login");
    cy.intercept("GET", "**/announcements/feed", []).as("feed");

    cy.visit("/login");
    cy.get("#email").type("teacher-cypress@test.local");
    cy.get("#password").type("professor123", { log: false });
    cy.contains("button", "Entrar").click();
    cy.wait("@login");
    cy.location("pathname").should("eq", "/");
    cy.wait("@feed");
    cy.contains("button", "Criar aviso").should("be.visible");
  });

  it("faz logout e volta para login", () => {
    cy.viewport(1280, 800);
    cy.intercept("GET", "**/announcements/feed", []).as("feed");
    cy.visitHomeAuthenticated();
    cy.wait("@feed");
    cy.get('aside.lg\\:flex [aria-label="Sair"]').click();
    cy.location("pathname").should("eq", "/login");
  });
});
