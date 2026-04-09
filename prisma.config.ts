import { defineConfig } from 'prisma/config'
import { listLocalDatabases } from '@prisma/adapter-d1'

function getLocalDbUrl(): string {
  try {
    const db = listLocalDatabases().pop()
    if (db) return `file:${db}`
  } catch {
    // no local wrangler D1 state yet
  }
  return 'file:.wrangler/state/v3/d1/local.db'
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations'
  },
  datasource: {
    url: getLocalDbUrl()
  }
})
