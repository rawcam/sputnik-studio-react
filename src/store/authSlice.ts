import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type UserRole = 'director' | 'pm' | 'engineer' | 'designer' | 'logist'

export interface User {
  id: string
  name: string
  role: UserRole
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: (() => {
    const saved = localStorage.getItem('user')
    if (saved) return JSON.parse(saved)
    return { id: '1', name: 'ГИП', role: 'pm' }
  })(),
  isAuthenticated: true,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      localStorage.setItem('user', JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem('user')
    },
    setRole: (state, action: PayloadAction<UserRole>) => {
      if (state.user) {
        state.user.role = action.payload
        localStorage.setItem('user', JSON.stringify(state.user))
      }
    },
  },
})

export const { login, logout, setRole } = authSlice.actions
export default authSlice.reducer
