"use client"

import React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
import {
  MapPin,
  Baby,
  Users,
  Brain,
  Heart,
  Loader2,
} from "lucide-react"

interface FormData {
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
  ead_motor: number
  ead_lenguaje: number
  ead_cognitivo: number
  ead_socioemocional: number
  ead_total: number
  ecpp_vinculo: number
  ecpp_estimulo: number
  ecpp_cuidados: number
  ecpp_total: number
}

const initialFormData: FormData = {
  departamento: "",
  distrito: "",
  nombre_edi: "",
  tipo_grupo: "",
  fecha_recoleccion: "",
  evaluador_id: "",
  id_nino: "",
  sexo: "",
  fecha_nacimiento: "",
  edad_meses: 0,
  rango_etario: "",
  asistencia_edi: "",
  id_cuidador: "",
  parentesco: "",
  edad_cuidador: 0,
  nivel_educativo: "",
  acepta_consentimiento: false,
  ead_motor: 0,
  ead_lenguaje: 0,
  ead_cognitivo: 0,
  ead_socioemocional: 0,
  ead_total: 0,
  ecpp_vinculo: 0,
  ecpp_estimulo: 0,
  ecpp_cuidados: 0,
  ecpp_total: 0,
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

export function RegistroForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(initialFormData)
  const [loading, setLoading] = useState(false)

  const updateField = useCallback(
    (field: keyof FormData, value: string | number | boolean) => {
      setForm((prev) => {
        const updated = { ...prev, [field]: value }

        if (field === "fecha_nacimiento" || field === "fecha_recoleccion") {
          const fn =
            field === "fecha_nacimiento"
              ? (value as string)
              : prev.fecha_nacimiento
          const fr =
            field === "fecha_recoleccion"
              ? (value as string)
              : prev.fecha_recoleccion
          const edadMeses = calcularEdadMeses(fn, fr)
          updated.edad_meses = edadMeses
          updated.rango_etario = calcularRangoEtario(edadMeses)
        }

        if (
          field === "ead_motor" ||
          field === "ead_lenguaje" ||
          field === "ead_cognitivo" ||
          field === "ead_socioemocional"
        ) {
          const motor = field === "ead_motor" ? Number(value) : prev.ead_motor
          const lenguaje = field === "ead_lenguaje" ? Number(value) : prev.ead_lenguaje
          const cognitivo = field === "ead_cognitivo" ? Number(value) : prev.ead_cognitivo
          const socioemocional =
            field === "ead_socioemocional" ? Number(value) : prev.ead_socioemocional
          updated.ead_total = motor + lenguaje + cognitivo + socioemocional
        }

        if (
          field === "ecpp_vinculo" ||
          field === "ecpp_estimulo" ||
          field === "ecpp_cuidados"
        ) {
          const vinculo = field === "ecpp_vinculo" ? Number(value) : prev.ecpp_vinculo
          const estimulo = field === "ecpp_estimulo" ? Number(value) : prev.ecpp_estimulo
          const cuidados = field === "ecpp_cuidados" ? Number(value) : prev.ecpp_cuidados
          updated.ecpp_total = vinculo + estimulo + cuidados
        }

        return updated
      })
    },
    []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.acepta_consentimiento) {
      toast.error("El consentimiento es obligatorio para registrar datos.")
      return
    }

    if (!form.rango_etario) {
      toast.error("El rango etario no pudo calcularse. Verifique las fechas ingresadas (el nino/a debe tener entre 0 y 36 meses).")
      return
    }

    if (!form.fecha_nacimiento || !form.fecha_recoleccion) {
      toast.error("Las fechas de nacimiento y recoleccion son obligatorias.")
      return
    }

    setLoading(true)

    try {
      const payload = {
        ...form,
        tipo_grupo: Number(form.tipo_grupo),
        sexo: Number(form.sexo),
        rango_etario: Number(form.rango_etario),
        asistencia_edi: Number(form.asistencia_edi),
        parentesco: Number(form.parentesco),
        nivel_educativo: Number(form.nivel_educativo),
        acepta_consentimiento: 1,
      }

      const res = await fetch("/api/registros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al guardar")
      }

      toast.success("Registro guardado exitosamente")
      setForm(initialFormData)
      router.push("/datos")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar el registro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Seccion 1: Identificacion del Registro */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Identificacion del Registro</CardTitle>
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
                required
                placeholder="Ej: Central"
                value={form.departamento}
                onChange={(e) => updateField("departamento", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="distrito">Distrito *</Label>
              <Input
                id="distrito"
                required
                placeholder="Ej: San Lorenzo"
                value={form.distrito}
                onChange={(e) => updateField("distrito", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre_edi">Nombre del EDI *</Label>
              <Input
                id="nombre_edi"
                required
                placeholder="Nombre del Espacio de Desarrollo Infantil"
                value={form.nombre_edi}
                onChange={(e) => updateField("nombre_edi", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tipo_grupo">Tipo de Grupo *</Label>
              <Select
                value={form.tipo_grupo}
                onValueChange={(v) => updateField("tipo_grupo", v)}
                required
              >
                <SelectTrigger id="tipo_grupo">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Intervencion</SelectItem>
                  <SelectItem value="2">2 - Control (EDI Paraguari)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="fecha_recoleccion">Fecha de Recoleccion *</Label>
              <Input
                id="fecha_recoleccion"
                type="date"
                required
                value={form.fecha_recoleccion}
                onChange={(e) => updateField("fecha_recoleccion", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="evaluador_id">ID Evaluador/a *</Label>
              <Input
                id="evaluador_id"
                required
                placeholder="Codigo del evaluador/a"
                value={form.evaluador_id}
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
              <CardTitle className="text-lg">Datos del Nino/a</CardTitle>
              <CardDescription>Variables sociodemograficas del nino o la nina evaluado/a</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="id_nino">ID Nino/a *</Label>
              <Input
                id="id_nino"
                required
                placeholder="Codigo unico (anonimizado)"
                value={form.id_nino}
                onChange={(e) => updateField("id_nino", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sexo">Sexo *</Label>
              <Select
                value={form.sexo}
                onValueChange={(v) => updateField("sexo", v)}
                required
              >
                <SelectTrigger id="sexo">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Masculino</SelectItem>
                  <SelectItem value="2">2 - Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                required
                value={form.fecha_nacimiento}
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
                value={form.edad_meses}
              />
              <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="rango_etario">Rango Etario</Label>
              <Input
                id="rango_etario"
                readOnly
                className="bg-muted"
                value={
                  form.rango_etario === "1"
                    ? "1 - (0-11 meses)"
                    : form.rango_etario === "2"
                      ? "2 - (12-23 meses)"
                      : form.rango_etario === "3"
                        ? "3 - (24-36 meses)"
                        : ""
                }
              />
              <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="asistencia_edi">Asistencia EDI *</Label>
              <Select
                value={form.asistencia_edi}
                onValueChange={(v) => updateField("asistencia_edi", v)}
                required
              >
                <SelectTrigger id="asistencia_edi">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Si</SelectItem>
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
              <CardDescription>Informacion general del cuidador/a responsable</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="id_cuidador">ID Cuidador/a *</Label>
              <Input
                id="id_cuidador"
                required
                placeholder="Codigo del cuidador/a"
                value={form.id_cuidador}
                onChange={(e) => updateField("id_cuidador", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="parentesco">Parentesco *</Label>
              <Select
                value={form.parentesco}
                onValueChange={(v) => updateField("parentesco", v)}
                required
              >
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
                required
                min={0}
                placeholder="Anios cumplidos"
                value={form.edad_cuidador || ""}
                onChange={(e) => updateField("edad_cuidador", Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="nivel_educativo">Nivel Educativo *</Label>
              <Select
                value={form.nivel_educativo}
                onValueChange={(v) => updateField("nivel_educativo", v)}
                required
              >
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
                  checked={form.acepta_consentimiento}
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

      {/* Seccion 4: Variables EAD-3 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Brain className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">Desarrollo Infantil (EAD-3)</CardTitle>
              <CardDescription>Puntajes de la escala de desarrollo infantil</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ead_motor">Motor *</Label>
              <Input
                id="ead_motor"
                type="number"
                required
                min={0}
                step="0.01"
                placeholder="0"
                value={form.ead_motor || ""}
                onChange={(e) => updateField("ead_motor", Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ead_lenguaje">Lenguaje *</Label>
              <Input
                id="ead_lenguaje"
                type="number"
                required
                min={0}
                step="0.01"
                placeholder="0"
                value={form.ead_lenguaje || ""}
                onChange={(e) => updateField("ead_lenguaje", Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ead_cognitivo">Cognitivo *</Label>
              <Input
                id="ead_cognitivo"
                type="number"
                required
                min={0}
                step="0.01"
                placeholder="0"
                value={form.ead_cognitivo || ""}
                onChange={(e) => updateField("ead_cognitivo", Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ead_socioemocional">Socioemocional *</Label>
              <Input
                id="ead_socioemocional"
                type="number"
                required
                min={0}
                step="0.01"
                placeholder="0"
                value={form.ead_socioemocional || ""}
                onChange={(e) => updateField("ead_socioemocional", Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ead_total">Total EAD-3</Label>
              <Input
                id="ead_total"
                type="number"
                readOnly
                className="bg-muted font-semibold"
                value={form.ead_total}
              />
              <p className="text-xs text-muted-foreground">Suma automatica</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seccion 5: Variables ECPP-p */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Competencias Parentales (ECPP-p)</CardTitle>
              <CardDescription>Puntajes de la escala de competencias parentales</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ecpp_vinculo">Vinculo Afectivo *</Label>
              <Input
                id="ecpp_vinculo"
                type="number"
                required
                min={0}
                step="0.01"
                placeholder="0"
                value={form.ecpp_vinculo || ""}
                onChange={(e) => updateField("ecpp_vinculo", Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ecpp_estimulo">Estimulacion *</Label>
              <Input
                id="ecpp_estimulo"
                type="number"
                required
                min={0}
                step="0.01"
                placeholder="0"
                value={form.ecpp_estimulo || ""}
                onChange={(e) => updateField("ecpp_estimulo", Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ecpp_cuidados">Cuidados Basicos *</Label>
              <Input
                id="ecpp_cuidados"
                type="number"
                required
                min={0}
                step="0.01"
                placeholder="0"
                value={form.ecpp_cuidados || ""}
                onChange={(e) => updateField("ecpp_cuidados", Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ecpp_total">Total ECPP-p</Label>
              <Input
                id="ecpp_total"
                type="number"
                readOnly
                className="bg-muted font-semibold"
                value={form.ecpp_total}
              />
              <p className="text-xs text-muted-foreground">Suma automatica</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={loading} className="min-w-[200px]">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar Registro"
          )}
        </Button>
      </div>
    </form>
  )
}
