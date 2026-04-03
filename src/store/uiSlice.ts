import { createSlice } from '@reduxjs/toolkit'

export interface UIState {
  sidebarCollapsed: boolean
  widgetConfigOpen: boolean
}

const initialState: UIState = {
  sidebarCollapsed: false,
  widgetConfigOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    openWidgetConfig: (state) => {
      state.widgetConfigOpen = true
    },
    closeWidgetConfig: (state) => {
      state.widgetConfigOpen = false
    },
  },
})

export const { toggleSidebar, openWidgetConfig, closeWidgetConfig } = uiSlice.actions
export default uiSlice.reducer
