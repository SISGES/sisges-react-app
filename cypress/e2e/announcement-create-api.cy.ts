/// <reference types="cypress" />

/**
 * End-to-end against a running Spring Boot API (no cy.intercept on app traffic).
 *
 * Prerequisites:
 * - Run Flyway so `V16__cypress_e2e_users.sql` inserts `cypress-e2e-teacher@sisges.local` and
 *   `cypress-e2e-admin@sisges.local` (passwords professor123 / admin123).
 * - Copy `cypress/cypress.env.example.json` → `cypress/cypress.env.json` (gitignored) and adjust `apiBaseUrl` if needed.
 * - Frontend: `VITE_API_BASE_URL` must match `apiBaseUrl` in that file, e.g.
 *   `VITE_API_BASE_URL=http://localhost:8080/api npm run dev`
 *
 * Omit `adminEmail` / `adminPassword` in `cypress.env.json` to skip DELETE cleanup after the test.
 */

type FeedAnnouncement = {
  id: number
  title: string
  content: string | null
  type: string
}

function requireTeacherCreds(): { email: string; password: string } {
  const email = (Cypress.env('teacherEmail') as string | undefined)?.trim()
  const password = Cypress.env('teacherPassword') as string | undefined
  if (!email || !password) {
    throw new Error(
      'Set teacherEmail and teacherPassword in cypress/cypress.env.json (copy from cypress.env.example.json). Run DB migration V16 for Cypress users.',
    )
  }
  return { email, password }
}

describe('Announcement creation — real API', () => {
  const apiBaseUrl = (Cypress.env('apiBaseUrl') as string) || 'http://localhost:8080/api'

  it('logs in, creates text-only aviso via UI, verifies on GET /announcements/feed', () => {
    const { email, password } = requireTeacherCreds()
    const title = `E2E API ${Date.now()}`
    const description = 'Aviso criado pelo Cypress contra a API real (texto, sem imagem).'

    cy.visit('/login')
    cy.get('#email').clear().type(email)
    cy.get('#password').clear().type(password, { log: false })
    cy.contains('button', 'Entrar').click()

    cy.location('pathname', { timeout: 20000 }).should('eq', '/')
    cy.contains('button', 'Criar aviso', { timeout: 20000 }).should('be.visible').click()

    cy.get('[role="dialog"]').should('be.visible')
    cy.get('#announcementEditorTitle').should('be.visible').clear().type(title)
    cy.get('#announcementEditorContent').should('be.visible').clear().type(description)
    cy.get('form#announcement-editor-form').submit()

    cy.contains('Aviso criado com sucesso!', { timeout: 30000 }).should('be.visible')
    cy.get('[role="dialog"]', { timeout: 15000 }).should('not.exist')

    cy.contains(title).should('be.visible')
    cy.contains(description).should('be.visible')

    cy.window().then((win) => {
      const token = win.localStorage.getItem('token')
      expect(token, 'JWT after login').to.be.a('string').and.not.be.empty

      cy.request({
        method: 'GET',
        url: `${apiBaseUrl}/announcements/feed`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        expect(res.status).to.eq(200)
        const list = res.body as FeedAnnouncement[]
        const found = list.find((a) => a.title === title)
        expect(found, 'announcement returned by API feed').to.not.equal(undefined)
        expect(found!.content).to.eq(description)
        expect(found!.type).to.eq('TEXT')

        const adminEmail = (Cypress.env('adminEmail') as string | undefined)?.trim()
        const adminPassword = Cypress.env('adminPassword') as string | undefined
        if (!adminEmail || !adminPassword) {
          return
        }

        cy.request({
          method: 'POST',
          url: `${apiBaseUrl}/auth/login`,
          body: { email: adminEmail, password: adminPassword },
        }).then((loginRes) => {
          expect(loginRes.status).to.eq(200)
          const adminToken = loginRes.body.accessToken as string
          cy.request({
            method: 'DELETE',
            url: `${apiBaseUrl}/announcements/${found!.id}`,
            headers: { Authorization: `Bearer ${adminToken}` },
          }).its('status').should('eq', 204)
        })
      })
    })
  })
})
