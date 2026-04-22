/// <reference types="cypress" />

import { createTestJwt } from '../support/testJwt'

function sampleAnnouncement() {
  return {
    id: 42,
    title: 'Aviso de teste Cypress',
    content: 'Conteúdo do aviso para o feed.',
    type: 'TEXT' as const,
    imagePath: null,
    targetRoles: ['STUDENT', 'TEACHER', 'ADMIN'],
    activeFrom: null,
    activeUntil: null,
    createdAt: new Date().toISOString(),
    likeCount: 2,
    likedByCurrentUser: false,
    commentCount: 1,
  }
}

describe('Homepage — AVISOS (announcement feed)', () => {
  it('redirects unauthenticated users to login', () => {
    cy.visit('/')
    cy.location('pathname').should('eq', '/login')
  })

  it('highlights AVISOS in the sidebar on the home route', () => {
    cy.intercept('GET', '**/announcements/feed', []).as('feed')
    cy.visitHomeAuthenticated()
    cy.wait('@feed')
    cy.get('nav a[aria-current="page"]').should('contain.text', 'AVISOS')
  })

  it('shows the teacher toolbar with Avisos heading and create button', () => {
    cy.intercept('GET', '**/announcements/feed', []).as('feed')
    cy.visitHomeAuthenticated()
    cy.wait('@feed')
    cy.get('h2').contains('Avisos').should('be.visible')
    cy.contains('button', 'Criar aviso').should('be.visible')
  })

  it('shows empty state when the feed has no announcements', () => {
    cy.intercept('GET', '**/announcements/feed', []).as('feed')
    cy.visitHomeAuthenticated()
    cy.wait('@feed')
    cy.contains('Nenhum aviso no momento.').should('be.visible')
  })

  it('renders announcement cards when the feed returns items', () => {
    const ann = sampleAnnouncement()
    cy.intercept('GET', '**/announcements/feed', [ann]).as('feed')
    cy.visitHomeAuthenticated()
    cy.wait('@feed')
    cy.contains('h2', 'Avisos').should('be.visible')
    cy.get('article').should('have.length', 1)
    cy.contains(ann.title).should('be.visible')
    cy.contains(ann.content!).should('be.visible')
    cy.get('article').find('button[title="Curtir"]').should('be.visible')
    cy.get('article').find('button[title="Comentários"]').should('be.visible')
  })

  it('shows server error and recovers after Tentar novamente', () => {
    let calls = 0
    cy.intercept('GET', '**/announcements/feed', (req) => {
      calls += 1
      // React StrictMode runs effects twice in dev — both initial loads must fail or the second [] wins.
      if (calls <= 2) {
        req.reply({ statusCode: 500, body: '' })
      } else {
        req.reply([])
      }
    }).as('feed')

    cy.visitHomeAuthenticated()
    cy.wait(['@feed', '@feed'])
    cy.contains('Erro interno do servidor').should('be.visible')
    cy.contains('button', 'Tentar novamente').click({ force: true })
    cy.wait('@feed')
    cy.contains('Nenhum aviso no momento.').should('be.visible')
  })

  it('student home shows empty avisos and stubs sidebar API calls', () => {
    cy.intercept('GET', '**/announcements/feed', []).as('feed')
    cy.intercept('GET', '**/materials**', []).as('materials')
    cy.intercept('GET', '**/activities/my', []).as('activities')

    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', createTestJwt())
        win.localStorage.setItem(
          'user',
          JSON.stringify({
            id: 9,
            name: 'Aluno Cypress',
            email: 'student-cypress@test.local',
            register: 'STU1',
            role: 'STUDENT',
          }),
        )
      },
    })

    cy.wait('@feed')
    cy.wait('@materials')
    cy.wait('@activities')
    cy.contains('Nenhum aviso no momento.').should('be.visible')
    cy.contains('button', 'Criar aviso').should('not.exist')
  })
})
