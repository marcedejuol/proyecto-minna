"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Download, X, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    const dismissed = sessionStorage.getItem("pwa-install-dismissed")
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Small delay so the page loads first
      setTimeout(() => setShowPrompt(true), 2000)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // Also detect if installed after the fact
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setIsInstalled(true)
    }
    setShowPrompt(false)
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setShowPrompt(false)
    sessionStorage.setItem("pwa-install-dismissed", "true")
  }, [])

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed silently
      })
    }
  }, [])

  if (isInstalled || !showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Smartphone className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">
              Instalar MINNA-FEEI
            </h3>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Agrega esta aplicacion a tu pantalla de inicio para acceder rapidamente sin necesidad de abrir el navegador.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleInstall}
                className="gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Instalar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs text-muted-foreground"
              >
                Ahora no
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
