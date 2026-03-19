"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ClipboardList, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Formulario", icon: ClipboardList },
  { href: "/datos", label: "Datos y Gráficos", icon: BarChart3 },
  { href: "/admin/edis", label: "Admin", icon: Settings },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <ClipboardList className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-foreground">MINNA-FEEI</span>
            <span className="text-xs leading-tight text-muted-foreground">Desarrollo Infantil</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
