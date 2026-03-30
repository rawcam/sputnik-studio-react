import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './themeSlice'
import uiReducer from './uiSlice'
import videoReducer from './videoSlice'
import networkReducer from './networkSlice'
import tractsReducer from './tractsSlice'
import projectsReducer from './projectsSlice'
import authReducer from './authSlice'
import companyExpensesReducer from './companyExpensesSlice'
import serviceVisitsReducer from '../features/service/serviceVisitsSlice'

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    ui: uiReducer,
    video: videoReducer,
    network: networkReducer,
    tracts: tractsReducer,
    projects: projectsReducer,
    auth: authReducer,
    companyExpenses: companyExpensesReducer,
    serviceVisits: serviceVisitsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
