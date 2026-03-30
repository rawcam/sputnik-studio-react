import { Project } from '../store/projectsSlice'
import { CompanyExpense } from '../store/companyExpensesSlice'

export interface CashFlowPoint {
  date: string
  balance: number
  cumulative: number
}

export interface ProjectMargins {
  plannedMargin: number
  plannedProfitability: number
  actualMargin: number
  actualProfitability: number
}

export const getProjectMargins = (project: Project): ProjectMargins => {
  const plannedExpenses = project.expenseSchedule.reduce((sum, e) => sum + e.amount, 0)
  const plannedMargin = project.contractAmount - plannedExpenses
  const plannedProfitability = project.contractAmount === 0 ? 0 : plannedMargin / project.contractAmount

  const actualExpenses = project.expenseSchedule.filter(e => e.paid).reduce((sum, e) => sum + e.amount, 0)
  const actualIncome = project.incomeSchedule.filter(i => i.paid).reduce((sum, i) => sum + i.amount, 0)
  const actualMargin = actualIncome - actualExpenses
  const actualProfitability = actualIncome === 0 ? 0 : actualMargin / actualIncome

  return { plannedMargin, plannedProfitability, actualMargin, actualProfitability }
}

export const getProjectCashFlow = (project: Project): CashFlowPoint[] => {
  const items: { date: string; amount: number }[] = [
    ...project.incomeSchedule.map(i => ({ date: i.date, amount: i.amount })),
    ...project.expenseSchedule.map(e => ({ date: e.date, amount: -e.amount })),
  ]
  items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  let cumulative = 0
  return items.map(item => {
    cumulative += item.amount
    return { date: item.date, balance: item.amount, cumulative }
  })
}

export const getNextCashGap = (project: Project): { date: string; deficit: number } | null => {
  const flow = getProjectCashFlow(project)
  let cumulative = 0
  for (const point of flow) {
    cumulative += point.balance
    if (cumulative < 0) {
      return { date: point.date, deficit: -cumulative }
    }
  }
  return null
}

export const getTotalActualIncome = (projects: Project[]): number => {
  return projects.reduce((sum, p) => sum + p.actualIncome, 0)
}

export const getTotalActualMargin = (projects: Project[]): number => {
  return projects.reduce((sum, p) => {
    const margin = p.actualIncome - p.actualExpenses
    return sum + margin
  }, 0)
}

export const getCompanyCashFlow = (projects: Project[], companyExpenses: CompanyExpense[]): CashFlowPoint[] => {
  const allItems: { date: string; amount: number }[] = []

  projects.forEach(p => {
    p.incomeSchedule.forEach(i => allItems.push({ date: i.date, amount: i.amount }))
    p.expenseSchedule.forEach(e => allItems.push({ date: e.date, amount: -e.amount }))
  })
  companyExpenses.forEach(e => allItems.push({ date: e.date, amount: -e.amount }))

  allItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  let cumulative = 0
  return allItems.map(item => {
    cumulative += item.amount
    return { date: item.date, balance: item.amount, cumulative }
  })
}

export const getCompanyNextCashGap = (projects: Project[], companyExpenses: CompanyExpense[]): { date: string; deficit: number } | null => {
  const flow = getCompanyCashFlow(projects, companyExpenses)
  let cumulative = 0
  for (const point of flow) {
    cumulative += point.balance
    if (cumulative < 0) {
      return { date: point.date, deficit: -cumulative }
    }
  }
  return null
}
