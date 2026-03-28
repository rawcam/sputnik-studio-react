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
