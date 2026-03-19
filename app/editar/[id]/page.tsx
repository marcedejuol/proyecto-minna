"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import {
  DEPARTAMENTOS_PARAGUAY,
  getCiudadesByDepartamento,
} from "@/lib/paraguay-locations"
import Link from "next/link"

interface Registro {
  id_registro: number
  departamento: string
  distrito: string
  nombre_edi: string
  tipo_grupo: number
  fecha_recoleccion: string
  evaluador_id: string
  nombre_nino: string
  cedula_nino: string | null
  id_nino: string
  sexo: number
  fecha_nacimiento: string
  edad_meses: number
  rango_etario: number
  asistencia_edi: number
  id_cuidador: string
  parentesco: number
  edad_cuidador: number
  nivel_educativo: number
  acepta_consentimiento: number
  ead_motor: number
  ead_lenguaje: number
  ead_cognitivo: number
  ead_socioemocional: number
  ead_total: number
  ecpp_vinculo: number
  ecpp_estimulo: number
  ecpp_cuidados: number
  ecpp_total: number
  adjuntos: any[]
}

interface EDI {
  id: number
  nombre: string
  departamento: string
  distrito: string | null
}

export default function EditarRegistroPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [registro, setRegistro] = useState<Registro | null>(null)
  const [edis, setEdis] = useState<EDI[]>([])

  const ciudades = registro?.departamento
    ? getCiudadesByDepartamento(registro.departamento)
    : []

  const edisDisponibles = registro?.departamento
    ? edis.filter((edi) => edi.departamento === registro.departamento)
    : edis

  useEffect(() => {
    async function fetchData() {
      try {
        const [registroRes, edisRes] = await Promise.all([
          fetch(`/api/registros/${id}`),
          fetch("/api/edis"),
        ])

        if (!registroRes.ok) {
          toast.error("Registro no encontrado")
          router.push("/datos")
          return
        }

        const registroData = await registroRes.json()
        // Convert date strings to YYYY-MM-DD format
        if (registroData.fecha_recoleccion) {
          registroData.fecha_recoleccion = registroData.fecha_recoleccion.split("T")[0]
        }
        if (registroData.fecha_nacimiento) {
          registroData.fecha_nacimiento = registroData.fecha_nacimiento.split("T")[0]
        }
        setRegistro(registroData)

        if (edisRes.ok) {
          setEdis(await edisRes.json())
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, router])

  function updateField(field: keyof Registro, value: any) {
    if (!registro) return
    const updated = { ...registro, [field]: value }

    // Si cambia el departamento, limpiar distrito y EDI
    if (field === "departamento") {
      updated.distrito = ""
      updated.nombre_edi = ""
    }

    // Recalcular edad si cambian las fechas
    if (field === "fecha_nacimiento" || field === "fecha_recoleccion") {
      const fn = field === "fecha_nacimiento" ? value : registro.fecha_nacimiento
      const fr = field === "fecha_recoleccion" ? value : registro.fecha_recoleccion
      if (fn && fr) {
        const nacimiento = new Date(fn)
        const recoleccion = new Date(fr)
        const meses =
          (recoleccion.getFullYear() - nacimiento.getFullYear()) * 12 +
          (recoleccion.getMonth() - nacimiento.getMonth())
        updated.edad_meses = Math.max(0, meses)

        // Calcular rango etario
        if (updated.edad_meses <= 11) updated.rango_etario = 1
        else if (updated.edad_meses <= 23) updated.rango_etario = 2
        else if (updated.edad_meses <= 35) updated.rango_etario = 3
        else if (updated.edad_meses <= 47) updated.rango_etario = 4
        else if (updated.edad_meses <= 59) updated.rango_etario = 5
        else if (updated.edad_meses <= 72) updated.rango_etario = 6
      }
    }

    setRegistro(updated)
  }

  async function handleSave() {
    if (!registro) return
    setSaving(true)
    try {
      const res = await fetch(`/api/registros/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registro),
      })

      if (res.ok) {
        toast.success("Registro actualizado exitosamente")
        router.push("/datos")
      } else {
        const error = await res.json()
        toast.error(error.error || "Error al guardar")
      }
    } catch (error) {
      console.error("Error saving:", error)
      toast.error("Error al guardar los cambios")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  if (!registro) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Registro no encontrado</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Editar Registro #{registro.id_registro}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Modifique los datos del registro y guarde los cambios
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/datos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Datos de ubicación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Identificación del Registro</CardTitle>
              <CardDescription>Datos de trazabilidad territorial y temporal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label>Departamento</Label>
                  <Select
                    value={registro.departamento}
                    onValueChange={(v) => updateField("departamento", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTAMENTOS_PARAGUAY.map((dep) => (
                        <SelectItem key={dep.id} value={dep.id}>
                          {dep.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Ciudad/Distrito</Label>
                  <Select
                    value={registro.distrito}
                    onValueChange={(v) => updateField("distrito", v)}
                    disabled={!registro.departamento}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ciudades.map((ciudad) => (
                        <SelectItem key={ciudad} value={ciudad}>
                          {ciudad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>EDI</Label>
                  <Select
                    value={registro.nombre_edi}
                    onValueChange={(v) => updateField("nombre_edi", v)}
                    disabled={edisDisponibles.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {edisDisponibles.map((edi) => (
                        <SelectItem key={edi.id} value={edi.nombre}>
                          {edi.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Tipo de Grupo</Label>
                  <Select
                    value={String(registro.tipo_grupo)}
                    onValueChange={(v) => updateField("tipo_grupo", Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Intervención</SelectItem>
                      <SelectItem value="2">2 - Control</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2 max-w-40">
                  <Label>Fecha de Recolección</Label>
                  <Input
                    type="date"
                    value={registro.fecha_recoleccion}
                    onChange={(e) => updateField("fecha_recoleccion", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>ID Evaluador/a</Label>
                  <Input
                    value={registro.evaluador_id}
                    onChange={(e) => updateField("evaluador_id", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datos del niño */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datos del Niño/a</CardTitle>
              <CardDescription>Variables sociodemográficas del niño o la niña evaluado/a</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label>Nombre del Niño/a</Label>
                  <Input
                    value={registro.nombre_nino || ""}
                    onChange={(e) => updateField("nombre_nino", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Cédula del Niño/a</Label>
                  <Input
                    value={registro.cedula_nino || ""}
                    onChange={(e) => updateField("cedula_nino", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>ID Niño/a</Label>
                  <Input value={registro.id_nino} readOnly className="bg-muted" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Sexo</Label>
                  <Select
                    value={String(registro.sexo)}
                    onValueChange={(v) => updateField("sexo", Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Masculino</SelectItem>
                      <SelectItem value="2">2 - Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2 max-w-40">
                  <Label>Fecha de Nacimiento</Label>
                  <Input
                    type="date"
                    value={registro.fecha_nacimiento}
                    onChange={(e) => updateField("fecha_nacimiento", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Edad en Meses</Label>
                  <Input value={registro.edad_meses} readOnly className="bg-muted" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Asistencia EDI</Label>
                  <Select
                    value={String(registro.asistencia_edi)}
                    onValueChange={(v) => updateField("asistencia_edi", Number(v))}
                  >
                    <SelectTrigger>
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

          {/* Datos del cuidador */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datos del Cuidador/a Principal</CardTitle>
              <CardDescription>Información general del cuidador/a responsable</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label>ID Cuidador/a</Label>
                  <Input
                    value={registro.id_cuidador}
                    onChange={(e) => updateField("id_cuidador", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Parentesco</Label>
                  <Select
                    value={String(registro.parentesco)}
                    onValueChange={(v) => updateField("parentesco", Number(v))}
                  >
                    <SelectTrigger>
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
                  <Label>Edad del Cuidador/a</Label>
                  <Input
                    type="number"
                    value={registro.edad_cuidador}
                    onChange={(e) => updateField("edad_cuidador", Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Nivel Educativo</Label>
                  <Select
                    value={String(registro.nivel_educativo)}
                    onValueChange={(v) => updateField("nivel_educativo", Number(v))}
                  >
                    <SelectTrigger>
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
              </div>
            </CardContent>
          </Card>

          {/* Puntajes EAD-3 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Puntajes EAD-3</CardTitle>
              <CardDescription>Puntajes por área de desarrollo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="flex flex-col gap-2">
                  <Label>Motor</Label>
                  <Input
                    type="number"
                    value={registro.ead_motor}
                    onChange={(e) => updateField("ead_motor", Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Lenguaje</Label>
                  <Input
                    type="number"
                    value={registro.ead_lenguaje}
                    onChange={(e) => updateField("ead_lenguaje", Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Cognitivo</Label>
                  <Input
                    type="number"
                    value={registro.ead_cognitivo}
                    onChange={(e) => updateField("ead_cognitivo", Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Socioemocional</Label>
                  <Input
                    type="number"
                    value={registro.ead_socioemocional}
                    onChange={(e) => updateField("ead_socioemocional", Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Total</Label>
                  <Input
                    type="number"
                    value={registro.ead_total}
                    onChange={(e) => updateField("ead_total", Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Puntajes ECPP */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Puntajes ECPP-P</CardTitle>
              <CardDescription>Puntajes de competencia parental</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-2">
                  <Label>Vínculo</Label>
                  <Input
                    type="number"
                    value={registro.ecpp_vinculo}
                    onChange={(e) => updateField("ecpp_vinculo", Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Estímulo</Label>
                  <Input
                    type="number"
                    value={registro.ecpp_estimulo}
                    onChange={(e) => updateField("ecpp_estimulo", Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Cuidados</Label>
                  <Input
                    type="number"
                    value={registro.ecpp_cuidados}
                    onChange={(e) => updateField("ecpp_cuidados", Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Total</Label>
                  <Input
                    type="number"
                    value={registro.ecpp_total}
                    onChange={(e) => updateField("ecpp_total", Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botón guardar */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/datos">Cancelar</Link>
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
