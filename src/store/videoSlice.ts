import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface VideoSettings {
  resolution: '1080p' | '4K' | '8K'
  chroma: '444' | '422' | '420'
  fps: number
  colorSpace: 'RGB' | 'YCbCr'
  bitDepth: 8 | 10 | 12
}

const initialState: VideoSettings = {
  resolution: '4K',
  chroma: '422',
  fps: 60,
  colorSpace: 'YCbCr',
  bitDepth: 10,
}

// Вспомогательные коэффициенты
const resFactor: Record<string, number> = { '1080p': 1.0, '4K': 1.5, '8K': 2.5 }
const chromaFactor: Record<string, number> = { '444': 1.2, '422': 1.0, '420': 0.9 }

export const calcVideoBitrate = (settings: VideoSettings): number => {
  let base = 1000
  if (settings.resolution === '1080p') base = 300
  if (settings.resolution === '8K') base = 4000
  base *= chromaFactor[settings.chroma]
  base *= settings.colorSpace === 'RGB' ? 1.2 : 1.0
  base *= settings.bitDepth / 10
  base *= settings.fps / 60
  return Math.round(base)
}

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setVideoSettings: (state, action: PayloadAction<Partial<VideoSettings>>) => {
      Object.assign(state, action.payload)
    },
  },
})

export const { setVideoSettings } = videoSlice.actions
export default videoSlice.reducer
