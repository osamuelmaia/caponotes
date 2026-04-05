"use client"

import { useState } from "react"
import { toast } from "sonner"
import * as Dialog from "@radix-ui/react-dialog"
import { X, Clock, Edit2 } from "lucide-react"
import { ChannelBadge } from "@/components/channel-badge"
import { StatusBadge, statusBorderColor, STATUS_LABELS, type TaskStatus } from "@/components/status-badge"
import { cn } from "@/lib/utils"

export interface Task {
  id: string
  name: string
  details?: string | null
  day: string
  timeSlot: string
  channels: string
  status: string
  week: string
  position: number
}

interface TaskCardProps {
  task: Task
  onUpdate?: (updated: Task) => void
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [localTask, setLocalTask] = useState<Task>(task)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(task.name)
  const [editDetails, setEditDetails] = useState(task.details ?? "")
  const [editStatus, setEditStatus] = useState<TaskStatus>(task.status as TaskStatus)
  const [saving, setSaving] = useState(false)

  const channels: string[] = (() => {
    try { return JSON.parse(localTask.channels) } catch { return [localTask.channels] }
  })()

  const isDone = localTask.status === "done"
  const borderColor = statusBorderColor(localTask.status)

  async function toggleDone() {
    const newStatus = isDone ? "todo" : "done"
    // Optimistic update
    const updated = { ...localTask, status: newStatus }
    setLocalTask(updated)
    onUpdate?.(updated)

    try {
      const res = await fetch(`/api/tasks/${localTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Falha ao atualizar")
      const data = await res.json()
      setLocalTask(data)
      onUpdate?.(data)
      toast.success(newStatus === "done" ? "Tarefa concluída!" : "Tarefa reaberta")
    } catch {
      // Revert
      setLocalTask(localTask)
      onUpdate?.(localTask)
      toast.error("Erro ao atualizar tarefa")
    }
  }

  async function saveEdit() {
    setSaving(true)
    try {
      const res = await fetch(`/api/tasks/${localTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, details: editDetails, status: editStatus }),
      })
      if (!res.ok) throw new Error("Falha ao salvar")
      const data = await res.json()
      setLocalTask(data)
      onUpdate?.(data)
      setEditing(false)
      toast.success("Tarefa atualizada!")
    } catch {
      toast.error("Erro ao salvar tarefa")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg bg-[#111111] border border-[#222222]",
          "hover:border-[#333333] transition-colors group",
          isDone && "opacity-60"
        )}
        style={{ borderLeft: `3px solid ${borderColor}` }}
      >
        {/* Checkbox */}
        <button
          onClick={toggleDone}
          className={cn(
            "mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 transition-colors",
            isDone
              ? "bg-green-500 border-green-500 flex items-center justify-center"
              : "border-[#444] hover:border-[#666]"
          )}
          aria-label={isDone ? "Marcar como não concluída" : "Marcar como concluída"}
        >
          {isDone && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <button
            className="text-left w-full"
            onClick={() => {
              setEditName(localTask.name)
              setEditDetails(localTask.details ?? "")
              setEditStatus(localTask.status as TaskStatus)
              setEditing(false)
              setOpen(true)
            }}
          >
            <p className={cn(
              "text-sm font-medium text-[#fafafa] leading-snug hover:text-white transition-colors",
              isDone && "line-through text-[#666]"
            )}>
              {localTask.name}
            </p>
          </button>

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {localTask.timeSlot && (
              <span className="flex items-center gap-1 text-[10px] text-[#666]">
                <Clock size={10} />
                {localTask.timeSlot}
              </span>
            )}
            {channels.map((ch) => (
              <ChannelBadge key={ch} channel={ch} small />
            ))}
          </div>
        </div>
      </div>

      {/* Detail / Edit Sheet */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-[#111111] border-l border-[#222222] shadow-2xl flex flex-col"
            style={{ outline: "none" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-[#222222]">
              <div className="flex-1 pr-4">
                {editing ? (
                  <input
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#555]"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <Dialog.Title className="text-base font-semibold text-white leading-snug">
                    {localTask.name}
                  </Dialog.Title>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {channels.map((ch) => (
                    <ChannelBadge key={ch} channel={ch} />
                  ))}
                  <StatusBadge status={localTask.status} />
                </div>
              </div>
              <Dialog.Close className="p-1.5 rounded-lg text-[#666] hover:text-white hover:bg-[#1a1a1a] transition-colors">
                <X size={18} />
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm text-[#888]">
                <Clock size={14} />
                <span>{localTask.day} · {localTask.timeSlot}</span>
              </div>

              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-[#666] mb-1.5">Status</label>
                    <select
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#555]"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                    >
                      {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#666] mb-1.5">Detalhes / Instruções</label>
                    <textarea
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#555] resize-none min-h-[160px]"
                      value={editDetails}
                      onChange={(e) => setEditDetails(e.target.value)}
                      placeholder="Adicione detalhes ou instruções..."
                    />
                  </div>
                </div>
              ) : (
                <div>
                  {localTask.details ? (
                    <div>
                      <p className="text-xs text-[#666] mb-2">Detalhes</p>
                      <p className="text-sm text-[#ccc] leading-relaxed whitespace-pre-wrap">
                        {localTask.details}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-[#555] italic">Sem detalhes adicionados.</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-[#222222] flex items-center gap-2">
              {editing ? (
                <>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="flex-1 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-[#e5e5e5] transition-colors disabled:opacity-50"
                  >
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 rounded-lg border border-[#333] text-sm text-[#888] hover:text-white hover:border-[#555] transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#333] text-sm text-[#888] hover:text-white hover:border-[#555] transition-colors"
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                  <button
                    onClick={toggleDone}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                      isDone
                        ? "bg-[#1a1a1a] text-[#888] border border-[#333] hover:border-[#555]"
                        : "bg-green-600 text-white hover:bg-green-500"
                    )}
                  >
                    {isDone ? "Reabrir tarefa" : "Marcar como concluída"}
                  </button>
                </>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
