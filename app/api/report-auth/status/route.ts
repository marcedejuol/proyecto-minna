import { NextResponse } from "next/server"
import { getReportSession } from "@/lib/report-auth"

export async function GET() {
  const session = await getReportSession()
  return NextResponse.json({
    authenticated: Boolean(session),
    user: session?.user ?? null,
  })
}
