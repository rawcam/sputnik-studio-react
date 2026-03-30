import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ProjectStatus = 'presale' | 'design' | 'ready' | 'construction' | 'done'
export type ProjectCategory = 'new' | 'modernization' | 'service' | 'standard' | 'pilot'

export interface IncomeItem {
  date: string
  amount: number
  paid?: boolean
}

export interface ExpenseItem {
  date: string
  amount: number
  type: 'purchase' | 'salary' | 'subcontractor' | 'rent'
  paid?: boolean
}

export interface ServiceVisit {
  id: string
  date: string
  type: string
  status: 'planned' | 'completed' | 'cancelled'
  responsible: string
  cost?: number
}

export interface Project {
  id: string
  shortId: string
  category: ProjectCategory
  name: string
  status: ProjectStatus
  statusStartDate: string
  nextStatus?: ProjectStatus
  nextStatusDate?: string
  progress: number
  startDate: string
  engineer: string
  projectManager: string
  priority: boolean
  meetings: { date: string; subject: string }[]
  purchases: { name: string; status: string; date: string }[]
  contractAmount: number
  incomeSchedule: IncomeItem[]
  expenseSchedule: ExpenseItem[]
  actualIncome: number
  actualExpenses: number
  serviceVisits: ServiceVisit[]
}

interface ProjectsState {
  list: Project[]
}

const initialState: ProjectsState = {
  list: [],
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.list = action.payload
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.list.push(action.payload)
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.list.findIndex(p => p.id === action.payload.id)
      if (index !== -1) state.list[index] = action.payload
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(p => p.id !== action.payload)
    },
    updateIncomePaid: (state, action: PayloadAction<{ projectId: string; index: number; paid: boolean }>) => {
      const project = state.list.find(p => p.id === action.payload.projectId)
      if (project) {
        const item = project.incomeSchedule[action.payload.index]
        if (item) {
          item.paid = action.payload.paid
          project.actualIncome = project.incomeSchedule.filter(i => i.paid).reduce((sum, i) => sum + i.amount, 0)
        }
      }
    },
    updateExpensePaid: (state, action: PayloadAction<{ projectId: string; index: number; paid: boolean }>) => {
      const project = state.list.find(p => p.id === action.payload.projectId)
      if (project) {
        const item = project.expenseSchedule[action.payload.index]
        if (item) {
          item.paid = action.payload.paid
          project.actualExpenses = project.expenseSchedule.filter(e => e.paid).reduce((sum, e) => sum + e.amount, 0)
        }
      }
    },
  },
})

export const {
  setProjects,
  addProject,
  updateProject,
  deleteProject,
  updateIncomePaid,
  updateExpensePaid,
} = projectsSlice.actions

export default projectsSlice.reducer

// Демо-данные
export const seedDemoProjects = (): Omit<Project, 'id' | 'shortId'>[] => {
  const today = new Date().toISOString().slice(0, 10)
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  return [
    {
      name: 'Конференц-зал 1',
      category: 'new',
      status: 'design',
      statusStartDate: today,
      nextStatus: 'ready',
      nextStatusDate: nextWeek,
      progress: 30,
      startDate: today,
      engineer: 'Иванов И.И.',
      projectManager: 'Петров П.П.',
      priority: false,
      meetings: [{ date: today, subject: 'Согласование ТЗ' }],
      purchases: [],
      contractAmount: 1250000,
      incomeSchedule: [{ date: today, amount: 500000, paid: true }],
      expenseSchedule: [{ date: today, amount: 300000, type: 'purchase', paid: true }],
      actualIncome: 500000,
      actualExpenses: 300000,
      serviceVisits: [],
    },
    {
      name: 'Ситуационный центр',
      category: 'modernization',
      status: 'presale',
      statusStartDate: today,
      nextStatus: 'design',
      nextStatusDate: nextWeek,
      progress: 10,
      startDate: today,
      engineer: 'Сидоров С.С.',
      projectManager: 'Петров П.П.',
      priority: true,
      meetings: [],
      purchases: [],
      contractAmount: 3450000,
      incomeSchedule: [{ date: today, amount: 1000000, paid: false }],
      expenseSchedule: [],
      actualIncome: 0,
      actualExpenses: 0,
      serviceVisits: [],
    },
    {
      name: 'Диспетчерская',
      category: 'service',
      status: 'construction',
      statusStartDate: '2026-02-15',
      nextStatus: 'done',
      nextStatusDate: '2026-04-01',
      progress: 80,
      startDate: '2026-02-01',
      engineer: 'Кузнецов К.К.',
      projectManager: 'Иванов И.И.',
      priority: false,
      meetings: [],
      purchases: [],
      contractAmount: 890000,
      incomeSchedule: [{ date: '2026-02-20', amount: 890000, paid: true }],
      expenseSchedule: [{ date: '2026-02-10', amount: 500000, type: 'purchase', paid: true }],
      actualIncome: 890000,
      actualExpenses: 500000,
      serviceVisits: [{ id: '1', date: '2026-04-10', type: 'Плановое ТО', status: 'planned', responsible: 'Иванов И.И.' }],
    },
  ]
}
