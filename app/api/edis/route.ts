import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return neon(process.env.DATABASE_URL)
}

export async function GET() {
  try {
    const sql = getDb()
    const edis = await sql`
      SELECT id, nombre, departamento, distrito, activo, created_at 
      FROM edis 
      WHERE activo = true 
      ORDER BY departamento, nombre
    `
    return NextResponse.json(edis)
  } catch (error) {
    console.error("Error fetching EDIs:", error)
    return NextResponse.json({ error: "Error al obtener EDIs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const sql = getDb()
    const { nombre, departamento, distrito } = await request.json()

    if (!nombre || !departamento) {
      return NextResponse.json(
        { error: "Nombre y departamento son obligatorios" },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO edis (nombre, departamento, distrito)
      VALUES (${nombre}, ${departamento}, ${distrito || null})
      RETURNING id, nombre, departamento, distrito, activo, created_at
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating EDI:", error)
    return NextResponse.json({ error: "Error al crear EDI" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const sql = getDb()
    const { id, nombre, departamento, distrito, activo } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID es obligatorio" }, { status: 400 })
    }

    const result = await sql`
      UPDATE edis 
      SET nombre = ${nombre}, departamento = ${departamento}, distrito = ${distrito || null}, activo = ${activo}
      WHERE id = ${id}
      RETURNING id, nombre, departamento, distrito, activo, created_at
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating EDI:", error)
    return NextResponse.json({ error: "Error al actualizar EDI" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const sql = getDb()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID es obligatorio" }, { status: 400 })
    }

    await sql`UPDATE edis SET activo = false WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting EDI:", error)
    return NextResponse.json({ error: "Error al eliminar EDI" }, { status: 500 })
  }
}
