import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CompanyExpense {
  id: string
  date: string
  amount: number
  description: string
  category?: 'rent' | 'salary' | 'tax' | 'other'
  paid?: boolean
}

interface CompanyExpensesState {
  list: CompanyExpense[]
}

const initialState: CompanyExpensesState = {
  list: [],
}

const companyExpensesSlice = createSlice({
  name: 'companyExpenses',
  initialState,
  reducers: {
    setCompanyExpenses: (state, action: PayloadAction<CompanyExpense[]>) => {
      state.list = action.payload
    },
    addCompanyExpense: (state, action: PayloadAction<Omit<CompanyExpense, 'id'>>) => {
      const newId = Date.now().toString()
      state.list.push({ ...action.payload, id: newId })
    },
    updateCompanyExpense: (state, action: PayloadAction<CompanyExpense>) => {
      const index = state.list.findIndex(e => e.id === action.payload.id)
      if (index !== -1) state.list[index] = action.payload
    },
    deleteCompanyExpense: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(e => e.id !== action.payload)
    },
    updateExpensePaid: (state, action: PayloadAction<{ id: string; paid: boolean }>) => {
      const expense = state.list.find(e => e.id === action.payload.id)
      if (expense) expense.paid = action.payload.paid
    },
  },
})

export const {
  setCompanyExpenses,
  addCompanyExpense,
  updateCompanyExpense,
  deleteCompanyExpense,
  updateExpensePaid,
} = companyExpensesSlice.actions

export default companyExpensesSlice.reducer
