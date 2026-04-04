import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface SpecRow {
  id: number
  vendor: string
  model: string
  name: string
  qty: number
  unit: string
  usd: number
  eur: number
  markup: number
  rubUnit: number
  sum: number
  discount: number
  sumDisc: number
  supplier: string
  delivery: string
}

export interface SpecSection {
  name: string
  collapsed: boolean
  rows: SpecRow[]
}

interface SpecificationState {
  sections: SpecSection[]
  nextRowId: number
}

const loadFromStorage = (): SpecificationState => {
  const saved = localStorage.getItem('specification')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch { /* ignore */ }
  }
  return {
    sections: [
      {
        name: 'Средства отображения',
        collapsed: false,
        rows: [
          { id: 1, vendor: 'ИКАР', model: 'ПВ 55-117-200', name: 'ЖК дисплей 55"', qty: 40, unit: 'шт', usd: 0, eur: 0, markup: 0, rubUnit: 0, sum: 0, discount: 0, sumDisc: 0, supplier: '', delivery: '' }
        ]
      },
      {
        name: 'Коммутация и управление',
        collapsed: false,
        rows: [
          { id: 2, vendor: 'TP-Link', model: 'TL-SG3452', name: 'Коммутатор', qty: 1, unit: 'шт', usd: 0, eur: 0, markup: 0, rubUnit: 0, sum: 0, discount: 0, sumDisc: 0, supplier: '', delivery: '' }
        ]
      },
      {
        name: 'Кабели и аксессуары',
        collapsed: false,
        rows: [
          { id: 3, vendor: 'Cabeus', model: 'UTP-4P-Cat.5e', name: 'Витая пара 5e', qty: 6, unit: 'шт', usd: 0, eur: 0, markup: 0, rubUnit: 0, sum: 0, discount: 0, sumDisc: 0, supplier: '', delivery: '' }
        ]
      },
      {
        name: 'Работы',
        collapsed: false,
        rows: [
          { id: 4, vendor: 'Россия', model: '-', name: 'Проектирование', qty: 1, unit: 'услуги', usd: 0, eur: 0, markup: 0, rubUnit: 0, sum: 0, discount: 50, sumDisc: 0, supplier: '', delivery: '' },
          { id: 5, vendor: 'Россия', model: '-', name: 'Монтажные работы', qty: 1, unit: 'услуги', usd: 0, eur: 0, markup: 0, rubUnit: 0, sum: 0, discount: 50, sumDisc: 0, supplier: '', delivery: '' },
          { id: 6, vendor: 'Россия', model: '-', name: 'Пусконаладка', qty: 1, unit: 'услуги', usd: 0, eur: 0, markup: 0, rubUnit: 0, sum: 0, discount: 50, sumDisc: 0, supplier: '', delivery: '' }
        ]
      }
    ],
    nextRowId: 100
  }
}

const exchangeRates = { USD: 92.5, EUR: 100.2 }

const recalcRow = (row: SpecRow): SpecRow => {
  const priceForeign = row.usd > 0 ? row.usd : (row.eur > 0 ? row.eur : 0)
  const rate = row.usd > 0 ? exchangeRates.USD : (row.eur > 0 ? exchangeRates.EUR : 1)
  const rubUnit = priceForeign * rate * (1 + row.markup / 100)
  const sum = rubUnit * row.qty
  const sumDisc = sum * (1 - row.discount / 100)
  return {
    ...row,
    rubUnit: Math.round(rubUnit),
    sum: Math.round(sum),
    sumDisc: Math.round(sumDisc)
  }
}

const specificationSlice = createSlice({
  name: 'specification',
  initialState: loadFromStorage(),
  reducers: {
    updateRow: (state, action: PayloadAction<{ sectionIdx: number; rowId: number; updates: Partial<SpecRow> }>) => {
      const { sectionIdx, rowId, updates } = action.payload
      const section = state.sections[sectionIdx]
      const rowIndex = section.rows.findIndex(r => r.id === rowId)
      if (rowIndex !== -1) {
        const oldRow = section.rows[rowIndex]
        const newRow = { ...oldRow, ...updates }
        section.rows[rowIndex] = recalcRow(newRow)
        localStorage.setItem('specification', JSON.stringify(state))
      }
    },
    addRow: (state, action: PayloadAction<{ sectionIdx: number }>) => {
      const { sectionIdx } = action.payload
      const newId = state.nextRowId++
      const newRow: SpecRow = {
        id: newId,
        vendor: '', model: '', name: 'Новая позиция', qty: 1, unit: 'шт',
        usd: 0, eur: 0, markup: 0, rubUnit: 0, sum: 0, discount: 0, sumDisc: 0,
        supplier: '', delivery: ''
      }
      state.sections[sectionIdx].rows.push(recalcRow(newRow))
      localStorage.setItem('specification', JSON.stringify(state))
    },
    deleteRow: (state, action: PayloadAction<{ sectionIdx: number; rowId: number }>) => {
      const { sectionIdx, rowId } = action.payload
      state.sections[sectionIdx].rows = state.sections[sectionIdx].rows.filter(r => r.id !== rowId)
      if (state.sections[sectionIdx].rows.length === 0 && state.sections.length > 1) {
        state.sections.splice(sectionIdx, 1)
      }
      localStorage.setItem('specification', JSON.stringify(state))
    },
    addSection: (state) => {
      state.sections.push({
        name: 'Новый раздел',
        collapsed: false,
        rows: []
      })
      localStorage.setItem('specification', JSON.stringify(state))
    },
    toggleSectionCollapse: (state, action: PayloadAction<{ sectionIdx: number }>) => {
      const { sectionIdx } = action.payload
      state.sections[sectionIdx].collapsed = !state.sections[sectionIdx].collapsed
      localStorage.setItem('specification', JSON.stringify(state))
    },
    updateSectionName: (state, action: PayloadAction<{ sectionIdx: number; name: string }>) => {
      const { sectionIdx, name } = action.payload
      state.sections[sectionIdx].name = name
      localStorage.setItem('specification', JSON.stringify(state))
    },
    // Для демо – можно сбросить к начальному состоянию
    resetSpecification: (state) => {
      const fresh = loadFromStorage()
      state.sections = fresh.sections
      state.nextRowId = fresh.nextRowId
      localStorage.setItem('specification', JSON.stringify(state))
    }
  }
})

export const {
  updateRow,
  addRow,
  deleteRow,
  addSection,
  toggleSectionCollapse,
  updateSectionName,
  resetSpecification
} = specificationSlice.actions

export default specificationSlice.reducer
