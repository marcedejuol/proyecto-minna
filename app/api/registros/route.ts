import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const sql = getDb()
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

    await sql(
      `INSERT INTO registros (
        departamento, distrito, nombre_edi, tipo_grupo, fecha_recoleccion, evaluador_id,
        id_nino, sexo, fecha_nacimiento, edad_meses, rango_etario, asistencia_edi,
        id_cuidador, parentesco, edad_cuidador, nivel_educativo, acepta_consentimiento,
        ead_motor, ead_lenguaje, ead_cognitivo, ead_socioemocional, ead_total,
        ecpp_vinculo, ecpp_estimulo, ecpp_cuidados, ecpp_total
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22,
        $23, $24, $25, $26
      )`,
      [
        departamento, distrito, nombre_edi, tipo_grupo, fecha_recoleccion, evaluador_id,
        id_nino, sexo, fecha_nacimiento, edad_meses, rango_etario, asistencia_edi,
        id_cuidador, parentesco, edad_cuidador, nivel_educativo, acepta_consentimiento,
        ead_motor, ead_lenguaje, ead_cognitivo, ead_socioemocional, ead_total,
        ecpp_vinculo, ecpp_estimulo, ecpp_cuidados, ecpp_total,
      ]
    )

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error inserting registro:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al guardar el registro" },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    const sql = getDb()
    const { searchParams } = new URL(request.url)

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
      rows = await sql("SELECT * FROM registros ORDER BY created_at DESC")
    } else {
      rows = await sql(
        `SELECT * FROM registros
        WHERE
          ($1::text IS NULL OR departamento = $1)
          AND ($2::text IS NULL OR distrito = $2)
          AND ($3::text IS NULL OR tipo_grupo::text = $3)
          AND ($4::text IS NULL OR sexo::text = $4)
          AND ($5::text IS NULL OR rango_etario::text = $5)
          AND ($6::text IS NULL OR parentesco::text = $6)
          AND ($7::text IS NULL OR nivel_educativo::text = $7)
          AND ($8::text IS NULL OR nombre_edi = $8)
        ORDER BY created_at DESC`,
        [
          values.departamento ?? null,
          values.distrito ?? null,
          values.tipo_grupo ?? null,
          values.sexo ?? null,
          values.rango_etario ?? null,
          values.parentesco ?? null,
          values.nivel_educativo ?? null,
          values.nombre_edi ?? null,
        ]
      )
    }

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching registros:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener registros" },
      { status: 500 },
    )
  }
}
