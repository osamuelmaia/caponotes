import { prisma } from "@/lib/prisma"
import { IdeasClient } from "./ideas-client"

export const dynamic = "force-dynamic"

export default async function IdeiasPage() {
  const ideas = await prisma.contentIdea.findMany({
    orderBy: { createdAt: "desc" },
  })

  return <IdeasClient ideas={ideas} />
}
