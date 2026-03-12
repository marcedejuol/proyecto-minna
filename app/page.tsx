import { SiteHeader } from "@/components/site-header"
import { EvaluationWizard } from "@/components/evaluation-wizard"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-balance text-foreground">
            Nueva Evaluación
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete el proceso de evaluación paso a paso: datos básicos, EAD-3, ECPP-P y resultados.
          </p>
        </div>
        <EvaluationWizard />
      </main>
    </div>
  )
}
