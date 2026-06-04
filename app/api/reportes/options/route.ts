import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { requireReportSession } from "@/lib/report-auth"
import {
  DEPARTAMENTOS_PARAGUAY,
  getCiudadesByDepartamento,
} from "@/lib/paraguay-locations"

function uniqueSorted(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort((a, b) =>
    a.localeCompare(b)
  )
}

export async function GET() {
  const session = await requireReportSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const sql = getDb()
    const totalRows = await sql`SELECT count(*)::int AS total FROM registros`
    const registroRows = await sql`
      SELECT DISTINCT departamento, distrito, nombre_edi
      FROM registros
      ORDER BY departamento, distrito, nombre_edi
    `
    const ediRows = await sql`
      SELECT nombre, departamento, distrito
      FROM edis
      WHERE activo = true
      ORDER BY departamento, distrito, nombre
    `

    const departamentosConDatos = uniqueSorted([
      ...registroRows.map((row) => row.departamento as string | null),
      ...ediRows.map((row) => row.departamento as string | null),
    ])
    const departamentos = DEPARTAMENTOS_PARAGUAY.map((dep) => ({
      value: dep.id,
      label: dep.nombre,
      hasData: departamentosConDatos.includes(dep.id),
    }))

    const distritosByDepartamento = Object.fromEntries(
      DEPARTAMENTOS_PARAGUAY.map((dep) => {
        const fromRegistros = registroRows
          .filter((row) => row.departamento === dep.id)
          .map((row) => row.distrito as string | null)
        const fromEdis = ediRows
          .filter((row) => row.departamento === dep.id)
          .map((row) => row.distrito as string | null)

        return [
          dep.id,
          uniqueSorted([
            ...getCiudadesByDepartamento(dep.id),
            ...fromRegistros,
            ...fromEdis,
          ]),
        ]
      })
    )

    const edis = uniqueSorted([
      ...registroRows.map((row) => row.nombre_edi as string | null),
      ...ediRows.map((row) => row.nombre as string | null),
    ])

    return NextResponse.json({
      totalRegistros: totalRows[0]?.total ?? 0,
      departamentos,
      distritosByDepartamento,
      edis,
      tipoGrupo: [
        { value: "1", label: "1 - Intervencion" },
        { value: "2", label: "2 - Control" },
      ],
      sexo: [
        { value: "1", label: "1 - Masculino" },
        { value: "2", label: "2 - Femenino" },
      ],
      rangoEtario: [
        { value: "1", label: "1 - 0-11 meses" },
        { value: "2", label: "2 - 12-23 meses" },
        { value: "3", label: "3 - 24-35 meses" },
        { value: "4", label: "4 - 36-47 meses" },
        { value: "5", label: "5 - 48-59 meses" },
        { value: "6", label: "6 - 60-72 meses" },
      ],
      asistenciaEdi: [
        { value: "1", label: "1 - Si" },
        { value: "0", label: "0 - No" },
      ],
      parentesco: [
        { value: "1", label: "1 - Madre" },
        { value: "2", label: "2 - Padre" },
        { value: "3", label: "3 - Tutor/a" },
      ],
      nivelEducativo: [
        { value: "1", label: "1 - Ninguno" },
        { value: "2", label: "2 - Primaria" },
        { value: "3", label: "3 - Secundaria" },
        { value: "4", label: "4 - Terciaria/Universitaria" },
      ],
    })
  } catch (error) {
    console.error("Error fetching report options:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al obtener opciones de reportes",
      },
      { status: 500 }
    )
  }
}
