"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2, Building2 } from "lucide-react"
import {
  DEPARTAMENTOS_PARAGUAY,
  getCiudadesByDepartamento,
  getDepartamentoNombre,
} from "@/lib/paraguay-locations"

interface EDI {
  id: number
  nombre: string
  departamento: string
  distrito: string | null
  activo: boolean
  created_at: string
}

export default function AdminEdisPage() {
  const [edis, setEdis] = useState<EDI[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEdi, setEditingEdi] = useState<EDI | null>(null)

  const [formData, setFormData] = useState({
    nombre: "",
    departamento: "",
    distrito: "",
  })

  const ciudades = formData.departamento
    ? getCiudadesByDepartamento(formData.departamento)
    : []

  useEffect(() => {
    fetchEdis()
  }, [])

  async function fetchEdis() {
    try {
      const res = await fetch("/api/edis")
      if (res.ok) {
        const data = await res.json()
        setEdis(data)
      }
    } catch (error) {
      console.error("Error fetching EDIs:", error)
      toast.error("Error al cargar los EDIs")
    } finally {
      setLoading(false)
    }
  }

  function openNewDialog() {
    setEditingEdi(null)
    setFormData({ nombre: "", departamento: "", distrito: "" })
    setDialogOpen(true)
  }

  function openEditDialog(edi: EDI) {
    setEditingEdi(edi)
    setFormData({
      nombre: edi.nombre,
      departamento: edi.departamento,
      distrito: edi.distrito || "",
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!formData.nombre || !formData.departamento) {
      toast.error("Nombre y departamento son obligatorios")
      return
    }

    setSaving(true)
    try {
      const method = editingEdi ? "PUT" : "POST"
      const body = editingEdi
        ? { ...formData, id: editingEdi.id, activo: true }
        : formData

      const res = await fetch("/api/edis", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(editingEdi ? "EDI actualizado" : "EDI creado")
        setDialogOpen(false)
        fetchEdis()
      } else {
        const error = await res.json()
        toast.error(error.error || "Error al guardar")
      }
    } catch (error) {
      console.error("Error saving EDI:", error)
      toast.error("Error al guardar el EDI")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Está seguro de eliminar este EDI?")) return

    try {
      const res = await fetch(`/api/edis?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("EDI eliminado")
        fetchEdis()
      } else {
        toast.error("Error al eliminar")
      }
    } catch (error) {
      console.error("Error deleting EDI:", error)
      toast.error("Error al eliminar el EDI")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Administrar EDIs
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestione los Espacios de Desarrollo Infantil disponibles
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo EDI
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEdi ? "Editar EDI" : "Nuevo EDI"}
                </DialogTitle>
                <DialogDescription>
                  {editingEdi
                    ? "Modifique los datos del EDI"
                    : "Complete los datos para crear un nuevo EDI"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nombre">Nombre del EDI *</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: EDI San Lorenzo"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="departamento">Departamento *</Label>
                  <Select
                    value={formData.departamento}
                    onValueChange={(value) =>
                      setFormData({ ...formData, departamento: value, distrito: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un departamento" />
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
                  <Label htmlFor="distrito">Ciudad/Distrito</Label>
                  <Select
                    value={formData.distrito}
                    onValueChange={(value) =>
                      setFormData({ ...formData, distrito: value })
                    }
                    disabled={!formData.departamento}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una ciudad" />
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
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingEdi ? "Guardar Cambios" : "Crear EDI"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Lista de EDIs</CardTitle>
                <CardDescription>
                  {edis.length} EDI{edis.length !== 1 ? "s" : ""} registrado
                  {edis.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : edis.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No hay EDIs registrados
                </p>
                <Button className="mt-4" onClick={openNewDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primer EDI
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {edis.map((edi) => (
                    <TableRow key={edi.id}>
                      <TableCell className="font-medium">{edi.nombre}</TableCell>
                      <TableCell>
                        {getDepartamentoNombre(edi.departamento)}
                      </TableCell>
                      <TableCell>{edi.distrito || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={edi.activo ? "default" : "secondary"}>
                          {edi.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(edi)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(edi.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
