"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface Registro {
  id_registro: number
  departamento: string
  distrito: string
  nombre_edi: string
  tipo_grupo: number
  fecha_recoleccion: string
  evaluador_id: string
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
  ead_motor: number
  ead_lenguaje: number
  ead_cognitivo: number
  ead_socioemocional: number
  ead_total: number
  ecpp_vinculo: number
  ecpp_estimulo: number
  ecpp_cuidados: number
  ecpp_total: number
  created_at: string
}

const sexoLabels: Record<number, string> = { 1: "M", 2: "F" }
const rangoLabels: Record<number, string> = {
  1: "0-11m",
  2: "12-23m",
  3: "24-36m",
}
const parentescoLabels: Record<number, string> = {
  1: "Madre",
  2: "Padre",
  3: "Tutor/a",
}
const nivelLabels: Record<number, string> = {
  1: "Ninguno",
  2: "Primaria",
  3: "Secundaria",
  4: "Terciaria",
}
const tipoGrupoLabels: Record<number, string> = {
  1: "Intervencion",
  2: "Control",
}

export function DatosTable({ data }: { data: Registro[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            No se encontraron registros. Use el formulario para agregar datos.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[60px] font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Departamento</TableHead>
                  <TableHead className="font-semibold">Distrito</TableHead>
                  <TableHead className="font-semibold">EDI</TableHead>
                  <TableHead className="font-semibold">Grupo</TableHead>
                  <TableHead className="font-semibold">Sexo</TableHead>
                  <TableHead className="font-semibold">Edad (m)</TableHead>
                  <TableHead className="font-semibold">Rango</TableHead>
                  <TableHead className="font-semibold">Parentesco</TableHead>
                  <TableHead className="font-semibold">Nivel Educ.</TableHead>
                  <TableHead className="text-right font-semibold">EAD Motor</TableHead>
                  <TableHead className="text-right font-semibold">EAD Leng.</TableHead>
                  <TableHead className="text-right font-semibold">EAD Cog.</TableHead>
                  <TableHead className="text-right font-semibold">EAD Soc.</TableHead>
                  <TableHead className="text-right font-semibold">EAD Total</TableHead>
                  <TableHead className="text-right font-semibold">ECPP Vinc.</TableHead>
                  <TableHead className="text-right font-semibold">ECPP Est.</TableHead>
                  <TableHead className="text-right font-semibold">ECPP Cuid.</TableHead>
                  <TableHead className="text-right font-semibold">ECPP Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id_registro} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{row.id_registro}</TableCell>
                    <TableCell className="text-sm">{row.departamento}</TableCell>
                    <TableCell className="text-sm">{row.distrito}</TableCell>
                    <TableCell className="max-w-[120px] truncate text-sm">{row.nombre_edi}</TableCell>
                    <TableCell>
                      <Badge
                        variant={row.tipo_grupo === 1 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {tipoGrupoLabels[row.tipo_grupo]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {sexoLabels[row.sexo]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm">{row.edad_meses}</TableCell>
                    <TableCell className="text-sm">{rangoLabels[row.rango_etario]}</TableCell>
                    <TableCell className="text-sm">{parentescoLabels[row.parentesco]}</TableCell>
                    <TableCell className="text-sm">{nivelLabels[row.nivel_educativo]}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.ead_motor}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.ead_lenguaje}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.ead_cognitivo}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.ead_socioemocional}</TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">{row.ead_total}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.ecpp_vinculo}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.ecpp_estimulo}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.ecpp_cuidados}</TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">{row.ecpp_total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
