import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { VideoSettings } from './videoSlice'
import { calcVideoBitrate } from './videoSlice'

export interface TractDevice {
  id: string
  type: string
  modelName: string
  latency: number
  poeEnabled?: boolean
  powerW: number
  shortName: string
  attachedSwitchId?: string
  attachedPortNumber?: number
  ethernet?: boolean
  bitrateFactor?: number
}

export interface SwitchPort {
  number: number
  deviceId: string | null
}

export interface NetworkSwitch {
  id: string
  type: 'networkSwitch'
  modelName: string
  ports: SwitchPort[]
  speed: number
  switchingLatency: number
  poeBudget: number
  powerW: number
  shortName: string
  attachedTo?: string
}

export interface Tract {
  id: string
  name: string
  sourceDevices: TractDevice[]
  sinkDevices: TractDevice[]
  networkSwitches: NetworkSwitch[]
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
  const allDevices: TractDevice[] = [...tract.sourceDevices, ...tract.sinkDevices]
  const switches = tract.networkSwitches

  const totalLatency = allDevices.reduce((sum, d) => sum + d.latency, 0) +
    switches.reduce((sum, s) => sum + s.switchingLatency, 0)

  let totalBitrate = calcVideoBitrate(videoSettings)
  allDevices.forEach(dev => {
    if (dev.bitrateFactor !== undefined) {
      totalBitrate = totalBitrate * dev.bitrateFactor
    }
  })
  totalBitrate = Math.round(totalBitrate)

  let totalPower = 0
  let usedPoE = 0
  const totalPoEBudget = switches.reduce((sum, sw) => sum + (sw.poeBudget || 0), 0)

  allDevices.forEach(dev => {
    totalPower += dev.powerW || 0
    if (dev.poeEnabled) usedPoE += dev.powerW || 0
  })
  switches.forEach(sw => {
    totalPower += sw.powerW || 0
    if (sw.poeBudget) usedPoE += sw.powerW
  })

  const totalPorts = switches.reduce((sum, sw) => sum + sw.ports.length, 0)
  const usedPorts = switches.reduce((sum, sw) => sum + sw.ports.filter(p => p.deviceId !== null).length, 0)

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
    addDeviceToTract: (state, action: PayloadAction<{ tractId: string; device: TractDevice }>) => {
      const tract = state.tracts.find(t => t.id === action.payload.tractId)
      if (tract) {
        tract.sourceDevices.push(action.payload.device)
      }
    },
    removeDeviceFromTract: (state, action: PayloadAction<{ tractId: string; deviceId: string }>) => {
      const tract = state.tracts.find(t => t.id === action.payload.tractId)
      if (tract) {
        tract.sourceDevices = tract.sourceDevices.filter(d => d.id !== action.payload.deviceId)
        tract.sinkDevices = tract.sinkDevices.filter(d => d.id !== action.payload.deviceId)
      }
    },
    addSwitchToTract: (state, action: PayloadAction<{ tractId: string; sw: NetworkSwitch }>) => {
      const tract = state.tracts.find(t => t.id === action.payload.tractId)
      if (tract) tract.networkSwitches.push(action.payload.sw)
    },
    removeSwitchFromTract: (state, action: PayloadAction<{ tractId: string; switchId: string }>) => {
      const tract = state.tracts.find(t => t.id === action.payload.tractId)
      if (tract) tract.networkSwitches = tract.networkSwitches.filter(s => s.id !== action.payload.switchId)
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
  addSwitchToTract,
  removeSwitchFromTract,
} = tractsSlice.actions

export default tractsSlice.reducer
