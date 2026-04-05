import { prisma } from "@/lib/prisma"
import { getCurrentWeek, getDayOfWeek, getWeekLabel } from "@/lib/week"
import { TaskCard, type Task } from "@/components/task-card"
import { CheckCircle2, TrendingUp, Zap } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const currentWeek = getCurrentWeek()
  const today = getDayOfWeek()

  const [todayTasks, weekTasks] = await Promise.all([
    prisma.task.findMany({
      where: { week: currentWeek, day: today },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    }),
    prisma.task.findMany({
      where: { week: currentWeek },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    }),
  ])

  const todayDone = todayTasks.filter((t) => t.status === "done").length
  const weekDone = weekTasks.filter((t) => t.status === "done").length
  const weekTotal = weekTasks.length
  const weekProgress = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0

  const nextTask = todayTasks.find((t) => t.status !== "done")

  const weekLabel = getWeekLabel(currentWeek)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-[#888] mt-1">
          {today} · {weekLabel}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tasks done today */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#888] uppercase tracking-wider font-medium">Hoje</p>
            <CheckCircle2 size={18} className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-white">
            {todayDone}
            <span className="text-lg text-[#555] font-normal">/{todayTasks.length}</span>
          </p>
          <p className="text-xs text-[#666] mt-1">
            {todayTasks.length === 0
              ? "Sem tarefas hoje"
              : todayDone === todayTasks.length
              ? "Tudo concluído!"
              : `${todayTasks.length - todayDone} restantes`}
          </p>
        </div>

        {/* Week progress */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#888] uppercase tracking-wider font-medium">Semana</p>
            <TrendingUp size={18} className="text-[#378ADD]" />
          </div>
          <p className="text-3xl font-bold text-white">
            {weekProgress}
            <span className="text-lg text-[#555] font-normal">%</span>
          </p>
          <p className="text-xs text-[#666] mt-1">
            {weekDone} de {weekTotal} tarefas concluídas
          </p>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-[#222] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#378ADD] rounded-full transition-all duration-500"
              style={{ width: `${weekProgress}%` }}
            />
          </div>
        </div>

        {/* Next task */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#888] uppercase tracking-wider font-medium">Próxima tarefa</p>
            <Zap size={18} className="text-[#F59E0B]" />
          </div>
          {nextTask ? (
            <>
              <p className="text-sm font-medium text-white leading-snug line-clamp-2">
                {nextTask.name}
              </p>
              <p className="text-xs text-[#666] mt-1">{nextTask.timeSlot}</p>
            </>
          ) : (
            <p className="text-sm text-[#555] italic">
              {todayTasks.length === 0 ? "Nenhuma tarefa hoje" : "Tudo feito por hoje! 🎉"}
            </p>
          )}
        </div>
      </div>

      {/* Today's tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">
            Tarefas de hoje
            {todayTasks.length > 0 && (
              <span className="ml-2 text-xs text-[#666] font-normal">
                ({today})
              </span>
            )}
          </h2>
          {todayTasks.length > 0 && (
            <span className="text-xs text-[#555]">
              {todayDone}/{todayTasks.length}
            </span>
          )}
        </div>

        {todayTasks.length === 0 ? (
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 text-center">
            <p className="text-[#555] text-sm">Nenhuma tarefa para hoje ({today}).</p>
            <p className="text-[#444] text-xs mt-1">Aproveite ou vá para a Agenda para adicionar tarefas.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((task) => (
              <TaskCard key={task.id} task={task as Task} />
            ))}
          </div>
        )}
      </div>

      {/* Week overview */}
      {weekTasks.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-white mb-4">
            Visão geral da semana
            <span className="ml-2 text-xs text-[#666] font-normal">{currentWeek}</span>
          </h2>
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#888]">Progresso semanal</span>
              <span className="text-sm font-medium text-white">{weekProgress}%</span>
            </div>
            <div className="h-2 bg-[#222] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${weekProgress}%`,
                  background: weekProgress === 100
                    ? "#22C55E"
                    : weekProgress >= 60
                    ? "#378ADD"
                    : "#F59E0B",
                }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-[#555]">{weekDone} concluídas</span>
              <span className="text-xs text-[#555]">{weekTotal - weekDone} pendentes</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
