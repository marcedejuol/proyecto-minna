"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Hand,
  Ear,
  Heart,
  GraduationCap,
  Clock,
  Gamepad2,
  MessageCircle,
  Shield,
} from "lucide-react"
import {
  AREA_NAMES,
  DIMENSION_NAMES,
  getClasificacionLabel,
  type ClasificacionDesarrollo,
} from "@/lib/evaluation-data"
import type { DatosBasicosData } from "./step1-datos-basicos"

interface ResultadosData {
  eadPorArea: Record<string, { correctos: number; total: number; clasificacion: ClasificacionDesarrollo }>
  eadTotalCorrectos: number
  eadTotalItems: number
  eadClasificacionGeneral: ClasificacionDesarrollo
  ecppPorDimension: Record<string, { suma: number; items: number; promedio: number }>
  ecppTotal: number
  ecppPromedio: number
}

interface Props {
  datosBasicos: DatosBasicosData
  resultados: ResultadosData
}

const AREA_ICONS = {
  MG: Activity,
  MF: Hand,
  AL: Ear,
  PS: Heart,
}

const DIMENSION_ICONS = {
  implicacion: GraduationCap,
  dedicacion: Clock,
  ocio: Gamepad2,
  asesoramiento: MessageCircle,
  rol: Shield,
}

const CLASIFICACION_CONFIG = {
  verde: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-500",
    bgLight: "bg-green-100",
    border: "border-green-200",
  },
  amarillo: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bg: "bg-yellow-500",
    bgLight: "bg-yellow-100",
    border: "border-yellow-200",
  },
  rojo: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-500",
    bgLight: "bg-red-100",
    border: "border-red-200",
  },
}

export function Step4Resultados({ datosBasicos, resultados }: Props) {
  const clasificacionConfig = CLASIFICACION_CONFIG[resultados.eadClasificacionGeneral]
  const ClasificacionIcon = clasificacionConfig.icon

  return (
    <div className="flex flex-col gap-6">
      {/* Resumen del nino */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Resumen de la Evaluación</CardTitle>
              <CardDescription>
                ID: {datosBasicos.id_nino} | Edad: {datosBasicos.edad_meses} meses | 
                {datosBasicos.sexo === "1" ? " Masculino" : " Femenino"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Clasificacion general EAD-3 */}
      <Card className={`${clasificacionConfig.bgLight} ${clasificacionConfig.border} border-2`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${clasificacionConfig.bg}`}>
                <ClasificacionIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Clasificación General EAD-3</CardTitle>
                <CardDescription className={clasificacionConfig.color}>
                  {getClasificacionLabel(resultados.eadClasificacionGeneral)}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {resultados.eadTotalCorrectos}/{resultados.eadTotalItems}
              </div>
              <div className="text-sm text-muted-foreground">items cumplidos</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Detalle EAD-3 por area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resultados EAD-3 por Área</CardTitle>
          <CardDescription>Puntaje directo por cada área de desarrollo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["MG", "MF", "AL", "PS"] as const).map(area => {
              const data = resultados.eadPorArea[area]
              if (!data) return null
              const Icon = AREA_ICONS[area]
              const config = CLASIFICACION_CONFIG[data.clasificacion]
              const percentage = data.total > 0 ? (data.correctos / data.total) * 100 : 0

              return (
                <div
                  key={area}
                  className={`rounded-lg border p-4 ${config.bgLight} ${config.border}`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                      <span className="font-medium">{AREA_NAMES[area]}</span>
                    </div>
                    <Badge variant="outline" className={config.color}>
                      {data.correctos}/{data.total}
                    </Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className={`mt-2 text-xs ${config.color}`}>
                    {getClasificacionLabel(data.clasificacion)}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leyenda de clasificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interpretación de Resultados EAD-3</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg bg-green-100 p-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-700">Verde</div>
                <div className="text-xs text-green-600">Desarrollo esperado</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-yellow-100 p-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-medium text-yellow-700">Amarillo</div>
                <div className="text-xs text-yellow-600">Riesgo de problemas</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-red-100 p-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="font-medium text-red-700">Rojo</div>
                <div className="text-xs text-red-600">Sospecha de problemas</div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Nota: Esta es una clasificación simplificada de muestra. Los resultados definitivos 
            deben obtenerse usando las tablas de baremos oficiales del EAD-3 según el rango de edad.
          </p>
        </CardContent>
      </Card>

      {/* Resultados ECPP-P */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Resultados ECPP-P</CardTitle>
              <CardDescription>Competencia Parental Percibida</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{resultados.ecppTotal}</div>
              <div className="text-sm text-muted-foreground">puntos totales</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {(["implicacion", "dedicacion", "ocio", "asesoramiento", "rol"] as const).map(dimension => {
              const data = resultados.ecppPorDimension[dimension]
              if (!data) return null
              const Icon = DIMENSION_ICONS[dimension]
              const maxPossible = data.items * 4 // Max 4 points per item
              const percentage = maxPossible > 0 ? (data.suma / maxPossible) * 100 : 0

              return (
                <div key={dimension} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{DIMENSION_NAMES[dimension]}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{data.suma}</span>
                      <span className="text-muted-foreground">/{maxPossible}</span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Promedio: {data.promedio.toFixed(1)} / 4.0
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Promedio general ECPP */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Promedio General ECPP-P</h3>
              <p className="text-sm text-muted-foreground">
                Escala de 1 (Nunca) a 4 (Siempre)
              </p>
            </div>
            <div className="text-3xl font-bold text-primary">
              {resultados.ecppPromedio.toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
