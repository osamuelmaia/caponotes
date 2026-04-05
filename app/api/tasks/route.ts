import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const week = searchParams.get("week")
  const day = searchParams.get("day")
  const status = searchParams.get("status")

  const where: Record<string, string> = {}
  if (week) where.week = week
  if (day) where.day = day
  if (status) where.status = status

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  })

  return NextResponse.json(tasks)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, details, day, timeSlot, channels, status, week, position } = body

  if (!name || !day || !week) {
    return NextResponse.json({ error: "Campos obrigatórios: name, day, week" }, { status: 400 })
  }

  const task = await prisma.task.create({
    data: {
      name,
      details: details ?? null,
      day,
      timeSlot: timeSlot ?? "",
      channels: typeof channels === "string" ? channels : JSON.stringify(channels ?? []),
      status: status ?? "todo",
      week,
      position: position ?? 0,
    },
  })

  return NextResponse.json(task, { status: 201 })
}
