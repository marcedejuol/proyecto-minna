import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se proporcionaron archivos" }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
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

    const uploaded = []

    for (const file of files) {
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `El archivo "${file.name}" excede el limite de 10MB` },
          { status: 400 }
        )
      }

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Tipo de archivo no permitido: "${file.name}". Se aceptan imagenes, PDF, Word, Excel y texto.` },
          { status: 400 }
        )
      }

      const blob = await put(`adjuntos/${Date.now()}-${file.name}`, file, {
        access: "public",
      })

      uploaded.push({
        url: blob.url,
        name: file.name,
        size: file.size,
        type: file.type,
      })
    }

    return NextResponse.json({ files: uploaded })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Error al subir archivos" }, { status: 500 })
  }
}
