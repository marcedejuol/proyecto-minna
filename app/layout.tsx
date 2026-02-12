import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { PwaInstallPrompt } from "@/components/pwa-install-prompt"

import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MINNA-FEEI | Sistema de Registro",
  description:
    "Sistema de recoleccion de datos para el diagnostico, evaluacion y seguimiento del desarrollo infantil - MINNA / FEEI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MINNA-FEEI",
  },
}

export const viewport: Viewport = {
  themeColor: "#1d6cc1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icon-512.jpg" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        {children}
        <PwaInstallPrompt />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
