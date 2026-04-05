"use client"

import { useState } from "react"
import { toast } from "sonner"
import { TrendingUp, TrendingDown, Users, DollarSign, Star, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface WeeklyMetric {
  id: string
  week: string
  newSignups: number
  activeUsers: number
  revenue: number
  bestPost: string | null
  notes: string | null
}

interface MetricsClientProps {
  metrics: WeeklyMetric[]
  currentWeek: string
}

function GrowthCard({
  label,
  current,
  previous,
  format,
  icon: Icon,
}: {
  label: string
  current: number
  previous: number | null
  format: "number" | "currency"
  icon: React.ElementType
}) {
  const hasGrowth = previous !== null && previous > 0
  const growthPct = hasGrowth
    ? Math.round(((current - previous!) / previous!) * 100)
    : null
  const isPositive = growthPct !== null && growthPct >= 0
  const formattedValue =
    format === "currency"
      ? `R$ ${current.toLocaleString("pt-BR")}`
      : current.toLocaleString("pt-BR")

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[#888] uppercase tracking-wider font-medium">{label}</p>
        <Icon size={16} className="text-[#555]" />
      </div>
      <p className="text-3xl font-bold text-white">{formattedValue}</p>
      {growthPct !== null ? (
        <div
          className={cn(
            "flex items-center gap-1 mt-2 text-xs font-medium",
            isPositive ? "text-green-500" : "text-red-500"
          )}
        >
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>
            {isPositive ? "+" : ""}
            {growthPct}% vs semana anterior
          </span>
        </div>
      ) : (
        <p className="text-xs text-[#555] mt-2">Sem dados anteriores</p>
      )}
    </div>
  )
}

export function MetricsClient({ metrics, currentWeek }: MetricsClientProps) {
  const currentMetric = metrics.find((m) => m.week === currentWeek)
  const previousMetric = metrics.find((m) => m.week !== currentWeek)

  const [form, setForm] = useState({
    week: currentWeek,
    newSignups: String(currentMetric?.newSignups ?? ""),
    activeUsers: String(currentMetric?.activeUsers ?? ""),
    revenue: String(currentMetric?.revenue ?? ""),
    bestPost: currentMetric?.bestPost ?? "",
    notes: currentMetric?.notes ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [localMetrics, setLocalMetrics] = useState<WeeklyMetric[]>(metrics)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week: form.week,
          newSignups: Number(form.newSignups) || 0,
          activeUsers: Number(form.activeUsers) || 0,
          revenue: Number(form.revenue) || 0,
          bestPost: form.bestPost || null,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) throw new Error("Erro ao salvar")
      const updated = await res.json()
      setLocalMetrics((prev) => {
        const exists = prev.find((m) => m.week === updated.week)
        if (exists) return prev.map((m) => (m.week === updated.week ? updated : m))
        return [updated, ...prev].sort((a, b) => b.week.localeCompare(a.week))
      })
      toast.success("Métricas salvas!")
    } catch {
      toast.error("Erro ao salvar métricas")
    } finally {
      setSaving(false)
    }
  }

  const currentMetricLocal = localMetrics.find((m) => m.week === currentWeek)
  const prevMetricLocal = localMetrics.find((m) => m.week !== currentWeek)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Métricas</h1>
        <p className="text-sm text-[#888] mt-1">Acompanhamento semanal da comunidade</p>
      </div>

      {/* Growth comparison cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GrowthCard
          label="Novos cadastros"
          current={currentMetricLocal?.newSignups ?? 0}
          previous={prevMetricLocal?.newSignups ?? null}
          format="number"
          icon={Users}
        />
        <GrowthCard
          label="Receita"
          current={currentMetricLocal?.revenue ?? 0}
          previous={prevMetricLocal?.revenue ?? null}
          format="currency"
          icon={DollarSign}
        />
      </div>

      {/* Form */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-5">
          Registrar métricas
          <span className="ml-2 text-xs text-[#555] font-normal">{currentWeek}</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#666] mb-1.5">Novos cadastros</label>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                  type="number"
                  min="0"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-8 pr-3 py-2 text-sm text-white outline-none focus:border-[#555] transition-colors"
                  value={form.newSignups}
                  onChange={(e) => setForm((f) => ({ ...f, newSignups: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#666] mb-1.5">Usuários ativos</label>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                  type="number"
                  min="0"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-8 pr-3 py-2 text-sm text-white outline-none focus:border-[#555] transition-colors"
                  value={form.activeUsers}
                  onChange={(e) => setForm((f) => ({ ...f, activeUsers: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#666] mb-1.5">Receita (R$)</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                  type="number"
                  min="0"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-8 pr-3 py-2 text-sm text-white outline-none focus:border-[#555] transition-colors"
                  value={form.revenue}
                  onChange={(e) => setForm((f) => ({ ...f, revenue: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#666] mb-1.5">Melhor post da semana</label>
            <div className="relative">
              <Star size={14} className="absolute left-3 top-3 text-[#555]" />
              <input
                type="text"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-8 pr-3 py-2 text-sm text-white outline-none focus:border-[#555] transition-colors"
                value={form.bestPost}
                onChange={(e) => setForm((f) => ({ ...f, bestPost: e.target.value }))}
                placeholder="Título ou link do post que mais converteu..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#666] mb-1.5">Observações</label>
            <div className="relative">
              <FileText size={14} className="absolute left-3 top-3 text-[#555]" />
              <textarea
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-8 pr-3 py-2 text-sm text-white outline-none focus:border-[#555] transition-colors resize-none min-h-[80px]"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="O que funcionou? O que melhorar? Metas para a próxima semana..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-[#e5e5e5] transition-colors disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar métricas"}
          </button>
        </form>
      </div>

      {/* History table */}
      {localMetrics.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white mb-4">Histórico</h2>
          <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#222]">
                  <th className="text-left px-4 py-3 text-xs text-[#555] font-medium">Semana</th>
                  <th className="text-right px-4 py-3 text-xs text-[#555] font-medium">Cadastros</th>
                  <th className="text-right px-4 py-3 text-xs text-[#555] font-medium">Ativos</th>
                  <th className="text-right px-4 py-3 text-xs text-[#555] font-medium">Receita</th>
                  <th className="text-left px-4 py-3 text-xs text-[#555] font-medium hidden md:table-cell">
                    Melhor post
                  </th>
                </tr>
              </thead>
              <tbody>
                {localMetrics.map((metric, i) => {
                  const isCurrentWeek = metric.week === currentWeek
                  return (
                    <tr
                      key={metric.id}
                      className={cn(
                        "border-b border-[#1a1a1a] last:border-0 transition-colors",
                        isCurrentWeek ? "bg-[#1a1a1a]" : "hover:bg-[#151515]"
                      )}
                    >
                      <td className="px-4 py-3">
                        <span className="text-[#aaa]">{metric.week}</span>
                        {isCurrentWeek && (
                          <span className="ml-2 text-[10px] text-[#378ADD] font-medium">atual</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-white">{metric.newSignups}</td>
                      <td className="px-4 py-3 text-right text-white">{metric.activeUsers}</td>
                      <td className="px-4 py-3 text-right text-white">
                        R$ {metric.revenue.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-[#666] truncate max-w-[200px] hidden md:table-cell">
                        {metric.bestPost ?? "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
