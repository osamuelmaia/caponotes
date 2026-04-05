import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const metrics = await prisma.weeklyMetric.findMany({
    orderBy: { week: "desc" },
  })
  return NextResponse.json(metrics)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { week, newSignups, activeUsers, revenue, bestPost, notes } = body

  if (!week) {
    return NextResponse.json({ error: "Campo obrigatório: week" }, { status: 400 })
  }

  const metric = await prisma.weeklyMetric.upsert({
    where: { week },
    update: {
      ...(newSignups !== undefined && { newSignups: Number(newSignups) }),
      ...(activeUsers !== undefined && { activeUsers: Number(activeUsers) }),
      ...(revenue !== undefined && { revenue: Number(revenue) }),
      ...(bestPost !== undefined && { bestPost }),
      ...(notes !== undefined && { notes }),
    },
    create: {
      week,
      newSignups: Number(newSignups ?? 0),
      activeUsers: Number(activeUsers ?? 0),
      revenue: Number(revenue ?? 0),
      bestPost: bestPost ?? null,
      notes: notes ?? null,
    },
  })

  return NextResponse.json(metric)
}
