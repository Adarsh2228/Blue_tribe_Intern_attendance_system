// Script to unlock CockroachDB schema locks, apply schema, then re-lock
// Run with: node scripts/unlock-schema.js

const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL || 
  "postgresql://klaw_intern_attendance:Y23svLJQiZGirQDswAEKDg@elated-lamb-31518.j77.aws-ap-south-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full"

async function main() {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  console.log('Connected to CockroachDB')

  // Check which tables exist and are locked
  const tables = ['employees', 'attendance_logs', 'admin_otps']

  try {
    console.log('Unlocking schema-locked tables...')
    for (const table of tables) {
      try {
        await client.query(`ALTER TABLE IF EXISTS "${table}" SET (schema_locked = false)`)
        console.log(`  ✓ Unlocked ${table}`)
      } catch (e) {
        console.log(`  — ${table} not found or not locked (OK)`)
      }
    }
    console.log('\nTables unlocked. Now run: npx prisma db push')
    console.log('After push, run: node scripts/relock-schema.js')
  } finally {
    await client.end()
  }
}

main().catch(console.error)
