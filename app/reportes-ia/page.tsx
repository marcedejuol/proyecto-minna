"use client"

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { SiteHeader } from "@/components/site-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Bot,
  Clipboard,
  Download,
  FileText,
  Loader2,
  Lock,
  LogOut,
  Sparkles,
} from "lucide-react"

type AuthState = {
  authenticated: boolean
  user: string | null
}

type ReportFilters = {
  fecha_desde: string
  fecha_hasta: string
  departamento: string
  distrito: string
  nombre_edi: string
  tipo_grupo: string
  sexo: string
  rango_etario: string
  asistencia_edi: string
  parentesco: string
  nivel_educativo: string
}

type Option = {
  value: string
  label: string
  hasData?: boolean
}

type ReportOptions = {
  totalRegistros: number
  departamentos: Option[]
  distritosByDepartamento: Record<string, string[]>
  edis: string[]
  tipoGrupo: Option[]
  sexo: Option[]
  rangoEtario: Option[]
  asistenciaEdi: Option[]
  parentesco: Option[]
  nivelEducativo: Option[]
}

const ALL_VALUE = "__all__"

const emptyFilters: ReportFilters = {
  fecha_desde: "",
  fecha_hasta: "",
  departamento: "",
  distrito: "",
  nombre_edi: "",
  tipo_grupo: "",
  sexo: "",
  rango_etario: "",
  asistencia_edi: "",
  parentesco: "",
  nivel_educativo: "",
}

function cleanFilters(filters: ReportFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value.trim() !== "")
  )
}

