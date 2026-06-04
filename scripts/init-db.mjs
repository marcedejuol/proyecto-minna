import { readFile } from "node:fs/promises"
import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL no esta configurada")
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)
const schema = await readFile(new URL("./create-tables.sql", import.meta.url), "utf8")
const statements = schema
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean)

for (const statement of statements) {
  await sql.query(statement, [])
}

console.log("Tablas verificadas/creadas correctamente")
