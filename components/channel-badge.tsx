import { cn } from "@/lib/utils"

export const CHANNEL_COLORS: Record<string, string> = {
  "Twitter/X": "#378ADD",
  "YouTube": "#E24B4A",
  "Telegram": "#1D9E75",
  "Discord": "#7F77DD",
  "Planejamento": "#BA7517",
}

export const CHANNEL_BG: Record<string, string> = {
  "Twitter/X": "rgba(55,138,221,0.15)",
  "YouTube": "rgba(226,75,74,0.15)",
  "Telegram": "rgba(29,158,117,0.15)",
  "Discord": "rgba(127,119,221,0.15)",
  "Planejamento": "rgba(186,117,23,0.15)",
}

interface ChannelBadgeProps {
  channel: string
  className?: string
  small?: boolean
}

export function ChannelBadge({ channel, className, small }: ChannelBadgeProps) {
  const color = CHANNEL_COLORS[channel] ?? "#666666"
  const bg = CHANNEL_BG[channel] ?? "rgba(102,102,102,0.15)"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium whitespace-nowrap",
        small ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        className
      )}
      style={{ color, backgroundColor: bg, border: `1px solid ${color}30` }}
    >
      {channel}
    </span>
  )
}
