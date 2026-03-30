import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ProjectCategory = 'new' | 'modernization' | 'service' | 'standard' | 'pilot'

export interface IncomeItem {
  date: string
  amount: number
  status?: 'planned' | 'received'
}

export interface ExpenseItem {
  date: string
  amount: number
  type?: 'purchase' | 'salary' | 'subcontractor' | 'rent'
  status?: 'planned' | 'paid'
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
  shortId: string           // 4-значный цифровой идентификатор
  category: ProjectCategory
  name: string
  status: string            // presale, design, ready, construction, done
  statusStartDate: string
  nextStatus?: string
  nextStatusDate?: string
  progress: number
  startDate: string
  budget: number            // сумма контракта
  engineer: string
  projectManager: string
  priority: boolean
  meetings: { date: string; subject: string }[]
  purchases: { name: string; status: string; date: string }[]
  // Финансовые поля
  contractAmount: number
  incomeSchedule: IncomeItem[]
  expenseSchedule: ExpenseItem[]
  actualIncome: number
  actualExpenses: number
  // Сервисные работы
  serviceVisits: ServiceVisit[]
  // Для дорожной карты (план/факт) – можно добавить позже
}

interface ProjectsState {
  list: Project[]
}

const initialState: ProjectsState = {
  list: [],
}

// Функция для генерации короткого ID в заданном диапазоне
const generateShortId = (category: ProjectCategory, existingIds: string[]): string => {
  const ranges: Record<ProjectCategory, [number, number]> = {
    new: [0, 1999],
    modernization: [2000, 3999],
    service: [4000, 5999],
    standard: [6000, 7999],
    pilot: [8000, 9999],
  }
  const [min, max] = ranges[category]
  const existingNumbers = existingIds.map(id => parseInt(id, 10)).filter(n => n >= min && n <= max)
  for (let i = 0; i < 100; i++) { // попыток 100
    const candidate = Math.floor(Math.random() * (max - min + 1)) + min
    const padded = candidate.toString().padStart(4, '0')
    if (!existingIds.includes(padded)) return padded
  }
  // если не нашли свободный (маловероятно), вернуть первый возможный
  return min.toString().padStart(4, '0')
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.list = action.payload
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
    // Дополнительные действия для обновления финансовых расписаний
    updateIncomeSchedule: (state, action: PayloadAction<{ projectId: string; schedule: IncomeItem[] }>) => {
      const project = state.list.find(p => p.id === action.payload.projectId)
      if (project) {
        project.incomeSchedule = action.payload.schedule
        project.actualIncome = project.incomeSchedule
          .filter(i => i.status === 'received')
          .reduce((sum, i) => sum + i.amount, 0)
      }
    },
    updateExpenseSchedule: (state, action: PayloadAction<{ projectId: string; schedule: ExpenseItem[] }>) => {
      const project = state.list.find(p => p.id === action.payload.projectId)
      if (project) {
        project.expenseSchedule = action.payload.schedule
        project.actualExpenses = project.expenseSchedule
          .filter(e => e.status === 'paid')
          .reduce((sum, e) => sum + e.amount, 0)
      }
    },
    addServiceVisit: (state, action: PayloadAction<{ projectId: string; visit: ServiceVisit }>) => {
      const project = state.list.find(p => p.id === action.payload.projectId)
      if (project) {
        project.serviceVisits.push(action.payload.visit)
      }
    },
    updateServiceVisit: (state, action: PayloadAction<{ projectId: string; visitId: string; updates: Partial<ServiceVisit> }>) => {
      const project = state.list.find(p => p.id === action.payload.projectId)
      if (project) {
        const visit = project.serviceVisits.find(v => v.id === action.payload.visitId)
        if (visit) Object.assign(visit, action.payload.updates)
      }
    },
    deleteServiceVisit: (state, action: PayloadAction<{ projectId: string; visitId: string }>) => {
      const project = state.list.find(p => p.id === action.payload.projectId)
      if (project) {
        project.serviceVisits = project.serviceVisits.filter(v => v.id !== action.payload.visitId)
      }
    },
  },
})

export const {
  setProjects,
  addProject,
  updateProject,
  deleteProject,
  updateIncomeSchedule,
  updateExpenseSchedule,
  addServiceVisit,
  updateServiceVisit,
  deleteServiceVisit,
} = projectsSlice.actions

export default projectsSlice.reducer
