import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface LedState {
  activeMode: 'cabinets' | 'resolution'
  cabinetWidth: number
  cabinetHeight: number
  cabinetsW: number
  cabinetsH: number
  targetResolution: string
  customResW: number
  customResH: number
  pitch: number
  width_m: number
  height_m: number
  resW: number
  resH: number
  area: number
  power: number
}

const initialState: LedState = {
  activeMode: 'cabinets',
  cabinetWidth: 600,
  cabinetHeight: 337.5,
  cabinetsW: 1,
  cabinetsH: 1,
  targetResolution: 'fhd',
  customResW: 1920,
  customResH: 1080,
  pitch: 1.2,
  width_m: 0,
  height_m: 0,
  resW: 0,
  resH: 0,
  area: 0,
  power: 0,
}

const ledSlice = createSlice({
  name: 'led',
  initialState,
  reducers: {
    setLedConfig: (state, action: PayloadAction<Partial<LedState>>) => {
      Object.assign(state, action.payload)
    },
  },
})

export const { setLedConfig } = ledSlice.actions
export default ledSlice.reducer
