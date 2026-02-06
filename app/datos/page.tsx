"use client"

import { useState, useCallback, useMemo } from "react"
import useSWR from "swr"
import { SiteHeader } from "@/components/site-header"
import { DatosFilters, type Filters } from "@/components/datos-filters"
import { DatosTable } from "@/components/datos-table"
import { DatosCharts } from "@/components/datos-charts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Table2, BarChart3 } from "lucide-react"

const emptyFilters: Filters = {
  departamento: "",
  distrito: "",
  tipo_grupo: "",
  sexo: "",
  rango_etario: "",
  parentesco: "",
  nivel_educativo: "",
  nombre_edi: "",
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DatosPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value)
    }
    return params.toString()
  }, [filters])

  const { data, isLoading } = useSWR(
    `/api/registros${queryString ? `?${queryString}` : ""}`,
    fetcher,
    { revalidateOnFocus: false }
  )

  const registros = Array.isArray(data) ? data : []

  const departamentos = useMemo(() => {
    const set = new Set(registros.map((r: { departamento: string }) => r.departamento))
    return Array.from(set).sort()
  }, [registros])

  const distritos = useMemo(() => {
    const set = new Set(registros.map((r: { distrito: string }) => r.distrito))
    return Array.from(set).sort()
  }, [registros])

  const edis = useMemo(() => {
    const set = new Set(registros.map((r: { nombre_edi: string }) => r.nombre_edi))
    return Array.from(set).sort()
  }, [registros])

  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setFilters(emptyFilters)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-balance text-foreground">
              Datos y Graficos
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore, filtre y visualice los registros del sistema.
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {isLoading ? "..." : registros.length} registros
          </Badge>
        </div>

        <div className="flex flex-col gap-6">
          <DatosFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
            departamentos={departamentos}
            distritos={distritos}
            edis={edis}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="charts" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="charts" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Graficos
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-2">
                  <Table2 className="h-4 w-4" />
                  Tabla
                </TabsTrigger>
              </TabsList>
              <TabsContent value="charts">
                <DatosCharts data={registros} />
              </TabsContent>
              <TabsContent value="table">
                <DatosTable data={registros} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}
