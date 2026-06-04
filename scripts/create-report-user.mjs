import { randomBytes, scryptSync } from "node:crypto"
import { neon } from "@neondatabase/serverless"

const [, , username, password, role = "admin"] = process.argv

if (!username || !password) {
  console.error("Uso: node scripts/create-report-user.mjs <usuario> <contrasena> [admin|reporter]")
  process.exit(1)
}

if (!["admin", "reporter"].includes(role)) {
  console.error("El rol debe ser admin o reporter")
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL no esta configurada")
  process.exit(1)
}

const salt = randomBytes(16).toString("base64url")
const hash = scryptSync(password, salt, 64).toString("base64url")
const passwordHash = `scrypt:${salt}:${hash}`
const sql = neon(process.env.DATABASE_URL)

await sql`
  CREATE TABLE IF NOT EXISTS report_users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )
`

await sql`ALTER TABLE report_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin'`

await sql`
  INSERT INTO report_users (username, password_hash, role, active, updated_at)
  VALUES (${username}, ${passwordHash}, ${role}, true, NOW())
  ON CONFLICT (username)
  DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    active = true,
    updated_at = NOW()
`

console.log(`Usuario de reportes listo: ${username}`)
