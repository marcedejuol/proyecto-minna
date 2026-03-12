"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  GraduationCap,
  Clock,
  Gamepad2,
  MessageCircle,
  Shield,
} from "lucide-react"
import { ECPP_ITEMS, ECPP_OPCIONES, DIMENSION_NAMES, type EcppItem } from "@/lib/evaluation-data"

export type EcppRespuestas = Record<string, number>

interface Props {
  respuestas: EcppRespuestas
  onChange: (respuestas: EcppRespuestas) => void
}

const DIMENSION_ICONS = {
  implicacion: GraduationCap,
  dedicacion: Clock,
  ocio: Gamepad2,
  asesoramiento: MessageCircle,
  rol: Shield,
}

const DIMENSION_COLORS = {
  implicacion: "bg-blue-500/10 text-blue-600",
  dedicacion: "bg-green-500/10 text-green-600",
  ocio: "bg-purple-500/10 text-purple-600",
  asesoramiento: "bg-orange-500/10 text-orange-600",
  rol: "bg-pink-500/10 text-pink-600",
}

export function Step3Ecpp({ respuestas, onChange }: Props) {
  // Group items by dimension
  const itemsByDimension = useMemo(() => {
    const grouped: Record<string, EcppItem[]> = {
      implicacion: [],
      dedicacion: [],
      ocio: [],
      asesoramiento: [],
      rol: [],
    }
    for (const item of ECPP_ITEMS) {
      grouped[item.dimension].push(item)
    }
    return grouped
  }, [])

  const handleChange = (itemId: string, value: number) => {
    onChange({ ...respuestas, [itemId]: value })
  }

  const getProgress = (dimension: string) => {
    const dimItems = itemsByDimension[dimension]
    const answered = dimItems.filter(item => respuestas[item.id] !== undefined).length
    return { answered, total: dimItems.length }
  }

  const totalAnswered = ECPP_ITEMS.filter(item => respuestas[item.id] !== undefined).length

  return (
    <div className="flex flex-col gap-6">
      {/* Header info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Escala de Competencia Parental Percibida (ECPP-P)</CardTitle>
              <CardDescription>
                Evaluación de las competencias del cuidador/a principal
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Para cada afirmación, indique con qué frecuencia usted realiza las siguientes acciones. 
            Sea sincero/a en sus respuestas, no hay respuestas correctas o incorrectas.
          </p>
          <div className="mt-4">
            <Badge variant="outline" className="gap-1">
              Progreso: {totalAnswered}/{ECPP_ITEMS.length} preguntas
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Items by dimension */}
      {(["implicacion", "dedicacion", "ocio", "asesoramiento", "rol"] as const).map(dimension => {
        const dimItems = itemsByDimension[dimension]
        if (dimItems.length === 0) return null
        const Icon = DIMENSION_ICONS[dimension]
        const { answered, total } = getProgress(dimension)

        return (
          <Card key={dimension}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${DIMENSION_COLORS[dimension]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{DIMENSION_NAMES[dimension]}</CardTitle>
                    <CardDescription>
                      {dimItems.length} preguntas
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={answered === total ? "default" : "outline"}>
                  {answered}/{total}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {dimItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-4 ${
                      respuestas[item.id] !== undefined
                        ? "border-primary/30 bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="mb-4">
                      <h4 className="font-medium">
                        {item.numero}. {item.pregunta}
                      </h4>
                    </div>

                    <RadioGroup
                      value={respuestas[item.id]?.toString()}
                      onValueChange={(v) => handleChange(item.id, parseInt(v))}
                      className="flex flex-wrap gap-3"
                    >
                      {ECPP_OPCIONES.map(opcion => (
                        <div key={opcion.value} className="flex items-center gap-2">
                          <RadioGroupItem
                            value={opcion.value.toString()}
                            id={`${item.id}-${opcion.value}`}
                          />
                          <Label
                            htmlFor={`${item.id}-${opcion.value}`}
                            className="cursor-pointer text-sm"
                          >
                            {opcion.value} - {opcion.label}
                          </Label>
                        </div>
                      ))}
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
