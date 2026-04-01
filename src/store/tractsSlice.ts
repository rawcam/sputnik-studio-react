import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { VideoSettings } from './videoSlice'
import { calcVideoBitrate } from './videoSlice'

export interface TractDevice {
  id: string
  type: string
  modelName: string
  latency: number
  poeEnabled?: boolean
  poePower?: number
  powerW: number
  shortName: string
  attachedSwitchId?: string
  attachedPortNumber?: number
  ethernet?: boolean
  bitrateFactor?: number
  ports?: number
  usedPorts?: number[]
  poeBudget?: number
  switchingLatency?: number
  usedPoE?: number
  poc?: boolean
  usb?: string
}

export interface Tract {
  id: string
  name: string
  sourceDevices: TractDevice[]
  matrixDevices: TractDevice[]
  sinkDevices: TractDevice[]
  totalLatency: number
  totalBitrate: number
  totalPower: number
  totalPoEBudget: number
  usedPoE: number
  usedPorts: number
  totalPorts: number
}

interface TractsState {
  tracts: Tract[]
  activeTractId: string | null
  viewMode: 'single' | 'all' | 'calculator'
  activeCalculator: string | null
}

const initialState: TractsState = {
  tracts: [],
  activeTractId: null,
  viewMode: 'single',
  activeCalculator: null,
}

export const recalcTract = (tract: Tract, videoSettings: VideoSettings): Tract => {
  const allDevices = [...tract.sourceDevices, ...tract.matrixDevices, ...tract.sinkDevices]
  let totalLatency = 0
  allDevices.forEach(d => totalLatency += d.latency || 0)
  let totalBitrate = calcVideoBitrate(videoSettings)
  allDevices.forEach(d => {
    if (d.bitrateFactor !== undefined) totalBitrate *= d.bitrateFactor
  })
  totalBitrate = Math.round(totalBitrate)

  let totalPower = 0
  let usedPoE = 0
  let totalPoEBudget = 0
  tract.matrixDevices.forEach(sw => {
    totalPoEBudget += sw.poeBudget || 0
    totalPower += sw.powerW || 0
  })
  allDevices.forEach(d => {
    totalPower += d.powerW || 0
    if (d.poeEnabled) usedPoE += d.poePower || d.powerW || 0
  })

  let totalPorts = 0, usedPorts = 0
  tract.matrixDevices.forEach(sw => {
    if (sw.ports) {
      totalPorts += sw.ports
      usedPorts += sw.usedPorts?.length || 0
    }
  })

  return {
    ...tract,
    totalLatency,
    totalBitrate,
    totalPower,
    totalPoEBudget,
    usedPoE,
    usedPorts,
    totalPorts,
  }
}

// Функция для автоматического назначения порта при включении Ethernet
export const assignNetwork = (
  tract: Tract,
  device: TractDevice
): { success: boolean; error?: string; updatedTract?: Tract } => {
  if (!device.ethernet) {
    // Если Ethernet выключен, освобождаем порт
    if (device.attachedSwitchId) {
      const sw = tract.matrixDevices.find(s => s.id === device.attachedSwitchId)
      if (sw) {
        if (device.attachedPortNumber) {
          sw.usedPorts = sw.usedPorts?.filter(p => p !== device.attachedPortNumber) || []
        }
        if (device.poeEnabled) {
          sw.usedPoE = (sw.usedPoE || 0) - (device.poePower || 0)
        }
      }
      device.attachedSwitchId = undefined
      device.attachedPortNumber = undefined
    }
    return { success: true, updatedTract: tract }
  }

  // Если Ethernet включён, ищем коммутатор
  const targetSwitch = tract.matrixDevices.find(sw => {
    if (!sw.ports) return false
    const freePorts = sw.ports - (sw.usedPorts?.length || 0)
    if (freePorts === 0) return false
    if (device.poeEnabled && (!sw.poeBudget || (sw.poeBudget - (sw.usedPoE || 0) < (device.poePower || 0)))) return false
    return true
  })
  if (!targetSwitch) {
    return { success: false, error: 'Нет подходящего коммутатора с свободными портами и достаточным PoE-бюджетом' }
  }
  const freePorts = targetSwitch.ports! - (targetSwitch.usedPorts?.length || 0)
  if (freePorts === 0) return { success: false, error: 'Нет свободных портов' }
  if (device.poeEnabled) {
    const usedPoE = targetSwitch.usedPoE || 0
    if ((targetSwitch.poeBudget || 0) - usedPoE < (device.poePower || 0)) {
      return { success: false, error: 'Недостаточно PoE-бюджета' }
    }
    targetSwitch.usedPoE = usedPoE + (device.poePower || 0)
  }
  let newPort = 1
  const used = new Set(targetSwitch.usedPorts || [])
  while (used.has(newPort)) newPort++
  targetSwitch.usedPorts = [...(targetSwitch.usedPorts || []), newPort]
  device.attachedSwitchId = targetSwitch.id
  device.attachedPortNumber = newPort
  return { success: true, updatedTract: tract }
}

