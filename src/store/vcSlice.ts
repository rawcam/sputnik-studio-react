import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface VcState {
  activeMode: 'codec' | 'multipoint'
  codecPreset: string
  resolution: string
  fps: number
  participants: number
  multipointParticipants: number
  resultValue: number
  resultText: string
}

const initialState: VcState = {
  activeMode: 'codec',
  codecPreset: 'trueconf',
  resolution: '1080p',
  fps: 30,
  participants: 2,
  multipointParticipants: 4,
  resultValue: 0,
  resultText: '',
}

const codecBitrates: Record<string, number> = {
  trueconf: 2.5,
  webrtc: 2.0,
  h264: 4.0,
  h265: 2.5,
}
const resolutionFactor: Record<string, number> = { '1080p': 1, '720p': 0.5, '4K': 2 }

function calcCodecBitrate(codec: string, resolution: string, fps: number): number {
  const base = codecBitrates[codec] || 2.5
  const resFactor = resolutionFactor[resolution] || 1
  const fpsFactor = fps / 30
  return Math.round(base * resFactor * fpsFactor)
}

const vcSlice = createSlice({
  name: 'vc',
  initialState,
  reducers: {
    setVcConfig: (state, action: PayloadAction<Partial<VcState>>) => {
      Object.assign(state, action.payload)
      if (state.activeMode === 'codec') {
        const perParticipant = calcCodecBitrate(state.codecPreset, state.resolution, state.fps)
        const total = perParticipant * state.participants
        state.resultValue = total
        state.resultText = `${total} Мбит/с (${perParticipant} Мбит/с на участника)`
      } else {
        const load = Math.round(state.multipointParticipants * 1.5)
        state.resultValue = load
        state.resultText = `Нагрузка: ${load} Мбит/с`
      }
    },
    setVcMode: (state, action: PayloadAction<VcState['activeMode']>) => {
      state.activeMode = action.payload
      vcSlice.caseReducers.setVcConfig(state, { payload: {} } as any)
    },
  },
})

export const { setVcConfig, setVcMode } = vcSlice.actions
export default vcSlice.reducer
