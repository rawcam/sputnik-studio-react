import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import {
  getProjectMargins,
  getProjectCashFlow,
  getNextCashGap,
  getCompanyCashFlow,
  getCompanyNextCashGap,
  getTotalActualIncome,
  getTotalActualMargin,
} from '../utils/financeUtils'

export const useFinance = () => {
  const projects = useSelector((state: RootState) => state.projects.list)
  const companyExpenses = useSelector((state: RootState) => state.companyExpenses.list)

  const totalIncome = useMemo(() => getTotalActualIncome(projects), [projects])
  const totalMargin = useMemo(() => getTotalActualMargin(projects), [projects])
  const totalProfitability = totalIncome === 0 ? 0 : totalMargin / totalIncome

  const companyCashFlow = useMemo(() => getCompanyCashFlow(projects, companyExpenses), [projects, companyExpenses])
  const nextCompanyGap = useMemo(() => getCompanyNextCashGap(projects, companyExpenses), [projects, companyExpenses])

  const getProjectMetrics = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return null
    return {
      margins: getProjectMargins(project),
      cashFlow: getProjectCashFlow(project),
      nextGap: getNextCashGap(project),
    }
  }

  return {
    totalIncome,
    totalMargin,
    totalProfitability,
    companyCashFlow,
    nextCompanyGap,
    getProjectMetrics,
  }
}
