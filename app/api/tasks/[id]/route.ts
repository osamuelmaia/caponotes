import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { name, details, status, day, timeSlot, channels, position } = body

  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(details !== undefined && { details }),
        ...(status !== undefined && { status }),
        ...(day !== undefined && { day }),
        ...(timeSlot !== undefined && { timeSlot }),
        ...(channels !== undefined && {
          channels: typeof channels === "string" ? channels : JSON.stringify(channels),
        }),
        ...(position !== undefined && { position }),
      },
    })
    return NextResponse.json(task)
  } catch {
    return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await prisma.task.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
  }
}
