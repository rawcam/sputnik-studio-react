import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ErgoState {
  screenWidth: number
  screenHeight: number
  distance: number
  viewingAngle: number
  heightOffset: number
  resultText: string
}

const initialState: ErgoState = {
  screenWidth: 100,
  screenHeight: 56,
  distance: 200,
  viewingAngle: 30,
  heightOffset: 0,
  resultText: '',
}

function calcErgo(width: number, height: number, distance: number): string {
  const angleRad = Math.atan2(width / 2, distance) * (180 / Math.PI)
  const angleDeg = angleRad * 2
  return `Угол обзора: ${Math.round(angleDeg)}°, рекомендуемое расстояние: ${Math.round(width * 1.5)} см`
}

const ergoSlice = createSlice({
  name: 'ergo',
  initialState,
  reducers: {
    setErgoConfig: (state, action: PayloadAction<Partial<ErgoState>>) => {
      Object.assign(state, action.payload)
      state.resultText = calcErgo(state.screenWidth, state.screenHeight, state.distance)
    },
  },
})

export const { setErgoConfig } = ergoSlice.actions
export default ergoSlice.reducer
