import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface NetworkSettings {
  cable: string
  multicast: boolean
  qos: boolean
  networkType: 'managed' | 'unmanaged'
  syncProtocol: 'ptp' | 'ntp' | 'none'
  redundancy: boolean
}

const initialState: NetworkSettings = {
  cable: 'Cat6',
  multicast: false,
  qos: false,
  networkType: 'managed',
  syncProtocol: 'ptp',
  redundancy: false,
}

// Вспомогательные функции для расчёта статистики
export const getCableSpeed = (cable: string): number => {
  const speeds: Record<string, number> = {
    Cat5e: 1000,
    Cat6: 1000,
    Cat6a: 10000,
    Cat7: 10000,
    Cat8: 40000,
    OM3: 10000,
    wireless: 100,
  }
  return speeds[cable] || 1000
}

export const calcLoadPercent = (totalBitrate: number, cable: string): number => {
  const speed = getCableSpeed(cable)
  if (speed === 0) return 0
  return Math.min(100, Math.round((totalBitrate / speed) * 100))
}

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setNetworkSettings: (state, action: PayloadAction<Partial<NetworkSettings>>) => {
      Object.assign(state, action.payload)
    },
  },
})

export const { setNetworkSettings } = networkSlice.actions
export default networkSlice.reducer
