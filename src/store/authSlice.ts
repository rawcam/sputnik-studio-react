import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  name: string
  role: 'director' | 'pm' | 'engineer' | 'designer' | 'logist'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

const loadUserFromStorage = (): User | null => {
  const savedRole = localStorage.getItem('userRole') as User['role'] | null
  if (savedRole) {
    // Имя пользователя можно загрузить из localStorage или задать по умолчанию
    const savedName = localStorage.getItem('userName') || 'Пользователь'
    return { name: savedName, role: savedRole }
  }
  return null
}

const initialState: AuthState = {
  user: loadUserFromStorage(),
  isAuthenticated: !!loadUserFromStorage(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      localStorage.setItem('userRole', action.payload.role)
      localStorage.setItem('userName', action.payload.name)
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem('userRole')
      localStorage.removeItem('userName')
    },
    setRole: (state, action: PayloadAction<User['role']>) => {
      if (state.user) {
        state.user.role = action.payload
        localStorage.setItem('userRole', action.payload)
      } else {
        // Если пользователь не залогинен, создаём минимального пользователя
        state.user = { name: 'Пользователь', role: action.payload }
        state.isAuthenticated = true
        localStorage.setItem('userRole', action.payload)
        localStorage.setItem('userName', 'Пользователь')
      }
    },
  },
})

export const { login, logout, setRole } = authSlice.actions
export default authSlice.reducer
