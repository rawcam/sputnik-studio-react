// ... существующие импорты
import ledReducer from './ledSlice'
import soundReducer from './soundSlice'
import vcReducer from './vcSlice'
import ergoReducer from './ergoSlice'
import powerReducer from './powerSlice'

export const store = configureStore({
  reducer: {
    // ... существующие
    led: ledReducer,
    sound: soundReducer,
    vc: vcReducer,
    ergo: ergoReducer,
    power: powerReducer,
  },
})
