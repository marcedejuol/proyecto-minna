"use client"

import { useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Download, Images } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Registro {
  id_registro: number
  departamento: string
  distrito: string
  nombre_edi: string
  tipo_grupo: number
  sexo: number
  rango_etario: number
  parentesco: number
  nivel_educativo: number
  ead_motor: number
  ead_lenguaje: number
  ead_cognitivo: number
  ead_socioemocional: number
  ead_total: number
  ecpp_vinculo: number
  ecpp_estimulo: number
  ecpp_cuidados: number
  ecpp_total: number
  edad_meses: number
  [key: string]: string | number
}

const COLORS = [
  "hsl(210, 70%, 40%)",
  "hsl(165, 55%, 40%)",
  "hsl(35, 90%, 55%)",
  "hsl(340, 65%, 55%)",
  "hsl(270, 55%, 50%)",
]

const sexoLabels: Record<number, string> = { 1: "Masculino", 2: "Femenino" }
const rangoLabels: Record<number, string> = {
  1: "0-11 meses",
  2: "12-23 meses",
  3: "24-36 meses",
}
const parentescoLabels: Record<number, string> = {
  1: "Madre",
  2: "Padre",
  3: "Tutor/a",
}
const nivelLabels: Record<number, string> = {
  1: "Ninguno",
  2: "Primaria",
  3: "Secundaria",
  4: "Terciaria/Univ.",
}

const chartTitles = {
  sexo: "Distribucion por Sexo",
  rango: "Rango Etario",
  parentesco: "Parentesco del Cuidador",
  nivel: "Nivel Educativo",
  ead: "Puntajes Promedio EAD-3 por Rango Etario",
  ecpp: "Puntajes Promedio ECPP-p por Rango Etario",
} as const

type ChartId = keyof typeof chartTitles

