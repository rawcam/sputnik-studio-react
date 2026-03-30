import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CompanyExpense {
  id: string
  date: string
  amount: number
  description: string
  category?: 'rent' | 'salary' | 'tax' | 'other'
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
    addCompanyExpense: (state, action: PayloadAction<CompanyExpense>) => {
      state.list.push(action.payload)
    },
    updateCompanyExpense: (state, action: PayloadAction<CompanyExpense>) => {
      const index = state.list.findIndex(e => e.id === action.payload.id)
      if (index !== -1) state.list[index] = action.payload
    },
    deleteCompanyExpense: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(e => e.id !== action.payload)
    },
  },
})

export const { setCompanyExpenses, addCompanyExpense, updateCompanyExpense, deleteCompanyExpense } = companyExpensesSlice.actions
export default companyExpensesSlice.reducer
