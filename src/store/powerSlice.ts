import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface PowerState {
  totalPower: number
  upsPower: number
  upsAutonomy: number
  coolingPower: number
  resultText: string
}

const initialState: PowerState = {
  totalPower: 0,
  upsPower: 0,
  upsAutonomy: 0,
  coolingPower: 0,
  resultText: '',
}

function calcUPS(totalPower: number, autonomy: number): number {
  return Math.round(totalPower * autonomy * 1.2)
}

function calcCooling(totalPower: number): number {
  return Math.round(totalPower / 3.412)
}

const powerSlice = createSlice({
  name: 'power',
  initialState,
  reducers: {
    setPowerConfig: (state, action: PayloadAction<Partial<PowerState>>) => {
      Object.assign(state, action.payload)
      const ups = calcUPS(state.totalPower, state.upsAutonomy)
      const cooling = calcCooling(state.totalPower)
      state.resultText = `Рекомендуемая мощность ИБП: ${ups} ВА, требуемое охлаждение: ${cooling} BTU/ч`
    },
  },
})

export const { setPowerConfig } = powerSlice.actions
export default powerSlice.reducer
