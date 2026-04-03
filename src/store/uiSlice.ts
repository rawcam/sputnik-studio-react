// uiSlice.ts
import { createSlice } from '@reduxjs/toolkit'

interface UIState {
  widgetConfigOpen: boolean
}

const initialState: UIState = {
  widgetConfigOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openWidgetConfig: (state) => { state.widgetConfigOpen = true },
    closeWidgetConfig: (state) => { state.widgetConfigOpen = false },
    toggleWidgetConfig: (state) => { state.widgetConfigOpen = !state.widgetConfigOpen },
  },
})

export const { openWidgetConfig, closeWidgetConfig, toggleWidgetConfig } = uiSlice.actions
export default uiSlice.reducer
