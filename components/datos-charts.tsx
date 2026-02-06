"use client"

import { useMemo } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
      {/* Row 1: Distribution pie charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Distribucion por Sexo
            </CardTitle>
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rango Etario
            </CardTitle>
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Parentesco del Cuidador
            </CardTitle>
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nivel Educativo
            </CardTitle>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Puntajes Promedio EAD-3 por Rango Etario
            </CardTitle>
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Puntajes Promedio ECPP-p por Rango Etario
            </CardTitle>
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
