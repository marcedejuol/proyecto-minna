import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function POST(request: Request) {
  try {
    const sql = getDb();
    const body = await request.json();

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
    } = body;

    const adjuntosJson = JSON.stringify(adjuntos || []);

    await sql`
      INSERT INTO registros (
        departamento, distrito, nombre_edi, tipo_grupo, fecha_recoleccion, evaluador_id,
        nombre_nino, cedula_nino, id_nino, sexo, fecha_nacimiento, edad_meses, rango_etario, asistencia_edi,
        id_cuidador, parentesco, edad_cuidador, nivel_educativo, acepta_consentimiento,
        ead_motor, ead_lenguaje, ead_cognitivo, ead_socioemocional, ead_total,
        ecpp_vinculo, ecpp_estimulo, ecpp_cuidados, ecpp_total, adjuntos
      ) VALUES (
        ${departamento}, ${distrito}, ${nombre_edi}, ${tipo_grupo}, ${fecha_recoleccion}, ${evaluador_id},
        ${nombre_nino}, ${cedula_nino || null}, ${id_nino}, ${sexo}, ${fecha_nacimiento}, ${edad_meses}, ${rango_etario}, ${asistencia_edi},
        ${id_cuidador}, ${parentesco}, ${edad_cuidador}, ${nivel_educativo}, ${acepta_consentimiento},
        ${ead_motor}, ${ead_lenguaje}, ${ead_cognitivo}, ${ead_socioemocional}, ${ead_total},
        ${ecpp_vinculo}, ${ecpp_estimulo}, ${ecpp_cuidados}, ${ecpp_total}, ${adjuntosJson}::jsonb
      )
    `;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error inserting registro:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al guardar el registro",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);

    const departamento = searchParams.get("departamento") || null;
    const distrito = searchParams.get("distrito") || null;
    const tipo_grupo = searchParams.get("tipo_grupo") || null;
    const sexo = searchParams.get("sexo") || null;
    const rango_etario = searchParams.get("rango_etario") || null;
    const parentesco = searchParams.get("parentesco") || null;
    const nivel_educativo = searchParams.get("nivel_educativo") || null;
    const nombre_edi = searchParams.get("nombre_edi") || null;

    const rows = await sql`
      SELECT * FROM registros
      WHERE
        (${departamento}::text IS NULL OR departamento = ${departamento})
        AND (${distrito}::text IS NULL OR distrito = ${distrito})
        AND (${tipo_grupo}::text IS NULL OR tipo_grupo::text = ${tipo_grupo})
        AND (${sexo}::text IS NULL OR sexo::text = ${sexo})
        AND (${rango_etario}::text IS NULL OR rango_etario::text = ${rango_etario})
        AND (${parentesco}::text IS NULL OR parentesco::text = ${parentesco})
        AND (${nivel_educativo}::text IS NULL OR nivel_educativo::text = ${nivel_educativo})
        AND (${nombre_edi}::text IS NULL OR nombre_edi = ${nombre_edi})
      ORDER BY created_at DESC
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching registros:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al obtener registros",
      },
      { status: 500 }
    );
  }
}
