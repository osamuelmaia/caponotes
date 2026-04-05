"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import * as Tabs from "@radix-ui/react-tabs"
import { ChevronLeft, ChevronRight, Copy, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { TaskCard, type Task } from "@/components/task-card"
import { ChannelBadge, CHANNEL_COLORS } from "@/components/channel-badge"
import { cn } from "@/lib/utils"
import { getPrevWeek, getNextWeek, getWeekLabel } from "@/lib/week"

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] as const
const CHANNELS = ["Twitter/X", "YouTube", "Telegram", "Discord", "Planejamento"] as const
const STATUSES = [
  { key: "todo", label: "A fazer", color: "#888" },
  { key: "inprogress", label: "Em andamento", color: "#F59E0B" },
  { key: "done", label: "Concluído", color: "#22C55E" },
] as const

interface AgendaClientProps {
  tasks: Task[]
  currentWeek: string
}

function DayProgress({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return null
  const done = tasks.filter((t) => t.status === "done").length
  const pct = Math.round((done / tasks.length) * 100)
  return (
    <div className="mt-2 mb-1">
      <div className="flex justify-between text-[10px] text-[#555] mb-1">
        <span>{done}/{tasks.length}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 bg-[#222] rounded-full overflow-hidden">
        <div className="h-full bg-[#378ADD] rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function AgendaClient({ tasks: initialTasks, currentWeek }: AgendaClientProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTab, setActiveTab] = useState("por-dia")
  const [channelFilter, setChannelFilter] = useState<string | null>(null)
  const [duplicating, setDuplicating] = useState(false)

  const weekLabel = getWeekLabel(currentWeek)
  const [year, wPart] = currentWeek.split("-W")
  const weekNum = parseInt(wPart, 10)

  const filteredTasks = channelFilter
    ? tasks.filter((t) => {
        try {
          const chs: string[] = JSON.parse(t.channels)
          return chs.includes(channelFilter)
        } catch {
          return t.channels === channelFilter
        }
      })
    : tasks

  const handleTaskUpdate = useCallback((updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }, [])

  function navigateWeek(direction: "prev" | "next") {
    const newWeek = direction === "prev" ? getPrevWeek(currentWeek) : getNextWeek(currentWeek)
    router.push(`/agenda?week=${newWeek}`)
  }

  async function duplicateWeek() {
    const nextWeek = getNextWeek(currentWeek)
    setDuplicating(true)
    try {
      const res = await fetch("/api/tasks/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromWeek: currentWeek, toWeek: nextWeek }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro ao duplicar")
      toast.success(`${data.created} tarefas copiadas para ${nextWeek}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao duplicar semana")
    } finally {
      setDuplicating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Agenda</h1>
          <p className="text-sm text-[#888] mt-1">
            Semana {weekNum} · {year} · {weekLabel}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigateWeek("prev")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#333] text-sm text-[#888] hover:text-white hover:border-[#555] transition-colors"
          >
            <ChevronLeft size={14} />
            Anterior
          </button>
          <button
            onClick={() => navigateWeek("next")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#333] text-sm text-[#888] hover:text-white hover:border-[#555] transition-colors"
          >
            Próxima
            <ChevronRight size={14} />
          </button>
          <button
            onClick={duplicateWeek}
            disabled={duplicating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#333] text-sm text-[#888] hover:text-white hover:border-[#555] transition-colors disabled:opacity-50"
          >
            <Copy size={14} />
            {duplicating ? "Copiando..." : "Duplicar semana"}
          </button>
        </div>
      </div>

      {/* Channel filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setChannelFilter(null)}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
            channelFilter === null
              ? "bg-white text-black border-white"
              : "border-[#333] text-[#888] hover:border-[#555] hover:text-white"
          )}
        >
          Todos
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
      </div>

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex gap-1 border-b border-[#222] mb-6">
          {[
            { value: "por-dia", label: "Por Dia" },
            { value: "por-canal", label: "Por Canal" },
            { value: "por-status", label: "Por Status" },
          ].map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab.value
                  ? "border-white text-white"
                  : "border-transparent text-[#666] hover:text-[#aaa]"
              )}
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Tab: Por Dia */}
        <Tabs.Content value="por-dia">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {DAYS.map((day) => {
              const isOffline = day === "Quinta"
              const dayTasks = filteredTasks.filter((t) => t.day === day)

              return (
                <div key={day} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wider",
                        isOffline ? "text-[#555]" : "text-[#888]"
                      )}
                    >
                      {day}
                    </h3>
                    {!isOffline && dayTasks.length > 0 && (
                      <span className="text-[10px] text-[#555]">
                        {dayTasks.filter((t) => t.status === "done").length}/{dayTasks.length}
                      </span>
                    )}
                  </div>

                  {isOffline ? (
                    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-3 text-center">
                      <p className="text-xs text-[#444] italic">Dia offline</p>
                    </div>
                  ) : (
                    <>
                      <DayProgress tasks={dayTasks} />
                      {dayTasks.length === 0 ? (
                        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-3 text-center">
                          <p className="text-[10px] text-[#444] italic">Sem tarefas</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {dayTasks.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onUpdate={handleTaskUpdate}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </Tabs.Content>

        {/* Tab: Por Canal */}
        <Tabs.Content value="por-canal">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {CHANNELS.map((channel) => {
              const channelTasks = filteredTasks.filter((t) => {
                try {
                  const chs: string[] = JSON.parse(t.channels)
                  return chs.includes(channel)
                } catch {
                  return t.channels === channel
                }
              })
              const done = channelTasks.filter((t) => t.status === "done").length

              return (
                <div key={channel} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ChannelBadge channel={channel} />
                    <span className="text-[10px] text-[#555] ml-auto">
                      {done}/{channelTasks.length}
                    </span>
                  </div>

                  {channelTasks.length > 0 && (
                    <div className="h-1 bg-[#222] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${channelTasks.length > 0 ? Math.round((done / channelTasks.length) * 100) : 0}%`,
                          background: CHANNEL_COLORS[channel] ?? "#888",
                        }}
                      />
                    </div>
                  )}

                  {channelTasks.length === 0 ? (
                    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-3 text-center">
                      <p className="text-[10px] text-[#444] italic">Sem tarefas</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {channelTasks.map((task) => (
                        <TaskCard key={task.id} task={task} onUpdate={handleTaskUpdate} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Tabs.Content>

        {/* Tab: Por Status */}
        <Tabs.Content value="por-status">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STATUSES.map(({ key, label, color }) => {
              const statusTasks = filteredTasks.filter((t) => t.status === key)

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {key === "done" && <CheckCircle2 size={14} style={{ color }} />}
                      <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
                        {label}
                      </h3>
                    </div>
                    <span className="text-[10px] text-[#555]">{statusTasks.length}</span>
                  </div>

                  <div
                    className="h-1 rounded-full"
                    style={{
                      background: statusTasks.length > 0 ? color : "#222",
                      opacity: statusTasks.length > 0 ? 0.6 : 1,
                    }}
                  />

                  {statusTasks.length === 0 ? (
                    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-3 text-center">
                      <p className="text-[10px] text-[#444] italic">Nenhuma tarefa</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {statusTasks.map((task) => (
                        <TaskCard key={task.id} task={task} onUpdate={handleTaskUpdate} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
