"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter, RotateCcw } from "lucide-react"

export interface Filters {
  departamento: string
  distrito: string
  tipo_grupo: string
  sexo: string
  rango_etario: string
  parentesco: string
  nivel_educativo: string
  nombre_edi: string
}

const ALL_VALUE = "__all__"

interface DatosFiltersProps {
  filters: Filters
  onFilterChange: (key: keyof Filters, value: string) => void
  onReset: () => void
  departamentos: string[]
  distritos: string[]
  edis: string[]
}

export function DatosFilters({
  filters,
  onFilterChange,
  onReset,
  departamentos,
  distritos,
  edis,
}: DatosFiltersProps) {
  const hasFilters = Object.values(filters).some((v) => v !== "")

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Filtros</CardTitle>
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={onReset} className="h-8 text-xs">
              <RotateCcw className="mr-1 h-3 w-3" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Departamento</Label>
            <Select
              value={filters.departamento || ALL_VALUE}
              onValueChange={(v) => onFilterChange("departamento", v === ALL_VALUE ? "" : v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                {departamentos.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Distrito</Label>
            <Select
              value={filters.distrito || ALL_VALUE}
              onValueChange={(v) => onFilterChange("distrito", v === ALL_VALUE ? "" : v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                {distritos.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">EDI</Label>
            <Select
              value={filters.nombre_edi || ALL_VALUE}
              onValueChange={(v) => onFilterChange("nombre_edi", v === ALL_VALUE ? "" : v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                {edis.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Tipo de Grupo</Label>
            <Select
              value={filters.tipo_grupo || ALL_VALUE}
              onValueChange={(v) => onFilterChange("tipo_grupo", v === ALL_VALUE ? "" : v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                <SelectItem value="1">Intervencion</SelectItem>
                <SelectItem value="2">Control</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Sexo</Label>
            <Select
              value={filters.sexo || ALL_VALUE}
              onValueChange={(v) => onFilterChange("sexo", v === ALL_VALUE ? "" : v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                <SelectItem value="1">Masculino</SelectItem>
                <SelectItem value="2">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Rango Etario</Label>
            <Select
              value={filters.rango_etario || ALL_VALUE}
              onValueChange={(v) => onFilterChange("rango_etario", v === ALL_VALUE ? "" : v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                <SelectItem value="1">0-11 meses</SelectItem>
                <SelectItem value="2">12-23 meses</SelectItem>
                <SelectItem value="3">24-36 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Parentesco</Label>
            <Select
              value={filters.parentesco || ALL_VALUE}
              onValueChange={(v) => onFilterChange("parentesco", v === ALL_VALUE ? "" : v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                <SelectItem value="1">Madre</SelectItem>
                <SelectItem value="2">Padre</SelectItem>
                <SelectItem value="3">Tutor/a</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Nivel Educativo</Label>
            <Select
              value={filters.nivel_educativo || ALL_VALUE}
              onValueChange={(v) => onFilterChange("nivel_educativo", v === ALL_VALUE ? "" : v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                <SelectItem value="1">Ninguno</SelectItem>
                <SelectItem value="2">Primaria</SelectItem>
                <SelectItem value="3">Secundaria</SelectItem>
                <SelectItem value="4">Terciaria/Universitaria</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
