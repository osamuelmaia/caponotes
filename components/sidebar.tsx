"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, BarChart2, Lightbulb, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCurrentWeek } from "@/lib/week"
import { useState } from "react"

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/metricas", label: "Métricas", icon: BarChart2 },
  { href: "/ideias", label: "Banco de Ideias", icon: Lightbulb },
]

function WeekLabel() {
  const week = getCurrentWeek()
  // e.g. "2026-W14" → "Semana 14 · 2026"
  const [year, wPart] = week.split("-W")
  const weekNum = parseInt(wPart, 10)
  return (
    <span className="text-xs text-[#666]">
      Semana {weekNum} · {year}
    </span>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-[#111111] border border-[#222222] text-[#fafafa]"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-60 flex flex-col",
          "bg-[#111111] border-r border-[#222222]",
          "transition-transform duration-200 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-[#222222]">
          <span className="text-lg font-bold text-white tracking-tight">
            🏴 Yomescapo
          </span>
          <p className="text-xs text-[#666] mt-0.5">Capo Community</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#1a1a1a] text-white border border-[#333333]"
                    : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
                )}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-[#666]"} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#222222]">
          <WeekLabel />
        </div>
      </aside>
    </>
  )
}
