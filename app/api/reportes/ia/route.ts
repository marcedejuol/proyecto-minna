import OpenAI from "openai"
import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { requireReportSession } from "@/lib/report-auth"

type ReportFilters = {
  fecha_desde?: string
  fecha_hasta?: string
  departamento?: string
  distrito?: string
  nombre_edi?: string
  tipo_grupo?: string
  sexo?: string
  rango_etario?: string
  asistencia_edi?: string
  parentesco?: string
  nivel_educativo?: string
}

type RegistroReporte = {
  departamento: string
  distrito: string
  nombre_edi: string
  tipo_grupo: number | string
  fecha_recoleccion: string
  sexo: number | string
  edad_meses: number | string
  rango_etario: number | string
  asistencia_edi: number | string
  parentesco: number | string
  edad_cuidador: number | string
  nivel_educativo: number | string
  ead_motor: number | string
  ead_lenguaje: number | string
  ead_cognitivo: number | string
  ead_socioemocional: number | string
  ead_total: number | string
  ecpp_vinculo: number | string
  ecpp_estimulo: number | string
  ecpp_cuidados: number | string
  ecpp_total: number | string
  created_at: string
}

type GroupedCount = {
  label: string
  count: number
  percent: number
}

const labels = {
  tipoGrupo: new Map([
    ["1", "Intervencion"],
    ["2", "Control"],
  ]),
  sexo: new Map([
    ["1", "Masculino"],
    ["2", "Femenino"],
  ]),
  rangoEtario: new Map([
    ["1", "0-11 meses"],
    ["2", "12-23 meses"],
    ["3", "24-35 meses"],
    ["4", "36-47 meses"],
    ["5", "48-59 meses"],
    ["6", "60-72 meses"],
  ]),
  asistencia: new Map([
    ["0", "No asiste"],
    ["1", "Asiste"],
  ]),
  parentesco: new Map([
    ["1", "Madre"],
    ["2", "Padre"],
    ["3", "Tutor/a"],
  ]),
  nivelEducativo: new Map([
    ["1", "Ninguno"],
    ["2", "Primaria"],
    ["3", "Secundaria"],
    ["4", "Terciaria/Universitaria"],
  ]),
}

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function percent(count: number, total: number) {
  if (!total) return 0
  return Number(((count / total) * 100).toFixed(1))
}

function average(values: number[]) {
  if (!values.length) return 0
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2))
}

function normalizeLabel(value: number | string, map?: Map<string, string>) {
  const key = String(value)
  return map?.get(key) ?? key
}

