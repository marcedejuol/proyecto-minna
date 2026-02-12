"use client"

import { Download, FileText, Image as ImageIcon, FileSpreadsheet, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

interface AdjuntoFile {
  url: string
  name: string
  size: number
  type: string
}

interface Registro {
  id_registro: number
  id_nino: string
  departamento: string
  distrito: string
  fecha_recoleccion: string
  adjuntos: AdjuntoFile[] | string | null
}

function parseAdjuntos(adjuntos: AdjuntoFile[] | string | null): AdjuntoFile[] {
  if (!adjuntos) return []
  if (typeof adjuntos === "string") {
    try {
      return JSON.parse(adjuntos)
    } catch {
      return []
    }
  }
  return adjuntos
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-primary" />
  if (type.includes("spreadsheet") || type.includes("excel")) return <FileSpreadsheet className="h-4 w-4 text-accent" />
  return <FileText className="h-4 w-4 text-muted-foreground" />
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DatosAdjuntos({ data }: { data: any[] }) {
  const registrosConAdjuntos = data
    .map((r: Registro) => ({
      ...r,
      parsedAdjuntos: parseAdjuntos(r.adjuntos),
    }))
    .filter((r) => r.parsedAdjuntos.length > 0)

  if (registrosConAdjuntos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16">
        <Paperclip className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No hay adjuntos en los registros filtrados
        </p>
      </div>
    )
  }

  const totalFiles = registrosConAdjuntos.reduce((sum, r) => sum + r.parsedAdjuntos.length, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {registrosConAdjuntos.length} registro(s) con adjuntos
        </Badge>
        <Badge variant="outline" className="text-xs">
          {totalFiles} archivo(s) en total
        </Badge>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {registrosConAdjuntos.map((registro) => (
          <AccordionItem
            key={registro.id_registro}
            value={String(registro.id_registro)}
            className="rounded-lg border border-border bg-card px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Paperclip className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Registro #{registro.id_registro} - {registro.id_nino}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {registro.departamento}, {registro.distrito} | {registro.fecha_recoleccion} | {registro.parsedAdjuntos.length} archivo(s)
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pb-2">
                {registro.parsedAdjuntos.map((file: AdjuntoFile, i: number) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {getFileIcon(file.type)}
                      <span className="truncate text-sm text-foreground">{file.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">({formatSize(file.size)})</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5"
                      asChild
                    >
                      <a href={file.url} target="_blank" rel="noopener noreferrer" download={file.name}>
                        <Download className="h-3.5 w-3.5" />
                        Descargar
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
