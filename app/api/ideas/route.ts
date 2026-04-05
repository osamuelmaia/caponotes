import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get("channel")
  const usedParam = searchParams.get("used")

  const where: Record<string, unknown> = {}
  if (channel) where.channel = channel
  if (usedParam !== null) where.used = usedParam === "true"

  const ideas = await prisma.contentIdea.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(ideas)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, channel, format, hook, description } = body

  if (!title || !channel || !format) {
    return NextResponse.json(
      { error: "Campos obrigatórios: title, channel, format" },
      { status: 400 }
    )
  }

  const idea = await prisma.contentIdea.create({
    data: {
      title,
      channel,
      format,
      hook: hook ?? null,
      description: description ?? null,
    },
  })

  return NextResponse.json(idea, { status: 201 })
}
