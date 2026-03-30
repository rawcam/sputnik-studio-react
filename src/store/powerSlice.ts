import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface PowerState {
  totalPower: number
  upsPower: number
  upsAutonomy: number
  coolingPower: number
}

const initialState: PowerState = {
  totalPower: 0,
  upsPower: 0,
  upsAutonomy: 0,
  coolingPower: 0,
}

const powerSlice = createSlice({
  name: 'power',
  initialState,
  reducers: {
    setPowerConfig: (state, action: PayloadAction<Partial<PowerState>>) => {
      Object.assign(state, action.payload)
    },
  },
})

export const { setPowerConfig } = powerSlice.actions
export default powerSlice.reducer