const chartOptions: Array<{ id: ChartId; label: string }> = Object.entries(
  chartTitles
).map(([id, label]) => ({ id: id as ChartId, label }))

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement("a")
  link.download = filename
  link.href = canvas.toDataURL("image/png")
  link.click()
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function countByField(
  data: Registro[],
  field: string,
  labels: Record<number, string>
) {
  const counts: Record<string, number> = {}
  for (const row of data) {
    const key = labels[row[field] as number] || String(row[field])
    counts[key] = (counts[key] || 0) + 1
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

function avgByField(
  data: Registro[],
  groupField: string,
  valueFields: string[],
  labels: Record<number, string>
) {
  const groups: Record<string, { sums: Record<string, number>; count: number }> = {}
  for (const row of data) {
    const key = labels[row[groupField] as number] || String(row[groupField])
    if (!groups[key]) {
      groups[key] = { sums: {}, count: 0 }
      for (const f of valueFields) groups[key].sums[f] = 0
    }
    groups[key].count++
    for (const f of valueFields) {
      groups[key].sums[f] += Number(row[f]) || 0
    }
  }
  return Object.entries(groups).map(([name, g]) => {
    const entry: Record<string, string | number> = { name }
    for (const f of valueFields) {
      entry[f] = Math.round((g.sums[f] / g.count) * 100) / 100
    }
    return entry
  })
}

export function DatosCharts({ data }: { data: Registro[] }) {
  const [selectedCharts, setSelectedCharts] = useState<ChartId[]>([
    "sexo",
    "rango",
    "parentesco",
    "nivel",
    "ead",
    "ecpp",
  ])

  const sexoData = useMemo(() => countByField(data, "sexo", sexoLabels), [data])
  const rangoData = useMemo(
    () => countByField(data, "rango_etario", rangoLabels),
    [data]
  )
  const parentescoData = useMemo(
    () => countByField(data, "parentesco", parentescoLabels),
    [data]
  )
  const nivelData = useMemo(
    () => countByField(data, "nivel_educativo", nivelLabels),
    [data]
  )

  const eadByRango = useMemo(
    () =>
      avgByField(
        data,
        "rango_etario",
        ["ead_motor", "ead_lenguaje", "ead_cognitivo", "ead_socioemocional"],
        rangoLabels
      ),
    [data]
  )

  const ecppByRango = useMemo(
    () =>
      avgByField(
        data,
        "rango_etario",
        ["ecpp_vinculo", "ecpp_estimulo", "ecpp_cuidados"],
        rangoLabels
      ),
    [data]
  )

  const toggleChart = (chartId: ChartId) => {
    setSelectedCharts((current) =>
      current.includes(chartId)
        ? current.filter((id) => id !== chartId)
        : [...current, chartId]
    )
  }

  const createChartCanvas = async (chartId: ChartId) => {
    const container = document.querySelector<HTMLElement>(
      `[data-chart-export-id="${chartId}"]`
    )
    const svg = container?.querySelector("svg")

    if (!container || !svg) {
      throw new Error("No se encontro el grafico para exportar")
    }

    const title = chartTitles[chartId]
    const rect = svg.getBoundingClientRect()
    const width = Math.max(720, Math.ceil(rect.width))
    const height = Math.max(360, Math.ceil(rect.height) + 72)
    const scale = 2
    const canvas = document.createElement("canvas")
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("No se pudo preparar la imagen")
    }

    ctx.scale(scale, scale)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = "#111827"
    ctx.font = "600 20px Arial, sans-serif"
    ctx.fillText(title, 24, 34)
    ctx.fillStyle = "#6b7280"
    ctx.font = "13px Arial, sans-serif"
    ctx.fillText(`MINNA-FEEI - ${new Date().toLocaleDateString("es-PY")}`, 24, 56)

    const clonedSvg = svg.cloneNode(true) as SVGSVGElement
    clonedSvg.setAttribute("width", String(width - 48))
    clonedSvg.setAttribute("height", String(Math.max(260, Math.ceil(rect.height))))
    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg")

    const svgText = new XMLSerializer().serializeToString(clonedSvg)
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    try {
      const image = await loadImage(url)
      ctx.drawImage(image, 24, 72, width - 48, height - 96)
    } finally {
      URL.revokeObjectURL(url)
    }

    return canvas
  }

  const exportChart = async (chartId: ChartId) => {
    try {
      const canvas = await createChartCanvas(chartId)
      downloadCanvas(canvas, `${slugify(chartTitles[chartId])}.png`)
      toast.success("Grafico exportado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo exportar")
    }
  }

  const exportSelectedCharts = async () => {
    if (selectedCharts.length === 0) {
      toast.error("Seleccione al menos un grafico")
      return
    }

    try {
      const canvases = await Promise.all(selectedCharts.map(createChartCanvas))
      const gap = 24
      const width = Math.max(...canvases.map((canvas) => canvas.width))
      const height =
        canvases.reduce((sum, canvas) => sum + canvas.height, 0) +
        gap * (canvases.length - 1)
      const combined = document.createElement("canvas")
      combined.width = width
      combined.height = height
      const ctx = combined.getContext("2d")

      if (!ctx) {
        throw new Error("No se pudo preparar la imagen")
      }

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, width, height)

      let y = 0
      for (const canvas of canvases) {
        const x = Math.floor((width - canvas.width) / 2)
        ctx.drawImage(canvas, x, y)
        y += canvas.height + gap
      }

      downloadCanvas(combined, "graficos-minna-feei.png")
      toast.success("Graficos exportados")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo exportar")
    }
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No hay datos para graficar. Agregue registros primero.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Exportar graficos</CardTitle>
          <Button onClick={exportSelectedCharts} disabled={selectedCharts.length === 0}>
            <Images className="mr-2 h-4 w-4" />
            Exportar seleccionados
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {chartOptions.map((chart) => (
              <Label
                key={chart.id}
                className="flex items-center gap-3 rounded-md border p-3 text-sm"
              >
                <Checkbox
                  checked={selectedCharts.includes(chart.id)}
                  onCheckedChange={() => toggleChart(chart.id)}
                />
                <span>{chart.label}</span>
              </Label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Row 1: Distribution pie charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card data-chart-export-id="sexo">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {chartTitles.sexo}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => exportChart("sexo")}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Exportar distribucion por sexo</span>
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={sexoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {sexoData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-chart-export-id="rango">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {chartTitles.rango}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => exportChart("rango")}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Exportar rango etario</span>
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={rangoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {rangoData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-chart-export-id="parentesco">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {chartTitles.parentesco}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => exportChart("parentesco")}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Exportar parentesco del cuidador</span>
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={parentescoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {parentescoData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-chart-export-id="nivel">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {chartTitles.nivel}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => exportChart("nivel")}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Exportar nivel educativo</span>
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={nivelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {nivelData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Bar charts for scores */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-chart-export-id="ead">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {chartTitles.ead}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => exportChart("ead")}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Exportar puntajes promedio EAD-3</span>
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eadByRango} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="ead_motor" name="Motor" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="ead_lenguaje" name="Lenguaje" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="ead_cognitivo" name="Cognitivo" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="ead_socioemocional"
                  name="Socioemocional"
                  fill={COLORS[3]}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-chart-export-id="ecpp">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {chartTitles.ecpp}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => exportChart("ecpp")}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Exportar puntajes promedio ECPP-p</span>
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ecppByRango} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="ecpp_vinculo"
                  name="Vinculo"
                  fill={COLORS[0]}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="ecpp_estimulo"
                  name="Estimulacion"
                  fill={COLORS[1]}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="ecpp_cuidados"
                  name="Cuidados"
                  fill={COLORS[2]}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
