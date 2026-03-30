import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ErgoState {
  screenWidth: number
  screenHeight: number
  distance: number
  viewingAngle: number
  heightOffset: number
}

const initialState: ErgoState = {
  screenWidth: 100,
  screenHeight: 56,
  distance: 200,
  viewingAngle: 30,
  heightOffset: 0,
}

const ergoSlice = createSlice({
  name: 'ergo',
  initialState,
  reducers: {
    setErgoConfig: (state, action: PayloadAction<Partial<ErgoState>>) => {
      Object.assign(state, action.payload)
    },
  },
})

export const { setErgoConfig } = ergoSlice.actions
export default ergoSlice.reducer
