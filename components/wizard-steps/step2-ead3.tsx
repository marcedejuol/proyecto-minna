"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Brain, Activity, Hand, Ear, Heart } from "lucide-react"
import {
  getEadItemsByEdad,
  AREA_NAMES,
  RANGOS_EDAD_EAD,
  getRangoEdadByMeses,
  type EadItem,
} from "@/lib/evaluation-data"

export type Ead3Respuestas = Record<string, number>

interface Props {
  edadMeses: number
  respuestas: Ead3Respuestas
  onChange: (respuestas: Ead3Respuestas) => void
}

const AREA_ICONS = {
  MG: Activity,
  MF: Hand,
  AL: Ear,
  PS: Heart,
}

const AREA_COLORS = {
  MG: "bg-blue-500/10 text-blue-600",
  MF: "bg-green-500/10 text-green-600",
  AL: "bg-purple-500/10 text-purple-600",
  PS: "bg-orange-500/10 text-orange-600",
}

export function Step2Ead3({ edadMeses, respuestas, onChange }: Props) {
  const items = useMemo(() => getEadItemsByEdad(edadMeses), [edadMeses])
  const rangoEdad = getRangoEdadByMeses(edadMeses)
  const rangoInfo = RANGOS_EDAD_EAD.find(r => r.rango === rangoEdad)

  // Group items by area
  const itemsByArea = useMemo(() => {
    const grouped: Record<string, EadItem[]> = { MG: [], MF: [], AL: [], PS: [] }
    for (const item of items) {
      grouped[item.area].push(item)
    }
    return grouped
  }, [items])

  const handleChange = (itemId: string, value: number) => {
    onChange({ ...respuestas, [itemId]: value })
  }

  const getProgress = (area: string) => {
    const areaItems = itemsByArea[area]
    const answered = areaItems.filter(item => respuestas[item.id] !== undefined).length
    return { answered, total: areaItems.length }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Escala Abreviada del Desarrollo (EAD-3)</CardTitle>
              <CardDescription>
                Evaluacion del desarrollo infantil - Rango de edad: {rangoInfo?.label || `${edadMeses} meses`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Para cada item, marque <strong>SI (1)</strong> si el nino/a cumple el criterio de respuesta, 
            o <strong>NO (0)</strong> si no lo cumple. La puntuacion se basa en la observacion directa 
            del nino/a.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["MG", "MF", "AL", "PS"] as const).map(area => {
              const { answered, total } = getProgress(area)
              const Icon = AREA_ICONS[area]
              return (
                <Badge key={area} variant="outline" className={`gap-1 ${AREA_COLORS[area]}`}>
                  <Icon className="h-3 w-3" />
                  {AREA_NAMES[area]}: {answered}/{total}
                </Badge>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Items by area */}
      {(["MG", "MF", "AL", "PS"] as const).map(area => {
        const areaItems = itemsByArea[area]
        if (areaItems.length === 0) return null
        const Icon = AREA_ICONS[area]

        return (
          <Card key={area}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${AREA_COLORS[area]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">{AREA_NAMES[area]}</CardTitle>
                  <CardDescription>
                    {areaItems.length} items a evaluar
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {areaItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-4 ${
                      respuestas[item.id] !== undefined
                        ? "border-primary/30 bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="mb-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium">
                          {index + 1}. {item.descripcion}
                        </h4>
                        <Badge variant="outline" className="shrink-0">
                          Item {item.numero}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-4 flex flex-col gap-2 text-sm text-muted-foreground">
                      <div>
                        <strong>Condicion de observacion:</strong> {item.condicionObservacion}
                      </div>
                      <div>
                        <strong>Criterio de respuesta:</strong> {item.criterioRespuesta}
                      </div>
                      <div>
                        <strong>Materiales:</strong> {item.materiales}
                      </div>
                    </div>

                    <RadioGroup
                      value={respuestas[item.id]?.toString()}
                      onValueChange={(v) => handleChange(item.id, parseInt(v))}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="1" id={`${item.id}-si`} />
                        <Label
                          htmlFor={`${item.id}-si`}
                          className="cursor-pointer font-medium text-green-600"
                        >
                          SI (1) - Cumple
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="0" id={`${item.id}-no`} />
                        <Label
                          htmlFor={`${item.id}-no`}
                          className="cursor-pointer font-medium text-red-600"
                        >
                          NO (0) - No cumple
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
