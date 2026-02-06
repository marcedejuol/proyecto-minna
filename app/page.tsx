import { SiteHeader } from "@/components/site-header"
import { RegistroForm } from "@/components/registro-form"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-balance text-foreground">
            Formulario de Registro
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete todos los campos obligatorios (*) para registrar una nueva evaluacion.
          </p>
        </div>
        <RegistroForm />
      </main>
    </div>
  )
}
