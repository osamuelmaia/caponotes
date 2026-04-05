import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { title, channel, format, hook, description, used } = body

  try {
    const idea = await prisma.contentIdea.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(channel !== undefined && { channel }),
        ...(format !== undefined && { format }),
        ...(hook !== undefined && { hook }),
        ...(description !== undefined && { description }),
        ...(used !== undefined && { used: Boolean(used) }),
      },
    })
    return NextResponse.json(idea)
  } catch {
    return NextResponse.json({ error: "Ideia não encontrada" }, { status: 404 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await prisma.contentIdea.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Ideia não encontrada" }, { status: 404 })
  }
}
