import { prisma } from "@/lib/prisma"
import { getCurrentWeek } from "@/lib/week"
import { MetricsClient } from "./metrics-client"

export const dynamic = "force-dynamic"

export default async function MetricasPage() {
  const metrics = await prisma.weeklyMetric.findMany({
    orderBy: { week: "desc" },
  })

  const currentWeek = getCurrentWeek()

  return <MetricsClient metrics={metrics} currentWeek={currentWeek} />
}
