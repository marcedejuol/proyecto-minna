import { NextResponse } from "next/server"
import { createReportSession, validateReportCredentials } from "@/lib/report-auth"

export async function POST(request: Request) {
  try {
    const { user, password } = await request.json()

    if (typeof user !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Credenciales invalidas" }, { status: 400 })
    }

    const reportUser = await validateReportCredentials(user, password)

    if (!reportUser) {
      return NextResponse.json({ error: "Usuario o contrasena incorrectos" }, { status: 401 })
    }

    await createReportSession(reportUser.user)
    return NextResponse.json({ success: true, user: reportUser.user })
  } catch (error) {
    console.error("Error during report login:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al iniciar sesion de reportes",
      },
      { status: 500 }
    )
  }
}
