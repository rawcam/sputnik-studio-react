import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ServiceVisit {
  id: string
  projectId: string
  date: string
  type: string
  status: 'planned' | 'completed' | 'cancelled'
  responsible: string
  cost?: number
  notes?: string
}

interface ServiceVisitsState {
  list: ServiceVisit[]
}

const initialState: ServiceVisitsState = {
  list: [],
}

const serviceVisitsSlice = createSlice({
  name: 'serviceVisits',
  initialState,
  reducers: {
    setServiceVisits: (state, action: PayloadAction<ServiceVisit[]>) => {
      state.list = action.payload
    },
    addServiceVisit: (state, action: PayloadAction<Omit<ServiceVisit, 'id'>>) => {
      const newId = Date.now().toString()
      state.list.push({ ...action.payload, id: newId })
    },
    updateServiceVisit: (state, action: PayloadAction<ServiceVisit>) => {
      const index = state.list.findIndex(v => v.id === action.payload.id)
      if (index !== -1) state.list[index] = action.payload
    },
    deleteServiceVisit: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(v => v.id !== action.payload)
    },
  },
})

export const { setServiceVisits, addServiceVisit, updateServiceVisit, deleteServiceVisit } = serviceVisitsSlice.actions
export default serviceVisitsSlice.reducer