export default function ReportesIaPage() {
  const [auth, setAuth] = useState<AuthState>({ authenticated: false, user: null })
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loginUser, setLoginUser] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [filters, setFilters] = useState<ReportFilters>(emptyFilters)
  const [options, setOptions] = useState<ReportOptions | null>(null)
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [report, setReport] = useState("")
  const [recordCount, setRecordCount] = useState<number | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  const hasFilters = useMemo(
    () => Object.values(filters).some((value) => value.trim() !== ""),
    [filters]
  )

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/report-auth/status")
      const data = await res.json()
      setAuth({
        authenticated: Boolean(data.authenticated),
        user: data.user ?? null,
      })
    } catch {
      setAuth({ authenticated: false, user: null })
    } finally {
      setCheckingAuth(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const fetchOptions = useCallback(async () => {
    setLoadingOptions(true)
    try {
      const res = await fetch("/api/reportes/options")
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "No se pudieron cargar los filtros")
      }

      setOptions(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar filtros"
      setError(message)
      toast.error(message)
    } finally {
      setLoadingOptions(false)
    }
  }, [])

  useEffect(() => {
    if (auth.authenticated) {
      fetchOptions()
    } else {
      setOptions(null)
    }
  }, [auth.authenticated, fetchOptions])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginLoading(true)
    setError("")

    try {
      const res = await fetch("/api/report-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: loginUser, password: loginPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "No se pudo iniciar sesion")
      }

      setAuth({ authenticated: true, user: data.user })
      setLoginPassword("")
      toast.success("Acceso concedido")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error de acceso"
      setError(message)
      toast.error(message)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/report-auth/logout", { method: "POST" })
    setAuth({ authenticated: false, user: null })
    setReport("")
    setRecordCount(null)
    toast.success("Sesion cerrada")
  }

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    const nextValue = value === ALL_VALUE ? "" : value
    setFilters((prev) => ({
      ...prev,
      [key]: nextValue,
      ...(key === "departamento" ? { distrito: "", nombre_edi: "" } : {}),
    }))
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError("")
    setReport("")
    setRecordCount(null)

    try {
      const res = await fetch("/api/reportes/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanFilters(filters)),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "No se pudo generar el reporte")
      }

      setReport(data.report || "")
      setRecordCount(data.summary?.total_registros ?? null)
      toast.success("Reporte generado")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al generar reporte"
      setError(message)
      toast.error(message)
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!report) return
    await navigator.clipboard.writeText(report)
    toast.success("Reporte copiado")
  }

  const handleDownload = () => {
    if (!report) return

    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `reporte-ia-minna-${new Date().toISOString().slice(0, 10)}.md`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Bot className="h-3.5 w-3.5" />
                Reportes IA
              </Badge>
              {auth.authenticated && (
                <Badge variant="outline">Encargado: {auth.user}</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-balance text-foreground">
              Reporte inteligente de evaluaciones
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Genere interpretaciones ejecutivas desde datos agregados y anonimizados.
            </p>
          </div>
          {auth.authenticated && (
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesion
            </Button>
          )}
        </div>

        {checkingAuth ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !auth.authenticated ? (
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <CardTitle>Acceso del encargado</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="report-user">Usuario</Label>
                  <Input
                    id="report-user"
                    autoComplete="username"
                    value={loginUser}
                    onChange={(event) => setLoginUser(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-password">Contrasena</Label>
                  <Input
                    id="report-password"
                    type="password"
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>No se pudo ingresar</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button className="w-full" type="submit" disabled={loginLoading}>
                  {loginLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  Ingresar
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Filtros del reporte</CardTitle>
                  </div>
                  {options && (
                    <Badge variant={options.totalRegistros > 0 ? "secondary" : "outline"}>
                      {options.totalRegistros} registros
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingOptions && (
                  <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando filtros...
                  </div>
                )}

                {options && options.totalRegistros === 0 && (
                  <Alert>
                    <AlertTitle>Esta base no tiene registros</AlertTitle>
                    <AlertDescription>
                      La conexion Neon funciona, pero la tabla registros esta vacia en esta base.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="fecha-desde">Desde</Label>
                    <Input
                      id="fecha-desde"
                      type="date"
                      value={filters.fecha_desde}
                      onChange={(event) =>
                        handleFilterChange("fecha_desde", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha-hasta">Hasta</Label>
                    <Input
                      id="fecha-hasta"
                      type="date"
                      value={filters.fecha_hasta}
                      onChange={(event) =>
                        handleFilterChange("fecha_hasta", event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Select
                    value={filters.departamento || ALL_VALUE}
                    onValueChange={(value) => handleFilterChange("departamento", value)}
                    disabled={!options}
                  >
                    <SelectTrigger id="departamento">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                      {options?.departamentos.map((dep) => (
                        <SelectItem key={dep.value} value={dep.value}>
                          {dep.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distrito">Distrito</Label>
                  <Select
                    value={filters.distrito || ALL_VALUE}
                    onValueChange={(value) => handleFilterChange("distrito", value)}
                    disabled={!options || !filters.departamento}
                  >
                    <SelectTrigger id="distrito">
                      <SelectValue
                        placeholder={
                          filters.departamento
                            ? "Todos"
                            : "Seleccione departamento"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                      {(options?.distritosByDepartamento[filters.departamento] ?? []).map(
                        (distrito) => (
                          <SelectItem key={distrito} value={distrito}>
                            {distrito}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre-edi">EDI</Label>
                  <Select
                    value={filters.nombre_edi || ALL_VALUE}
                    onValueChange={(value) => handleFilterChange("nombre_edi", value)}
                    disabled={!options || options.edis.length === 0}
                  >
                    <SelectTrigger id="nombre-edi">
                      <SelectValue
                        placeholder={options?.edis.length ? "Todos" : "Sin EDIs"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                      {options?.edis.map((edi) => (
                        <SelectItem key={edi} value={edi}>
                          {edi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de grupo</Label>
                  <Select
                    value={filters.tipo_grupo || ALL_VALUE}
                    onValueChange={(value) => handleFilterChange("tipo_grupo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                      {options?.tipoGrupo.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <Select
                    value={filters.sexo || ALL_VALUE}
                    onValueChange={(value) => handleFilterChange("sexo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                      {options?.sexo.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rango etario</Label>
                  <Select
                    value={filters.rango_etario || ALL_VALUE}
                    onValueChange={(value) => handleFilterChange("rango_etario", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                      {options?.rangoEtario.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Asistencia EDI</Label>
                  <Select
                    value={filters.asistencia_edi || ALL_VALUE}
                    onValueChange={(value) => handleFilterChange("asistencia_edi", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                      {options?.asistenciaEdi.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Parentesco</Label>
                  <Select
                    value={filters.parentesco || ALL_VALUE}
                    onValueChange={(value) => handleFilterChange("parentesco", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                      {options?.parentesco.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nivel educativo</Label>
                  <Select
                    value={filters.nivel_educativo || ALL_VALUE}
                    onValueChange={(value) =>
                      handleFilterChange("nivel_educativo", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                      {options?.nivelEducativo.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    {generating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Bot className="mr-2 h-4 w-4" />
                    )}
                    Generar
                  </Button>
                  {hasFilters && (
                    <Button
                      variant="outline"
                      onClick={() => setFilters(emptyFilters)}
                      disabled={generating}
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Resultado</CardTitle>
                    {recordCount !== null && (
                      <Badge variant="secondary">{recordCount} registros</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!report}
                    >
                      <Clipboard className="mr-2 h-4 w-4" />
                      Copiar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={!report}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {generating ? (
                    <div className="flex min-h-[360px] items-center justify-center rounded-md border border-dashed">
                      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        Generando interpretacion anonima...
                      </div>
                    </div>
                  ) : report ? (
                    <Textarea
                      value={report}
                      readOnly
                      className="min-h-[560px] resize-y whitespace-pre-wrap font-mono text-sm leading-6"
                    />
                  ) : (
                    <div className="flex min-h-[360px] items-center justify-center rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                      Seleccione filtros si hace falta y genere un reporte para revisar
                      hallazgos, alertas y recomendaciones.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
