/**
 * Returns the ISO week number for a given date.
 * ISO 8601: week starts on Monday, first week contains the first Thursday.
 */
function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { week: weekNo, year: d.getUTCFullYear() }
}

/**
 * Returns the current ISO week string in "YYYY-WNN" format, e.g. "2025-W14"
 */
export function getCurrentWeek(): string {
  const { week, year } = getISOWeek(new Date())
  return `${year}-W${String(week).padStart(2, "0")}`
}

/**
 * Returns a human-readable label for a week string like "2025-W14"
 * e.g. "06 a 11 de Janeiro"
 */
export function getWeekLabel(week: string): string {
  const { monday } = getWeekBounds(week)

  const saturday = new Date(monday)
  saturday.setDate(monday.getDate() + 5)

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  const startDay = String(monday.getDate()).padStart(2, "0")
  const endDay = String(saturday.getDate()).padStart(2, "0")

  if (monday.getMonth() === saturday.getMonth()) {
    return `${startDay} a ${endDay} de ${monthNames[monday.getMonth()]}`
  } else {
    return `${startDay} de ${monthNames[monday.getMonth()]} a ${endDay} de ${monthNames[saturday.getMonth()]}`
  }
}

/**
 * Returns the Monday Date for a given week string
 */
function getWeekBounds(week: string): { monday: Date } {
  const [yearStr, weekStr] = week.split("-W")
  const year = parseInt(yearStr, 10)
  const weekNum = parseInt(weekStr, 10)

  // Jan 4th is always in week 1 (ISO)
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Day = jan4.getUTCDay() || 7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1) + (weekNum - 1) * 7)

  return { monday }
}

/**
 * Returns the previous week string
 */
export function getPrevWeek(week: string): string {
  const { monday } = getWeekBounds(week)
  const prevMonday = new Date(monday)
  prevMonday.setUTCDate(monday.getUTCDate() - 7)
  const { week: w, year } = getISOWeek(prevMonday)
  return `${year}-W${String(w).padStart(2, "0")}`
}

/**
 * Returns the next week string
 */
export function getNextWeek(week: string): string {
  const { monday } = getWeekBounds(week)
  const nextMonday = new Date(monday)
  nextMonday.setUTCDate(monday.getUTCDate() + 7)
  const { week: w, year } = getISOWeek(nextMonday)
  return `${year}-W${String(w).padStart(2, "0")}`
}

/**
 * Returns the current day of week in Portuguese
 */
export function getDayOfWeek(): string {
  const day = new Date().getDay() // 0=Sunday, 1=Monday...
  const map: Record<number, string> = {
    1: "Segunda",
    2: "Terça",
    3: "Quarta",
    4: "Quinta",
    5: "Sexta",
    6: "Sábado",
    0: "Domingo",
  }
  return map[day] ?? "Segunda"
}
