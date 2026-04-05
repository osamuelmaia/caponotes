"use client"

import { useState } from "react"
import { toast } from "sonner"
import * as Dialog from "@radix-ui/react-dialog"
import { Plus, X, Check } from "lucide-react"
import { ChannelBadge, CHANNEL_COLORS } from "@/components/channel-badge"
import { cn } from "@/lib/utils"

interface ContentIdea {
  id: string
  title: string
  channel: string
  format: string
  hook: string | null
  used: boolean
  createdAt: string | Date
}

interface IdeasClientProps {
  ideas: ContentIdea[]
}

const CHANNELS = ["Twitter/X", "YouTube", "Telegram", "Discord", "Planejamento"] as const

const FORMAT_COLORS: Record<string, string> = {
  Thread: "#378ADD",
  Tutorial: "#E24B4A",
  Print: "#1D9E75",
  Bastidor: "#7F77DD",
  CTA: "#BA7517",
  Erro: "#F59E0B",
  Case: "#22C55E",
  Provocação: "#F43F5E",
}

function FormatBadge({ format }: { format: string }) {
  const color = FORMAT_COLORS[format] ?? "#666"
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium"
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}30`,
      }}
    >
      {format}
    </span>
  )
}

export function IdeasClient({ ideas: initialIdeas }: IdeasClientProps) {
  const [ideas, setIdeas] = useState<ContentIdea[]>(initialIdeas)
  const [channelFilter, setChannelFilter] = useState<string | null>(null)
  const [usedFilter, setUsedFilter] = useState<boolean | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: "",
    channel: "Twitter/X",
    format: "Thread",
    hook: "",
  })

  const filtered = ideas.filter((idea) => {
    if (channelFilter && idea.channel !== channelFilter) return false
    if (usedFilter !== null && idea.used !== usedFilter) return false
    return true
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          channel: form.channel,
          format: form.format,
          hook: form.hook || null,
        }),
      })
      if (!res.ok) throw new Error("Erro ao criar")
      const created = await res.json()
      setIdeas((prev) => [created, ...prev])
      toast.success("Ideia criada!")
      setModalOpen(false)
      setForm({ title: "", channel: "Twitter/X", format: "Thread", hook: "" })
    } catch {
      toast.error("Erro ao criar ideia")
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleUsed(idea: ContentIdea) {
    const newUsed = !idea.used
    // Optimistic update
    setIdeas((prev) =>
      prev.map((i) => (i.id === idea.id ? { ...i, used: newUsed } : i))
    )
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ used: newUsed }),
      })
      if (!res.ok) throw new Error("Erro ao atualizar")
      const updated = await res.json()
      setIdeas((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      toast.success(newUsed ? "Ideia marcada como usada!" : "Ideia reativada")
    } catch {
      setIdeas((prev) =>
        prev.map((i) => (i.id === idea.id ? { ...i, used: idea.used } : i))
      )
      toast.error("Erro ao atualizar ideia")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Banco de Ideias</h1>
          <p className="text-sm text-[#888] mt-1">
            {ideas.length} ideias · {ideas.filter((i) => !i.used).length} disponíveis
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-[#e5e5e5] transition-colors"
        >
          <Plus size={16} />
          Nova ideia
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Channel filters */}
        <button
          onClick={() => setChannelFilter(null)}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
            channelFilter === null
              ? "bg-white text-black border-white"
              : "border-[#333] text-[#888] hover:border-[#555] hover:text-white"
          )}
        >
          Todos canais
        </button>
        {CHANNELS.map((ch) => (
          <button
            key={ch}
            onClick={() => setChannelFilter(channelFilter === ch ? null : ch)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
              channelFilter === ch ? "opacity-100" : "opacity-60 hover:opacity-90"
            )}
            style={
              channelFilter === ch
                ? {
                    color: CHANNEL_COLORS[ch],
                    borderColor: CHANNEL_COLORS[ch],
                    background: `${CHANNEL_COLORS[ch]}18`,
                  }
                : { color: "#888", borderColor: "#333" }
            }
          >
            {ch}
          </button>
        ))}

        <div className="w-px bg-[#333] self-stretch mx-1" />

        {/* Used filters */}
        <button
          onClick={() => setUsedFilter(usedFilter === false ? null : false)}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
            usedFilter === false
              ? "bg-green-500/20 border-green-500/50 text-green-400"
              : "border-[#333] text-[#888] hover:border-[#555] hover:text-white"
          )}
        >
          Disponíveis
        </button>
        <button
          onClick={() => setUsedFilter(usedFilter === true ? null : true)}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
            usedFilter === true
              ? "bg-[#555]/20 border-[#555] text-[#888]"
              : "border-[#333] text-[#888] hover:border-[#555] hover:text-white"
          )}
        >
          Usadas
        </button>
      </div>

      {/* Ideas grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-12 text-center">
          <p className="text-[#555] text-sm">Nenhuma ideia encontrada com esses filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((idea) => (
            <div
              key={idea.id}
              className={cn(
                "bg-[#111111] border border-[#222222] rounded-xl p-4 flex flex-col gap-3",
                "hover:border-[#333] transition-colors",
                idea.used && "opacity-50"
              )}
            >
              {/* Channel + Format */}
              <div className="flex items-center gap-2 flex-wrap">
                <ChannelBadge channel={idea.channel} small />
                <FormatBadge format={idea.format} />
              </div>

              {/* Title */}
              <p className={cn(
                "text-sm font-medium text-white leading-snug",
                idea.used && "line-through"
              )}>
                {idea.title}
              </p>

              {/* Hook */}
              {idea.hook && (
                <p className="text-xs text-[#666] italic leading-snug">
                  &ldquo;{idea.hook}&rdquo;
                </p>
              )}

              {/* Used toggle */}
              <div className="mt-auto pt-2 border-t border-[#1a1a1a]">
                <button
                  onClick={() => toggleUsed(idea)}
                  className={cn(
                    "flex items-center gap-2 text-xs font-medium transition-colors",
                    idea.used
                      ? "text-[#555] hover:text-[#888]"
                      : "text-[#666] hover:text-green-400"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                      idea.used
                        ? "bg-[#555] border-[#555]"
                        : "border-[#444] hover:border-[#666]"
                    )}
                  >
                    {idea.used && <Check size={10} className="text-white" />}
                  </div>
                  {idea.used ? "Usada" : "Marcar como usada"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New idea modal */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#111111] border border-[#222222] rounded-xl shadow-2xl"
            style={{ outline: "none" }}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#222]">
              <Dialog.Title className="text-base font-semibold text-white">
                Nova ideia de conteúdo
              </Dialog.Title>
              <Dialog.Close className="p-1.5 rounded-lg text-[#666] hover:text-white hover:bg-[#1a1a1a] transition-colors">
                <X size={18} />
              </Dialog.Close>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-[#666] mb-1.5">Título *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#555] transition-colors"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Título da ideia de conteúdo..."
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#666] mb-1.5">Canal *</label>
                  <select
                    required
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#555] transition-colors"
                    value={form.channel}
                    onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}
                  >
                    {CHANNELS.map((ch) => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#666] mb-1.5">Formato *</label>
                  <select
                    required
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#555] transition-colors"
                    value={form.format}
                    onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
                  >
                    {Object.keys(FORMAT_COLORS).map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#666] mb-1.5">Hook (frase de abertura)</label>
                <input
                  type="text"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#555] transition-colors"
                  value={form.hook}
                  onChange={(e) => setForm((f) => ({ ...f, hook: e.target.value }))}
                  placeholder="A frase que vai parar o scroll..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-[#e5e5e5] transition-colors disabled:opacity-50"
                >
                  {submitting ? "Criando..." : "Criar ideia"}
                </button>
                <Dialog.Close
                  type="button"
                  className="px-4 py-2 rounded-lg border border-[#333] text-sm text-[#888] hover:text-white hover:border-[#555] transition-colors"
                >
                  Cancelar
                </Dialog.Close>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
