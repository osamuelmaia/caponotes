import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { fromWeek, toWeek } = body

  if (!fromWeek || !toWeek) {
    return NextResponse.json({ error: "Campos obrigatórios: fromWeek, toWeek" }, { status: 400 })
  }

  // Check if destination week already has tasks
  const existingCount = await prisma.task.count({ where: { week: toWeek } })
  if (existingCount > 0) {
    return NextResponse.json(
      { error: `A semana ${toWeek} já possui ${existingCount} tarefas. Limpe antes de duplicar.` },
      { status: 409 }
    )
  }

  const sourceTasks = await prisma.task.findMany({
    where: { week: fromWeek },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  })

  if (sourceTasks.length === 0) {
    return NextResponse.json({ error: `Nenhuma tarefa encontrada em ${fromWeek}` }, { status: 404 })
  }

  const created = await prisma.$transaction(
    sourceTasks.map((task: (typeof sourceTasks)[number]) =>
      prisma.task.create({
        data: {
          name: task.name,
          details: task.details,
          day: task.day,
          timeSlot: task.timeSlot,
          channels: task.channels,
          status: "todo",
          week: toWeek,
          position: task.position,
        },
      })
    )
  )

  return NextResponse.json({ created: created.length, week: toWeek }, { status: 201 })
}
