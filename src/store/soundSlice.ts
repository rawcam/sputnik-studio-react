import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface SoundState {
  activeMode: 'spl' | 'drop' | 'power' | 'rt60' | 'speakers'
  sensitivity: number
  sourcePower: number
  distance: number
  headroom: number
  roomGain: number
  startDistance: number
  endDistance: number
  powerChangeFrom: number
  powerChangeTo: number
  roomVolume: number
  roomArea: number
  avgAbsorption: number
  speakerPower: number
  speakerSensitivity: number
  requiredSPL: number
}

const initialState: SoundState = {
  activeMode: 'spl',
  sensitivity: 89,
  sourcePower: 1,
  distance: 1,
  headroom: 9,
  roomGain: 3,
  startDistance: 1,
  endDistance: 16,
  powerChangeFrom: 1,
  powerChangeTo: 2,
  roomVolume: 200,
  roomArea: 100,
  avgAbsorption: 0.2,
  speakerPower: 30,
  speakerSensitivity: 90,
  requiredSPL: 85,
}

const soundSlice = createSlice({
  name: 'sound',
  initialState,
  reducers: {
    setSoundConfig: (state, action: PayloadAction<Partial<SoundState>>) => {
      Object.assign(state, action.payload)
    },
  },
})

export const { setSoundConfig } = soundSlice.actions
export default soundSlice.reducer
