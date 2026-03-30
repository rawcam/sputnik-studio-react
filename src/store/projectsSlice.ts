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
  loading: boolean
  error: string | null
}

const initialState: ProjectsState = {
  list: [],
  loading: false,
  error: null,
}

function generateShortId(category: ProjectCategory, existingIds: string[]): string {
  let rangeStart: number
  switch (category) {
    case 'new': rangeStart = 0; break
    case 'modernization': rangeStart = 2000; break
    case 'service': rangeStart = 4000; break
    case 'standard': rangeStart = 6000; break
    case 'pilot': rangeStart = 8000; break
  }
  const rangeEnd = rangeStart + 1999
  const taken = new Set(existingIds.map(id => parseInt(id, 10)))
  let candidate = Math.floor(Math.random() * 2000) + rangeStart
  let attempts = 0
  while (taken.has(candidate) && attempts < 2000) {
    candidate = Math.floor(Math.random() * 2000) + rangeStart
    attempts++
  }
  for (let i = rangeStart; i <= rangeEnd; i++) {
    if (!taken.has(i)) {
      candidate = i
      break
    }
  }
  return candidate.toString().padStart(4, '0')
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    loadProjectsStart: (state) => {
      state.loading = true
      state.error = null
    },
    loadProjectsSuccess: (state, action: PayloadAction<Project[]>) => {
      state.list = action.payload
      state.loading = false
    },
    loadProjectsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    addProject: (state, action: PayloadAction<Omit<Project, 'id' | 'shortId'>>) => {
      const existingIds = state.list.map(p => p.shortId)
      const shortId = generateShortId(action.payload.category, existingIds)
      const newId = Date.now().toString()
      const newProject: Project = {
        ...action.payload,
        id: newId,
        shortId,
        actualIncome: 0,
        actualExpenses: 0,
      }
      state.list.push(newProject)
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
  loadProjectsStart,
  loadProjectsSuccess,
  loadProjectsFailure,
  addProject,
  updateProject,
  deleteProject,
  updateIncomePaid,
  updateExpensePaid,
} = projectsSlice.actions

export default projectsSlice.reducer
