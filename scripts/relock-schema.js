// Script to re-lock CockroachDB schema after prisma db push
// Run with: node scripts/relock-schema.js

const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL || 
  "postgresql://klaw_intern_attendance:Y23svLJQiZGirQDswAEKDg@elated-lamb-31518.j77.aws-ap-south-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full"

async function main() {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  console.log('Connected to CockroachDB')

  const tables = ['employees', 'attendance_logs', 'admin_otps']

  try {
    console.log('Re-locking schema on tables...')
    for (const table of tables) {
      try {
        await client.query(`ALTER TABLE IF EXISTS "${table}" SET (schema_locked = true)`)
        console.log(`  ✓ Locked ${table}`)
      } catch (e) {
        console.log(`  — ${table}: ${e}`)
      }
    }
    console.log('\nAll tables schema-locked again.')
  } finally {
    await client.end()
  }
}

main().catch(console.error)
