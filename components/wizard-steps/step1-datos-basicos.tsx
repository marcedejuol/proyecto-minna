"use client"

import React, { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Baby, Users } from "lucide-react"

export interface DatosBasicosData {
  departamento: string
  distrito: string
  nombre_edi: string
  tipo_grupo: string
  fecha_recoleccion: string
  evaluador_id: string
  id_nino: string
  sexo: string
  fecha_nacimiento: string
  edad_meses: number
  rango_etario: string
  asistencia_edi: string
  id_cuidador: string
  parentesco: string
  edad_cuidador: number
  nivel_educativo: string
  acepta_consentimiento: boolean
}

interface Props {
  data: DatosBasicosData
  onChange: (data: DatosBasicosData) => void
}

function calcularEdadMeses(fechaNacimiento: string, fechaRecoleccion: string): number {
  if (!fechaNacimiento || !fechaRecoleccion) return 0
  const nacimiento = new Date(fechaNacimiento)
  const recoleccion = new Date(fechaRecoleccion)
  const meses =
    (recoleccion.getFullYear() - nacimiento.getFullYear()) * 12 +
    (recoleccion.getMonth() - nacimiento.getMonth())
  return Math.max(0, meses)
}

function calcularRangoEtario(edadMeses: number): string {
  if (edadMeses >= 0 && edadMeses <= 11) return "1"
  if (edadMeses >= 12 && edadMeses <= 23) return "2"
  if (edadMeses >= 24 && edadMeses <= 36) return "3"
  return ""
}

export function Step1DatosBasicos({ data, onChange }: Props) {
  const updateField = useCallback(
    (field: keyof DatosBasicosData, value: string | number | boolean) => {
      const updated = { ...data, [field]: value }

      if (field === "fecha_nacimiento" || field === "fecha_recoleccion") {
        const fn = field === "fecha_nacimiento" ? (value as string) : data.fecha_nacimiento
        const fr = field === "fecha_recoleccion" ? (value as string) : data.fecha_recoleccion
        const edadMeses = calcularEdadMeses(fn, fr)
        updated.edad_meses = edadMeses
        updated.rango_etario = calcularRangoEtario(edadMeses)
      }

      onChange(updated)
    },
    [data, onChange]
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Seccion 1: Identificacion del Registro */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Identificación del Registro</CardTitle>
              <CardDescription>Datos de trazabilidad territorial y temporal</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="departamento">Departamento *</Label>
              <Input
                id="departamento"
                placeholder="Ej: Central"
                value={data.departamento}
                onChange={(e) => updateField("departamento", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="distrito">Distrito *</Label>
              <Input
                id="distrito"
                placeholder="Ej: San Lorenzo"
                value={data.distrito}
                onChange={(e) => updateField("distrito", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre_edi">Nombre del EDI *</Label>
              <Input
                id="nombre_edi"
                placeholder="Nombre del Espacio de Desarrollo Infantil"
                value={data.nombre_edi}
                onChange={(e) => updateField("nombre_edi", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tipo_grupo">Tipo de Grupo *</Label>
              <Select value={data.tipo_grupo} onValueChange={(v) => updateField("tipo_grupo", v)}>
                <SelectTrigger id="tipo_grupo">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Intervención</SelectItem>
                  <SelectItem value="2">2 - Control (EDI Paraguari)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 max-w-40">
              <Label htmlFor="fecha_recoleccion">Fecha de Recolección *</Label>
              <Input
                id="fecha_recoleccion"
                type="date"
                value={data.fecha_recoleccion}
                onChange={(e) => updateField("fecha_recoleccion", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="evaluador_id">ID Evaluador/a *</Label>
              <Input
                id="evaluador_id"
                placeholder="Codigo del evaluador/a"
                value={data.evaluador_id}
                onChange={(e) => updateField("evaluador_id", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seccion 2: Datos del Nino/a */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Baby className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">Datos del Niño/a</CardTitle>
              <CardDescription>Variables sociodemográficas del niño o la niña evaluado/a</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="id_nino">ID Niño/a *</Label>
              <Input
                id="id_nino"
                placeholder="Código único (anonimizado)"
                value={data.id_nino}
                onChange={(e) => updateField("id_nino", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sexo">Sexo *</Label>
              <Select value={data.sexo} onValueChange={(v) => updateField("sexo", v)}>
                <SelectTrigger id="sexo">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Masculino</SelectItem>
                  <SelectItem value="2">2 - Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 max-w-40">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={data.fecha_nacimiento}
                onChange={(e) => updateField("fecha_nacimiento", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edad_meses">Edad en Meses</Label>
              <Input
                id="edad_meses"
                type="number"
                readOnly
                className="bg-muted"
                value={data.edad_meses}
              />
              <p className="text-xs text-muted-foreground">Calculado automáticamente</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="rango_etario">Rango Etario</Label>
              <Input
                id="rango_etario"
                readOnly
                className="bg-muted"
                value={
                  data.rango_etario === "1"
                    ? "1 - (0-11 meses)"
                    : data.rango_etario === "2"
                      ? "2 - (12-23 meses)"
                      : data.rango_etario === "3"
                        ? "3 - (24-36 meses)"
                        : ""
                }
              />
              <p className="text-xs text-muted-foreground">Calculado automáticamente</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="asistencia_edi">Asistencia EDI *</Label>
              <Select value={data.asistencia_edi} onValueChange={(v) => updateField("asistencia_edi", v)}>
                <SelectTrigger id="asistencia_edi">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Sí</SelectItem>
                  <SelectItem value="0">0 - No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seccion 3: Datos del Cuidador/a */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Datos del Cuidador/a Principal</CardTitle>
              <CardDescription>Información general del cuidador/a responsable</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="id_cuidador">ID Cuidador/a *</Label>
              <Input
                id="id_cuidador"
                placeholder="Código del cuidador/a"
                value={data.id_cuidador}
                onChange={(e) => updateField("id_cuidador", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="parentesco">Parentesco *</Label>
              <Select value={data.parentesco} onValueChange={(v) => updateField("parentesco", v)}>
                <SelectTrigger id="parentesco">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Madre</SelectItem>
                  <SelectItem value="2">2 - Padre</SelectItem>
                  <SelectItem value="3">3 - Tutor/a</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edad_cuidador">Edad del Cuidador/a *</Label>
              <Input
                id="edad_cuidador"
                type="number"
                min={0}
                placeholder="Años cumplidos"
                value={data.edad_cuidador || ""}
                onChange={(e) => updateField("edad_cuidador", Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="nivel_educativo">Nivel Educativo *</Label>
              <Select value={data.nivel_educativo} onValueChange={(v) => updateField("nivel_educativo", v)}>
                <SelectTrigger id="nivel_educativo">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Ninguno</SelectItem>
                  <SelectItem value="2">2 - Primaria</SelectItem>
                  <SelectItem value="3">3 - Secundaria</SelectItem>
                  <SelectItem value="4">4 - Terciaria/Universitaria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
                <Checkbox
                  id="acepta_consentimiento"
                  checked={data.acepta_consentimiento}
                  onCheckedChange={(v) => updateField("acepta_consentimiento", Boolean(v))}
                />
                <Label htmlFor="acepta_consentimiento" className="cursor-pointer text-sm">
                  El/la cuidador/a acepta el consentimiento informado *
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
