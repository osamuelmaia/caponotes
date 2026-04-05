import { cn } from "@/lib/utils"

export type TaskStatus = "todo" | "inprogress" | "done"

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "A fazer",
  inprogress: "Em andamento",
  done: "Concluído",
}

export const STATUS_COLORS: Record<TaskStatus, { text: string; bg: string; border: string }> = {
  todo: {
    text: "#888888",
    bg: "rgba(136,136,136,0.1)",
    border: "rgba(136,136,136,0.2)",
  },
  inprogress: {
    text: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.2)",
  },
  done: {
    text: "#22C55E",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.2)",
  },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const s = (status as TaskStatus) in STATUS_COLORS ? (status as TaskStatus) : "todo"
  const colors = STATUS_COLORS[s]
  const label = STATUS_LABELS[s]

  return (
    <span
      className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", className)}
      style={{ color: colors.text, backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
    >
      {label}
    </span>
  )
}

export function statusBorderColor(status: string): string {
  const s = (status as TaskStatus) in STATUS_COLORS ? (status as TaskStatus) : "todo"
  return STATUS_COLORS[s].text
}
