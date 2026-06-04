import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import { getDb } from "@/lib/db"

const COOKIE_NAME = "minna_report_session"
const SESSION_TTL_SECONDS = 60 * 60 * 8

type ReportSession = {
  user: string
  expiresAt: number
}

function getSessionSecret() {
  const secret = process.env.REPORT_SESSION_SECRET
  if (!secret) {
    throw new Error("REPORT_SESSION_SECRET environment variable is not set")
  }
  return secret
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url")
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)

  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("base64url")
}

export function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("base64url")
  return `scrypt:${salt}:${hashPassword(password, salt)}`
}

function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(":")
  if (algorithm !== "scrypt" || !salt || !hash) return false

  return safeCompare(hashPassword(password, salt), hash)
}

function encodeSession(session: ReportSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url")
  const signature = signPayload(payload)
  return `${payload}.${signature}`
}

function decodeSession(value: string): ReportSession | null {
  const [payload, signature] = value.split(".")
  if (!payload || !signature) return null

  const expectedSignature = signPayload(payload)
  if (!safeCompare(signature, expectedSignature)) return null

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
    if (
      typeof session?.user !== "string" ||
      typeof session?.expiresAt !== "number" ||
      Date.now() > session.expiresAt
    ) {
      return null
    }
    return session
  } catch {
    return null
  }
}

export async function validateReportCredentials(user: string, password: string) {
  const sql = getDb()
  const rows = await sql`
    SELECT username, password_hash, role
    FROM report_users
    WHERE username = ${user}
      AND active = true
      AND role = 'admin'
    LIMIT 1
  `
  const reportUser = rows[0] as
    | { username: string; password_hash: string; role: string }
    | undefined

  if (!reportUser) return null
  if (!verifyPassword(password, reportUser.password_hash)) return null

  await sql`
    UPDATE report_users
    SET last_login_at = NOW()
    WHERE username = ${reportUser.username}
  `

  return { user: reportUser.username }
}

export async function createReportSession(user: string) {
  const cookieStore = await cookies()
  const value = encodeSession({
    user,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  })

  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  })
}

export async function clearReportSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getReportSession() {
  const cookieStore = await cookies()
  const value = cookieStore.get(COOKIE_NAME)?.value
  if (!value) return null
  return decodeSession(value)
}

export async function requireReportSession() {
  const session = await getReportSession()
  if (!session) return null
  return session
}
