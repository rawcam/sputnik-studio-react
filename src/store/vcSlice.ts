import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface VcState {
  activeMode: 'codec' | 'multipoint'
  codecPreset: string
  resolution: string
  fps: number
  participants: number
  multipointParticipants: number
}

const initialState: VcState = {
  activeMode: 'codec',
  codecPreset: 'trueconf',
  resolution: '1080p',
  fps: 30,
  participants: 2,
  multipointParticipants: 4,
}

const vcSlice = createSlice({
  name: 'vc',
  initialState,
  reducers: {
    setVcConfig: (state, action: PayloadAction<Partial<VcState>>) => {
      Object.assign(state, action.payload)
    },
  },
})

export const { setVcConfig } = vcSlice.actions
export default vcSlice.reducer
