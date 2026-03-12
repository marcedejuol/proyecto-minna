"use client"

import React, { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  User,
  ClipboardList,
  Users,
  BarChart3,
} from "lucide-react"
import { Step1DatosBasicos, type DatosBasicosData } from "@/components/wizard-steps/step1-datos-basicos"
import { Step2Ead3, type Ead3Respuestas } from "@/components/wizard-steps/step2-ead3"
import { Step3Ecpp, type EcppRespuestas } from "@/components/wizard-steps/step3-ecpp"
import { Step4Resultados } from "@/components/wizard-steps/step4-resultados"
import { FileUpload, type UploadedFile } from "@/components/file-upload"
import {
  getEadItemsByEdad,
  ECPP_ITEMS,
  AREA_NAMES,
  clasificarPuntajeEAD,
  type ClasificacionDesarrollo,
} from "@/lib/evaluation-data"

const STEPS = [
  { id: 1, title: "Datos Basicos", icon: User },
  { id: 2, title: "EAD-3", icon: ClipboardList },
  { id: 3, title: "ECPP-P", icon: Users },
  { id: 4, title: "Resultados", icon: BarChart3 },
]

export function EvaluationWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [adjuntos, setAdjuntos] = useState<UploadedFile[]>([])

  // Step 1: Datos basicos
  const [datosBasicos, setDatosBasicos] = useState<DatosBasicosData>({
    departamento: "",
    distrito: "",
    nombre_edi: "",
    tipo_grupo: "",
    fecha_recoleccion: "",
    evaluador_id: "",
    id_nino: "",
    sexo: "",
    fecha_nacimiento: "",
    edad_meses: 0,
    rango_etario: "",
    asistencia_edi: "",
    id_cuidador: "",
    parentesco: "",
    edad_cuidador: 0,
    nivel_educativo: "",
    acepta_consentimiento: false,
  })

  // Step 2: EAD-3 respuestas
  const [ead3Respuestas, setEad3Respuestas] = useState<Ead3Respuestas>({})

  // Step 3: ECPP-P respuestas
  const [ecppRespuestas, setEcppRespuestas] = useState<EcppRespuestas>({})

  // Get EAD items based on child's age
  const eadItems = useMemo(() => {
    return getEadItemsByEdad(datosBasicos.edad_meses)
  }, [datosBasicos.edad_meses])

  // Calculate results
  const resultados = useMemo(() => {
    // EAD-3 por area
    const eadPorArea: Record<string, { correctos: number; total: number; clasificacion: ClasificacionDesarrollo }> = {}
    const areas = ["MG", "MF", "AL", "PS"] as const

    for (const area of areas) {
      const itemsArea = eadItems.filter(i => i.area === area)
      const correctos = itemsArea.reduce((sum, item) => sum + (ead3Respuestas[item.id] === 1 ? 1 : 0), 0)
      const total = itemsArea.length
      eadPorArea[area] = {
        correctos,
        total,
        clasificacion: clasificarPuntajeEAD(correctos, total),
      }
    }

    const eadTotalCorrectos = Object.values(eadPorArea).reduce((sum, a) => sum + a.correctos, 0)
    const eadTotalItems = Object.values(eadPorArea).reduce((sum, a) => sum + a.total, 0)

    // ECPP-P por dimension
    const ecppPorDimension: Record<string, { suma: number; items: number; promedio: number }> = {}
    const dimensiones = ["implicacion", "dedicacion", "ocio", "asesoramiento", "rol"] as const

    for (const dim of dimensiones) {
      const itemsDim = ECPP_ITEMS.filter(i => i.dimension === dim)
      const suma = itemsDim.reduce((s, item) => s + (ecppRespuestas[item.id] || 0), 0)
      ecppPorDimension[dim] = {
        suma,
        items: itemsDim.length,
        promedio: itemsDim.length > 0 ? suma / itemsDim.length : 0,
      }
    }

    const ecppTotal = Object.values(ecppPorDimension).reduce((sum, d) => sum + d.suma, 0)

    return {
      eadPorArea,
      eadTotalCorrectos,
      eadTotalItems,
      eadClasificacionGeneral: clasificarPuntajeEAD(eadTotalCorrectos, eadTotalItems),
      ecppPorDimension,
      ecppTotal,
      ecppPromedio: ECPP_ITEMS.length > 0 ? ecppTotal / ECPP_ITEMS.length : 0,
    }
  }, [eadItems, ead3Respuestas, ecppRespuestas])

  // Validation per step
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          datosBasicos.departamento &&
          datosBasicos.distrito &&
          datosBasicos.nombre_edi &&
          datosBasicos.tipo_grupo &&
          datosBasicos.fecha_recoleccion &&
          datosBasicos.evaluador_id &&
          datosBasicos.id_nino &&
          datosBasicos.sexo &&
          datosBasicos.fecha_nacimiento &&
          datosBasicos.rango_etario &&
          datosBasicos.asistencia_edi &&
          datosBasicos.id_cuidador &&
          datosBasicos.parentesco &&
          datosBasicos.edad_cuidador > 0 &&
          datosBasicos.nivel_educativo &&
          datosBasicos.acepta_consentimiento
        )
      case 2:
        // All EAD items must be answered
        return eadItems.every(item => ead3Respuestas[item.id] !== undefined)
      case 3:
        // All ECPP items must be answered
        return ECPP_ITEMS.every(item => ecppRespuestas[item.id] !== undefined)
      case 4:
        return true
      default:
        return false
    }
  }, [currentStep, datosBasicos, eadItems, ead3Respuestas, ecppRespuestas])

  const handleNext = () => {
    if (!canProceed()) {
      toast.error("Por favor complete todos los campos obligatorios antes de continuar.")
      return
    }
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        // Datos basicos
        departamento: datosBasicos.departamento,
        distrito: datosBasicos.distrito,
        nombre_edi: datosBasicos.nombre_edi,
        tipo_grupo: Number(datosBasicos.tipo_grupo),
        fecha_recoleccion: datosBasicos.fecha_recoleccion,
        evaluador_id: datosBasicos.evaluador_id,
        id_nino: datosBasicos.id_nino,
        sexo: Number(datosBasicos.sexo),
        fecha_nacimiento: datosBasicos.fecha_nacimiento,
        edad_meses: datosBasicos.edad_meses,
        rango_etario: Number(datosBasicos.rango_etario),
        asistencia_edi: Number(datosBasicos.asistencia_edi),
        id_cuidador: datosBasicos.id_cuidador,
        parentesco: Number(datosBasicos.parentesco),
        edad_cuidador: datosBasicos.edad_cuidador,
        nivel_educativo: Number(datosBasicos.nivel_educativo),
        acepta_consentimiento: 1,
        // EAD-3 scores
        ead_motor: resultados.eadPorArea.MG?.correctos || 0,
        ead_lenguaje: resultados.eadPorArea.AL?.correctos || 0,
        ead_cognitivo: resultados.eadPorArea.MF?.correctos || 0,
        ead_socioemocional: resultados.eadPorArea.PS?.correctos || 0,
        ead_total: resultados.eadTotalCorrectos,
        // ECPP-P scores
        ecpp_vinculo: resultados.ecppPorDimension.dedicacion?.suma || 0,
        ecpp_estimulo: resultados.ecppPorDimension.implicacion?.suma || 0,
        ecpp_cuidados: resultados.ecppPorDimension.ocio?.suma || 0,
        ecpp_total: resultados.ecppTotal,
        // Adjuntos
        adjuntos,
      }

      const res = await fetch("/api/registros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al guardar")
      }

      toast.success("Evaluacion guardada exitosamente")
      router.push("/datos")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar la evaluacion")
    } finally {
      setLoading(false)
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="flex flex-col gap-6">
      {/* Progress indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex justify-between">
            {STEPS.map((step) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center gap-2 ${
                    isActive ? "text-primary" : isCompleted ? "text-primary/70" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCompleted
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-muted-foreground/30 bg-muted"
                    }`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <Step1DatosBasicos data={datosBasicos} onChange={setDatosBasicos} />
        )}
        {currentStep === 2 && (
          <Step2Ead3
            edadMeses={datosBasicos.edad_meses}
            respuestas={ead3Respuestas}
            onChange={setEad3Respuestas}
          />
        )}
        {currentStep === 3 && (
          <Step3Ecpp respuestas={ecppRespuestas} onChange={setEcppRespuestas} />
        )}
        {currentStep === 4 && (
          <div className="flex flex-col gap-6">
            <Step4Resultados
              datosBasicos={datosBasicos}
              resultados={resultados}
            />
            {/* Adjuntos section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adjuntos (Opcional)</CardTitle>
                <CardDescription>Documentos y fotos asociados a esta evaluacion</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload files={adjuntos} onChange={setAdjuntos} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || loading}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        {currentStep < 4 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Guardar Evaluacion
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
