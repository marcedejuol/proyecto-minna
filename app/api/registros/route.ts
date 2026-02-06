import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      departamento,
      distrito,
      nombre_edi,
      tipo_grupo,
      fecha_recoleccion,
      evaluador_id,
      id_nino,
      sexo,
      fecha_nacimiento,
      edad_meses,
      rango_etario,
      asistencia_edi,
      id_cuidador,
      parentesco,
      edad_cuidador,
      nivel_educativo,
      acepta_consentimiento,
      ead_motor,
      ead_lenguaje,
      ead_cognitivo,
      ead_socioemocional,
      ead_total,
      ecpp_vinculo,
      ecpp_estimulo,
      ecpp_cuidados,
      ecpp_total,
    } = body

    await sql`
      INSERT INTO registros (
        departamento, distrito, nombre_edi, tipo_grupo, fecha_recoleccion, evaluador_id,
        id_nino, sexo, fecha_nacimiento, edad_meses, rango_etario, asistencia_edi,
        id_cuidador, parentesco, edad_cuidador, nivel_educativo, acepta_consentimiento,
        ead_motor, ead_lenguaje, ead_cognitivo, ead_socioemocional, ead_total,
        ecpp_vinculo, ecpp_estimulo, ecpp_cuidados, ecpp_total
      ) VALUES (
        ${departamento}, ${distrito}, ${nombre_edi}, ${tipo_grupo}, ${fecha_recoleccion}, ${evaluador_id},
        ${id_nino}, ${sexo}, ${fecha_nacimiento}, ${edad_meses}, ${rango_etario}, ${asistencia_edi},
        ${id_cuidador}, ${parentesco}, ${edad_cuidador}, ${nivel_educativo}, ${acepta_consentimiento},
        ${ead_motor}, ${ead_lenguaje}, ${ead_cognitivo}, ${ead_socioemocional}, ${ead_total},
        ${ecpp_vinculo}, ${ecpp_estimulo}, ${ecpp_cuidados}, ${ecpp_total}
      )
    `

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error inserting registro:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al guardar el registro" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const conditions: string[] = []
    const values: Record<string, string> = {}

    const filters = [
      "departamento",
      "distrito",
      "tipo_grupo",
      "sexo",
      "rango_etario",
      "parentesco",
      "nivel_educativo",
      "nombre_edi",
    ]

    for (const filter of filters) {
      const value = searchParams.get(filter)
      if (value) {
        values[filter] = value
      }
    }

    let rows
    if (Object.keys(values).length === 0) {
      rows = await sql`SELECT * FROM registros ORDER BY created_at DESC`
    } else {
      rows = await sql`
        SELECT * FROM registros
        WHERE
          (${values.departamento ?? null}::text IS NULL OR departamento = ${values.departamento ?? null})
          AND (${values.distrito ?? null}::text IS NULL OR distrito = ${values.distrito ?? null})
          AND (${values.tipo_grupo ?? null}::text IS NULL OR tipo_grupo::text = ${values.tipo_grupo ?? null})
          AND (${values.sexo ?? null}::text IS NULL OR sexo::text = ${values.sexo ?? null})
          AND (${values.rango_etario ?? null}::text IS NULL OR rango_etario::text = ${values.rango_etario ?? null})
          AND (${values.parentesco ?? null}::text IS NULL OR parentesco::text = ${values.parentesco ?? null})
          AND (${values.nivel_educativo ?? null}::text IS NULL OR nivel_educativo::text = ${values.nivel_educativo ?? null})
          AND (${values.nombre_edi ?? null}::text IS NULL OR nombre_edi = ${values.nombre_edi ?? null})
        ORDER BY created_at DESC
      `
    }

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching registros:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener registros" },
      { status: 500 }
    )
  }
}
