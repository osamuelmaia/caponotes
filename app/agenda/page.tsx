import { prisma } from "@/lib/prisma"
import { getCurrentWeek } from "@/lib/week"
import { AgendaClient } from "./agenda-client"
import type { Task } from "@/components/task-card"

export const dynamic = "force-dynamic"

interface AgendaPageProps {
  searchParams: Promise<{ week?: string }>
}

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const { week: weekParam } = await searchParams
  const week = weekParam || getCurrentWeek()

  const tasks = await prisma.task.findMany({
    where: { week },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  })

  return <AgendaClient tasks={tasks as Task[]} currentWeek={week} />
}
