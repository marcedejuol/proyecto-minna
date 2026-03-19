import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return neon(process.env.DATABASE_URL)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb()
    const { id } = await params

    const result = await sql`
      SELECT * FROM registros WHERE id_registro = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching registro:", error)
    return NextResponse.json({ error: "Error al obtener registro" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb()
    const { id } = await params
    const body = await request.json()

    const {
      departamento,
      distrito,
      nombre_edi,
      tipo_grupo,
      fecha_recoleccion,
      evaluador_id,
      nombre_nino,
      cedula_nino,
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
      adjuntos,
    } = body

    const adjuntosJson = JSON.stringify(adjuntos || [])

    const result = await sql`
      UPDATE registros SET
        departamento = ${departamento},
        distrito = ${distrito},
        nombre_edi = ${nombre_edi},
        tipo_grupo = ${tipo_grupo},
        fecha_recoleccion = ${fecha_recoleccion},
        evaluador_id = ${evaluador_id},
        nombre_nino = ${nombre_nino},
        cedula_nino = ${cedula_nino || null},
        id_nino = ${id_nino},
        sexo = ${sexo},
        fecha_nacimiento = ${fecha_nacimiento},
        edad_meses = ${edad_meses},
        rango_etario = ${rango_etario},
        asistencia_edi = ${asistencia_edi},
        id_cuidador = ${id_cuidador},
        parentesco = ${parentesco},
        edad_cuidador = ${edad_cuidador},
        nivel_educativo = ${nivel_educativo},
        acepta_consentimiento = ${acepta_consentimiento},
        ead_motor = ${ead_motor},
        ead_lenguaje = ${ead_lenguaje},
        ead_cognitivo = ${ead_cognitivo},
        ead_socioemocional = ${ead_socioemocional},
        ead_total = ${ead_total},
        ecpp_vinculo = ${ecpp_vinculo},
        ecpp_estimulo = ${ecpp_estimulo},
        ecpp_cuidados = ${ecpp_cuidados},
        ecpp_total = ${ecpp_total},
        adjuntos = ${adjuntosJson}::jsonb
      WHERE id_registro = ${id}
      RETURNING id_registro
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, id: result[0].id_registro })
  } catch (error) {
    console.error("Error updating registro:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar registro" },
      { status: 500 }
    )
  }
}
