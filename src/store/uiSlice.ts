import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarCollapsed: boolean
  activeModal: string | null
}

const initialState: UIState = {
  sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
  activeModal: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
      localStorage.setItem('sidebarCollapsed', String(state.sidebarCollapsed))
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
      localStorage.setItem('sidebarCollapsed', String(action.payload))
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload
    },
    closeModal: (state) => {
      state.activeModal = null
    },
  },
})

export const { toggleSidebar, setSidebarCollapsed, openModal, closeModal } = uiSlice.actions
export default uiSlice.reducer
