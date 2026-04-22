/// <reference types="cypress" />

import { createTestJwt } from './testJwt'

export {}

type TestUser = {
  id: number
  name: string
  email: string
  register: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
}

const defaultTeacher: TestUser = {
  id: 1,
  name: 'Professor Cypress',
  email: 'teacher-cypress@test.local',
  register: '',
  role: 'TEACHER',
}

declare global {
  namespace Cypress {
    interface Chainable {
      visitHomeAuthenticated(user?: TestUser): Chainable<void>
    }
  }
}

Cypress.Commands.add('visitHomeAuthenticated', (user: TestUser = defaultTeacher) => {
  cy.visit('/', {
    onBeforeLoad(win) {
      win.localStorage.setItem('token', createTestJwt())
      win.localStorage.setItem('user', JSON.stringify(user))
    },
  })
})
