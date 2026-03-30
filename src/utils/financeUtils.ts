import { Project, IncomeItem, ExpenseItem } from '../store/projectsSlice'
import { CompanyExpense } from '../store/companyExpensesSlice'

export interface CashFlowPoint {
  date: string
  balance: number
}

/**
 * Расчёт плановой маржи проекта
 * = contractAmount - сумма всех плановых расходов (без учёта paid)
 */
export function calculatePlannedMargin(project: Project): number {
  const totalExpenses = project.expenseSchedule.reduce((sum, e) => sum + e.amount, 0)
  return project.contractAmount - totalExpenses
}

/**
 * Расчёт плановой рентабельности (%)
 */
export function calculatePlannedProfitability(project: Project): number {
  if (project.contractAmount === 0) return 0
  const margin = calculatePlannedMargin(project)
  return (margin / project.contractAmount) * 100
}

/**
 * Расчёт фактической маржи (на основе фактически оплаченных доходов и расходов)
 */
export function calculateActualMargin(project: Project): number {
  return project.actualIncome - project.actualExpenses
}

/**
 * Расчёт фактической рентабельности (%)
 * если actualIncome = 0, возвращаем 0
 */
export function calculateActualProfitability(project: Project): number {
  if (project.actualIncome === 0) return 0
  const margin = calculateActualMargin(project)
  return (margin / project.actualIncome) * 100
}

/**
 * Расчёт накопленного денежного потока по проекту
 * возвращает массив точек { date, balance }
 */
export function calculateCashFlow(project: Project): CashFlowPoint[] {
  const allEvents: { date: string; amount: number }[] = []
  // доходы (положительные)
  project.incomeSchedule.forEach(i => allEvents.push({ date: i.date, amount: i.amount }))
  // расходы (отрицательные)
  project.expenseSchedule.forEach(e => allEvents.push({ date: e.date, amount: -e.amount }))

  // сортируем по дате
  allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  let balance = 0
  const result: CashFlowPoint[] = []
  for (const event of allEvents) {
    balance += event.amount
    result.push({ date: event.date, balance })
  }
  return result
}

/**
 * Находит ближайший кассовый разрыв (первая дата, где баланс становится отрицательным)
 * Возвращает { date, deficit } или null, если разрыва нет
 */
export function findNearestCashGap(project: Project): { date: string; deficit: number } | null {
  const flow = calculateCashFlow(project)
  for (const point of flow) {
    if (point.balance < 0) {
      return { date: point.date, deficit: Math.abs(point.balance) }
    }
  }
  return null
}

/**
 * Расчёт кассового разрыва по компании (проекты + общехозяйственные расходы)
 * projects: массив проектов
 * companyExpenses: массив общехозяйственных расходов
 * возвращает массив точек { date, balance }
 */
export function calculateCompanyCashFlow(projects: Project[], companyExpenses: CompanyExpense[]): CashFlowPoint[] {
  const allEvents: { date: string; amount: number }[] = []

  // доходы и расходы по проектам
  projects.forEach(project => {
    project.incomeSchedule.forEach(i => allEvents.push({ date: i.date, amount: i.amount }))
    project.expenseSchedule.forEach(e => allEvents.push({ date: e.date, amount: -e.amount }))
  })

  // общехозяйственные расходы
  companyExpenses.forEach(ce => {
    allEvents.push({ date: ce.date, amount: -ce.amount })
  })

  // сортируем по дате
  allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  let balance = 0
  const result: CashFlowPoint[] = []
  for (const event of allEvents) {
    balance += event.amount
    result.push({ date: event.date, balance })
  }
  return result
}

/**
 * Находит ближайший кассовый разрыв по компании
 */
export function findNearestCompanyCashGap(projects: Project[], companyExpenses: CompanyExpense[]): { date: string; deficit: number } | null {
  const flow = calculateCompanyCashFlow(projects, companyExpenses)
  for (const point of flow) {
    if (point.balance < 0) {
      return { date: point.date, deficit: Math.abs(point.balance) }
    }
  }
  return null
}
