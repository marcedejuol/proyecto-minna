import { NextResponse } from "next/server"
import { clearReportSession } from "@/lib/report-auth"

export async function POST() {
  await clearReportSession()
  return NextResponse.json({ success: true })
}