function groupByCount<T extends RegistroReporte>(
  rows: T[],
  getValue: (row: T) => string,
  total: number,
  limit = 8
): GroupedCount[] {
  const grouped = new Map<string, number>()

  for (const row of rows) {
    const key = getValue(row) || "Sin dato"
    grouped.set(key, (grouped.get(key) ?? 0) + 1)
  }

  return Array.from(grouped.entries())
    .map(([label, count]) => ({ label, count, percent: percent(count, total) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit)
}

function buildAnonymousSummary(rows: RegistroReporte[], filters: ReportFilters) {
  const total = rows.length
  const eadMotor = rows.map((row) => toNumber(row.ead_motor))
  const eadLenguaje = rows.map((row) => toNumber(row.ead_lenguaje))
  const eadCognitivo = rows.map((row) => toNumber(row.ead_cognitivo))
  const eadSocioemocional = rows.map((row) => toNumber(row.ead_socioemocional))
  const eadTotal = rows.map((row) => toNumber(row.ead_total))
  const ecppVinculo = rows.map((row) => toNumber(row.ecpp_vinculo))
  const ecppEstimulo = rows.map((row) => toNumber(row.ecpp_estimulo))
  const ecppCuidados = rows.map((row) => toNumber(row.ecpp_cuidados))
  const ecppTotal = rows.map((row) => toNumber(row.ecpp_total))
  const edadMeses = rows.map((row) => toNumber(row.edad_meses))
  const edadCuidador = rows.map((row) => toNumber(row.edad_cuidador))

  const dates = rows
    .map((row) => new Date(row.fecha_recoleccion).toISOString().slice(0, 10))
    .sort()

  return {
    filtros_aplicados: filters,
    total_registros: total,
    periodo: {
      desde: filters.fecha_desde || dates[0] || null,
      hasta: filters.fecha_hasta || dates[dates.length - 1] || null,
    },
    promedios: {
      edad_meses: average(edadMeses),
      edad_cuidador: average(edadCuidador),
      ead_motor: average(eadMotor),
      ead_lenguaje: average(eadLenguaje),
      ead_cognitivo: average(eadCognitivo),
      ead_socioemocional: average(eadSocioemocional),
      ead_total: average(eadTotal),
      ecpp_vinculo: average(ecppVinculo),
      ecpp_estimulo: average(ecppEstimulo),
      ecpp_cuidados: average(ecppCuidados),
      ecpp_total: average(ecppTotal),
    },
    distribuciones: {
      departamentos: groupByCount(rows, (row) => row.departamento, total),
      distritos: groupByCount(rows, (row) => row.distrito, total),
      edis: groupByCount(rows, (row) => row.nombre_edi, total),
      tipo_grupo: groupByCount(
        rows,
        (row) => normalizeLabel(row.tipo_grupo, labels.tipoGrupo),
        total
      ),
      sexo: groupByCount(rows, (row) => normalizeLabel(row.sexo, labels.sexo), total),
      rango_etario: groupByCount(
        rows,
        (row) => normalizeLabel(row.rango_etario, labels.rangoEtario),
        total
      ),
      asistencia_edi: groupByCount(
        rows,
        (row) => normalizeLabel(row.asistencia_edi, labels.asistencia),
        total
      ),
      parentesco: groupByCount(
        rows,
        (row) => normalizeLabel(row.parentesco, labels.parentesco),
        total
      ),
      nivel_educativo: groupByCount(
        rows,
        (row) => normalizeLabel(row.nivel_educativo, labels.nivelEducativo),
        total
      ),
    },
    extremos: {
      ead_total_min: total ? Math.min(...eadTotal) : null,
      ead_total_max: total ? Math.max(...eadTotal) : null,
      ecpp_total_min: total ? Math.min(...ecppTotal) : null,
      ecpp_total_max: total ? Math.max(...ecppTotal) : null,
    },
    privacidad:
      "Resumen anonimo: no incluye nombres, cedulas, id_nino, id_cuidador ni identificadores personales.",
  }
}

function buildPrompt(summary: ReturnType<typeof buildAnonymousSummary>) {
  return `
Eres una analista de reportes para un programa de desarrollo infantil MINNA-FEEI.
Interpreta los datos agregados y anonimizados. No inventes datos individuales ni diagnosticos clinicos.

Entrega el reporte en espanol con estas secciones:
1. Resumen ejecutivo
2. Lectura de cobertura y muestra
3. Hallazgos EAD-3
4. Hallazgos ECPP-P
5. Alertas o puntos a mirar
6. Recomendaciones operativas

Usa tono profesional, claro y accionable. Si la muestra es pequena, adviertelo.

Datos anonimizados:
${JSON.stringify(summary, null, 2)}
`
}

function formatList(items: GroupedCount[]) {
  if (items.length === 0) return "Sin datos suficientes."
  return items
    .map((item) => `- ${item.label}: ${item.count} (${item.percent}%)`)
    .join("\n")
}

function buildBasicReport(summary: ReturnType<typeof buildAnonymousSummary>) {
  const promedios = summary.promedios
  const distribuciones = summary.distribuciones

  if (summary.total_registros === 0) {
    return "No se encontraron registros para los filtros seleccionados."
  }

  return `# Reporte basico de evaluaciones

## Resumen ejecutivo
Se analizaron ${summary.total_registros} registros anonimizados del periodo ${summary.periodo.desde ?? "sin fecha inicial"} al ${summary.periodo.hasta ?? "sin fecha final"}. Este reporte usa reglas locales y no consume API de IA.

## Cobertura
Departamentos con mayor presencia:
${formatList(distribuciones.departamentos)}

Distritos con mayor presencia:
${formatList(distribuciones.distritos)}

EDIs con mayor presencia:
${formatList(distribuciones.edis)}

## Perfil de la muestra
Tipo de grupo:
${formatList(distribuciones.tipo_grupo)}

Sexo:
${formatList(distribuciones.sexo)}

Rango etario:
${formatList(distribuciones.rango_etario)}

Asistencia EDI:
${formatList(distribuciones.asistencia_edi)}

## Resultados EAD-3
- Motricidad: promedio ${promedios.ead_motor}
- Lenguaje: promedio ${promedios.ead_lenguaje}
- Cognitivo: promedio ${promedios.ead_cognitivo}
- Socioemocional: promedio ${promedios.ead_socioemocional}
- Total EAD-3: promedio ${promedios.ead_total}

## Resultados ECPP-P
- Vinculo: promedio ${promedios.ecpp_vinculo}
- Estimulo: promedio ${promedios.ecpp_estimulo}
- Cuidados: promedio ${promedios.ecpp_cuidados}
- Total ECPP-P: promedio ${promedios.ecpp_total}

## Alertas operativas
- Revisar areas con promedios comparativamente bajos frente al resto de dimensiones.
- Si la muestra es pequena o concentrada en pocos EDIs, interpretar los resultados como orientativos.
- Mantener el analisis agregado para proteger datos personales de ninos y cuidadores.

## Recomendaciones
- Priorizar seguimiento en EDIs o distritos con mayor volumen de registros.
- Comparar estos resultados con cortes mensuales para detectar cambios.
- Usar el modo OpenAI solo cuando se necesite una interpretacion narrativa mas elaborada.`
}

export async function POST(request: Request) {
  const session = await requireReportSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const filters = (await request.json()) as ReportFilters
    const sql = getDb()

    const fechaDesde = filters.fecha_desde || null
    const fechaHasta = filters.fecha_hasta || null
    const departamento = filters.departamento || null
    const distrito = filters.distrito || null
    const nombreEdi = filters.nombre_edi || null
    const tipoGrupo = filters.tipo_grupo || null
    const sexo = filters.sexo || null
    const rangoEtario = filters.rango_etario || null
    const asistenciaEdi = filters.asistencia_edi || null
    const parentesco = filters.parentesco || null
    const nivelEducativo = filters.nivel_educativo || null

    const rows = (await sql`
      SELECT
        departamento,
        distrito,
        nombre_edi,
        tipo_grupo,
        fecha_recoleccion,
        sexo,
        edad_meses,
        rango_etario,
        asistencia_edi,
        parentesco,
        edad_cuidador,
        nivel_educativo,
        ead_motor,
        ead_lenguaje,
        ead_cognitivo,
        ead_socioemocional,
        ead_total,
        ecpp_vinculo,
        ecpp_estimulo,
        ecpp_cuidados,
        ecpp_total,
        created_at
      FROM registros
      WHERE
        (${fechaDesde}::date IS NULL OR fecha_recoleccion >= ${fechaDesde}::date)
        AND (${fechaHasta}::date IS NULL OR fecha_recoleccion <= ${fechaHasta}::date)
        AND (${departamento}::text IS NULL OR departamento = ${departamento})
        AND (${distrito}::text IS NULL OR distrito = ${distrito})
        AND (${nombreEdi}::text IS NULL OR nombre_edi = ${nombreEdi})
        AND (${tipoGrupo}::text IS NULL OR tipo_grupo::text = ${tipoGrupo})
        AND (${sexo}::text IS NULL OR sexo::text = ${sexo})
        AND (${rangoEtario}::text IS NULL OR rango_etario::text = ${rangoEtario})
        AND (${asistenciaEdi}::text IS NULL OR asistencia_edi::text = ${asistenciaEdi})
        AND (${parentesco}::text IS NULL OR parentesco::text = ${parentesco})
        AND (${nivelEducativo}::text IS NULL OR nivel_educativo::text = ${nivelEducativo})
      ORDER BY fecha_recoleccion DESC
    `) as RegistroReporte[]

    if (rows.length === 0) {
      return NextResponse.json({
        report: buildBasicReport(buildAnonymousSummary([], filters)),
        summary: buildAnonymousSummary([], filters),
      })
    }

    const summary = buildAnonymousSummary(rows, filters)

    if (process.env.REPORT_AI_MODE !== "openai" || !process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        report: buildBasicReport(summary),
        summary,
        generatedBy: session.user,
        mode: "basic",
      })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const response = await openai.responses.create({
      model: process.env.OPENAI_REPORT_MODEL || "gpt-5.4-nano",
      input: buildPrompt(summary),
      temperature: 0.2,
    })

    return NextResponse.json({
      report: response.output_text,
      summary,
      generatedBy: session.user,
      mode: "openai",
    })
  } catch (error) {
    console.error("Error generating AI report:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al generar el reporte IA",
      },
      { status: 500 }
    )
  }
}
