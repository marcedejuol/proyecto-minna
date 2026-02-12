"use client"

import { useCallback, useState } from "react"
import { Upload, X, FileText, Image as ImageIcon, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export interface UploadedFile {
  url: string
  name: string
  size: number
  type: string
}

interface FileUploadProps {
  files: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
}

const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]

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

export function FileUpload({ files, onChange }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const toUpload = Array.from(fileList)

      for (const file of toUpload) {
        if (file.size > MAX_SIZE) {
          toast.error(`"${file.name}" excede el limite de 10MB`)
          return
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
          toast.error(`Tipo no permitido: "${file.name}". Se aceptan imagenes, PDF, Word, Excel y texto.`)
          return
        }
      }

      setUploading(true)
      try {
        const formData = new FormData()
        for (const file of toUpload) {
          formData.append("files", file)
        }
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Error al subir")
        }
        const data = await res.json()
        onChange([...files, ...data.files])
        toast.success(`${data.files.length} archivo(s) subido(s) correctamente`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al subir archivos")
      } finally {
        setUploading(false)
      }
    },
    [files, onChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files)
      }
    },
    [uploadFiles]
  )

  const handleClick = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.multiple = true
    input.accept = ALLOWED_TYPES.join(",")
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        uploadFiles(target.files)
      }
    }
    input.click()
  }, [uploadFiles])

  const removeFile = useCallback(
    (index: number) => {
      onChange(files.filter((_, i) => i !== index))
    },
    [files, onChange]
  )

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick()
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <Upload className={`h-8 w-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
        {uploading ? (
          <p className="text-sm text-muted-foreground">Subiendo archivos...</p>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">
              Arrastre archivos aqui o haga clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground">
              Imagenes, PDF, Word, Excel o texto. Maximo 10MB por archivo.
            </p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {getFileIcon(file.type)}
                <span className="truncate text-sm text-foreground">{file.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">({formatSize(file.size)})</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => removeFile(i)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Eliminar archivo</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
