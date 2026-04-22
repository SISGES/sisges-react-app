import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'cypress'

function mergeEnv(projectRoot: string): Record<string, string> {
  const defaults: Record<string, string> = {
    apiBaseUrl: 'http://localhost:8080/api',
    teacherEmail: '',
    teacherPassword: '',
    adminEmail: '',
    adminPassword: '',
  }
  const filePath = path.join(projectRoot, 'cypress', 'cypress.env.json')
  let fromFile: Record<string, string> = {}
  if (fs.existsSync(filePath)) {
    try {
      fromFile = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, string>
    } catch {
      /* invalid JSON — use defaults */
    }
  }
  return {
    ...defaults,
    ...fromFile,
    ...(process.env.CYPRESS_API_BASE_URL && { apiBaseUrl: process.env.CYPRESS_API_BASE_URL }),
    ...(process.env.CYPRESS_TEACHER_EMAIL && { teacherEmail: process.env.CYPRESS_TEACHER_EMAIL }),
    ...(process.env.CYPRESS_TEACHER_PASSWORD && {
      teacherPassword: process.env.CYPRESS_TEACHER_PASSWORD,
    }),
    ...(process.env.CYPRESS_ADMIN_EMAIL && { adminEmail: process.env.CYPRESS_ADMIN_EMAIL }),
    ...(process.env.CYPRESS_ADMIN_PASSWORD && {
      adminPassword: process.env.CYPRESS_ADMIN_PASSWORD,
    }),
  }
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    setupNodeEvents(_on, config) {
      const root = config.projectRoot ?? process.cwd()
      config.env = {
        ...config.env,
        ...mergeEnv(root),
      }
      return config
    },
  },
})