const tractsSlice = createSlice({
  name: 'tracts',
  initialState,
  reducers: {
    setTracts: (state, action: PayloadAction<Tract[]>) => {
      state.tracts = action.payload
    },
    addTract: (state, action: PayloadAction<Omit<Tract, 'totalLatency' | 'totalBitrate' | 'totalPower' | 'totalPoEBudget' | 'usedPoE' | 'usedPorts' | 'totalPorts'>>) => {
      const newTract: Tract = {
        ...action.payload,
        totalLatency: 0,
        totalBitrate: 0,
        totalPower: 0,
        totalPoEBudget: 0,
        usedPoE: 0,
        usedPorts: 0,
        totalPorts: 0,
      }
      state.tracts.push(newTract)
    },
    updateTract: (state, action: PayloadAction<Tract>) => {
      const index = state.tracts.findIndex(t => t.id === action.payload.id)
      if (index !== -1) state.tracts[index] = action.payload
    },
    deleteTract: (state, action: PayloadAction<string>) => {
      state.tracts = state.tracts.filter(t => t.id !== action.payload)
      if (state.activeTractId === action.payload) state.activeTractId = null
    },
    setActiveTract: (state, action: PayloadAction<string | null>) => {
      state.activeTractId = action.payload
    },
    setViewMode: (state, action: PayloadAction<'single' | 'all' | 'calculator'>) => {
      state.viewMode = action.payload
    },
    setActiveCalculator: (state, action: PayloadAction<string | null>) => {
      state.activeCalculator = action.payload
    },
    addDeviceToTract: (state, action: PayloadAction<{ tractId: string; device: TractDevice; column: 'source' | 'matrix' | 'sink' }>) => {
      const tract = state.tracts.find(t => t.id === action.payload.tractId)
      if (!tract) return
      if (action.payload.column === 'source') {
        tract.sourceDevices.push(action.payload.device)
      } else if (action.payload.column === 'matrix') {
        tract.matrixDevices.push(action.payload.device)
      } else if (action.payload.column === 'sink') {
        tract.sinkDevices.push(action.payload.device)
      }
    },
    removeDeviceFromTract: (state, action: PayloadAction<{ tractId: string; deviceId: string; column: 'source' | 'matrix' | 'sink' }>) => {
      const tract = state.tracts.find(t => t.id === action.payload.tractId)
      if (!tract) return
      if (action.payload.column === 'source') {
        tract.sourceDevices = tract.sourceDevices.filter(d => d.id !== action.payload.deviceId)
      } else if (action.payload.column === 'matrix') {
        tract.matrixDevices = tract.matrixDevices.filter(d => d.id !== action.payload.deviceId)
      } else if (action.payload.column === 'sink') {
        tract.sinkDevices = tract.sinkDevices.filter(d => d.id !== action.payload.deviceId)
      }
    },
    updateDeviceInTract: (state, action: PayloadAction<{ tractId: string; deviceId: string; updates: Partial<TractDevice> }>) => {
      const tract = state.tracts.find(t => t.id === action.payload.tractId)
      if (!tract) return
      const allDevices = [...tract.sourceDevices, ...tract.matrixDevices, ...tract.sinkDevices]
      const device = allDevices.find(d => d.id === action.payload.deviceId)
      if (!device) return
      Object.assign(device, action.payload.updates)
      // После обновления пересчитываем сеть, если изменились Ethernet или PoE
      if ('ethernet' in action.payload.updates || 'poeEnabled' in action.payload.updates || 'poePower' in action.payload.updates) {
        const result = assignNetwork(tract, device)
        if (!result.success) {
          console.warn(result.error)
          // Можно откатить изменения, но пока просто предупреждение
        }
      }
    },
  },
})

export const {
  setTracts,
  addTract,
  updateTract,
  deleteTract,
  setActiveTract,
  setViewMode,
  setActiveCalculator,
  addDeviceToTract,
  removeDeviceFromTract,
  updateDeviceInTract,
} = tractsSlice.actions

export default tractsSlice.reducer
