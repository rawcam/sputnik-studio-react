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
  // для матриц и коммутаторов
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

// Экшен для подключения устройства к сети (автоматический выбор коммутатора)
export const connectDeviceToNetwork = (tract: Tract, deviceId: string): { success: boolean; error?: string; updatedTract?: Tract } => {
  // Находим устройство
  const allDevices = [...tract.sourceDevices, ...tract.matrixDevices, ...tract.sinkDevices]
  const device = allDevices.find(d => d.id === deviceId)
  if (!device) return { success: false, error: 'Устройство не найдено' }
  if (device.attachedSwitchId) return { success: false, error: 'Устройство уже подключено к сети' }
  if (!device.ethernet) return { success: false, error: 'Устройство не поддерживает сетевое подключение' }

  // Ищем подходящий коммутатор
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

  // Создаём копии
  const newTract = { ...tract }
  const swIndex = newTract.matrixDevices.findIndex(sw => sw.id === targetSwitch.id)
  if (swIndex === -1) return { success: false, error: 'Коммутатор не найден' }
  const sw = { ...newTract.matrixDevices[swIndex] }

  // Находим свободный порт
  let newPort = 1
  const used = new Set(sw.usedPorts || [])
  while (used.has(newPort)) newPort++
  sw.usedPorts = [...(sw.usedPorts || []), newPort]
  if (device.poeEnabled) {
    sw.usedPoE = (sw.usedPoE || 0) + (device.poePower || 0)
  }
  newTract.matrixDevices[swIndex] = sw

  // Обновляем устройство
  const updatedDevice = { ...device, attachedSwitchId: sw.id, attachedPortNumber: newPort }
  const updateArray = (arr: TractDevice[]) => arr.map(d => d.id === deviceId ? updatedDevice : d)
  newTract.sourceDevices = updateArray(newTract.sourceDevices)
  newTract.matrixDevices = updateArray(newTract.matrixDevices)
  newTract.sinkDevices = updateArray(newTract.sinkDevices)

  return { success: true, updatedTract: newTract }
}

// Экшен для отключения устройства от сети
export const disconnectDeviceFromNetwork = (tract: Tract, deviceId: string): { success: boolean; error?: string; updatedTract?: Tract } => {
  const allDevices = [...tract.sourceDevices, ...tract.matrixDevices, ...tract.sinkDevices]
  const device = allDevices.find(d => d.id === deviceId)
  if (!device) return { success: false, error: 'Устройство не найдено' }
  if (!device.attachedSwitchId) return { success: false, error: 'Устройство не подключено к сети' }

  const newTract = { ...tract }
  // Находим коммутатор и освобождаем порт
  const swIndex = newTract.matrixDevices.findIndex(sw => sw.id === device.attachedSwitchId)
  if (swIndex !== -1) {
    const sw = { ...newTract.matrixDevices[swIndex] }
    if (device.attachedPortNumber) {
      sw.usedPorts = sw.usedPorts?.filter(p => p !== device.attachedPortNumber) || []
    }
    if (device.poeEnabled) {
      sw.usedPoE = (sw.usedPoE || 0) - (device.poePower || 0)
    }
    newTract.matrixDevices[swIndex] = sw
  }
  // Обновляем устройство
  const updatedDevice = { ...device, attachedSwitchId: undefined, attachedPortNumber: undefined }
  const updateArray = (arr: TractDevice[]) => arr.map(d => d.id === deviceId ? updatedDevice : d)
  newTract.sourceDevices = updateArray(newTract.sourceDevices)
  newTract.matrixDevices = updateArray(newTract.matrixDevices)
  newTract.sinkDevices = updateArray(newTract.sinkDevices)

  return { success: true, updatedTract: newTract }
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
      // Для устройств в колонке matrix инициализируем usedPorts и usedPoE
      if (action.payload.column === 'matrix') {
        const newDevice = { ...action.payload.device }
        if (newDevice.ports && newDevice.ports > 0) {
          newDevice.usedPorts = newDevice.usedPorts || []
          if (newDevice.poeBudget) newDevice.usedPoE = 0
        }
        tract.matrixDevices.push(newDevice)
      } else if (action.payload.column === 'source') {
        tract.sourceDevices.push(action.payload.device)
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
      let found = false
      const updateArray = (arr: TractDevice[]) => arr.map(d => {
        if (d.id === action.payload.deviceId) {
          found = true
          return { ...d, ...action.payload.updates }
        }
        return d
      })
      tract.sourceDevices = updateArray(tract.sourceDevices)
      if (!found) tract.matrixDevices = updateArray(tract.matrixDevices)
      if (!found) tract.sinkDevices = updateArray(tract.sinkDevices)
      // Не пересчитываем тракт здесь – это сделает ActiveTract в useEffect
    },
    connectDeviceToNetwork: (state, action: PayloadAction<{ tractId: string; deviceId: string }>) => {
      const tract = state.tracts.find(t => t.id === action.payload.tractId)
      if (!tract) return
      const result = connectDeviceToNetwork(tract, action.payload.deviceId)
      if (result.success && result.updatedTract) {
        const index = state.tracts.findIndex(t => t.id === tract.id)
        if (index !== -1) state.tracts[index] = result.updatedTract
      } else {
        console.warn(result.error)
      }
    },
    disconnectDeviceFromNetwork: (state, action: PayloadAction<{ tractId: string; deviceId: string }>) => {
      const tract = state.tracts.find(t => t.id === action.payload.tractId)
      if (!tract) return
      const result = disconnectDeviceFromNetwork(tract, action.payload.deviceId)
      if (result.success && result.updatedTract) {
        const index = state.tracts.findIndex(t => t.id === tract.id)
        if (index !== -1) state.tracts[index] = result.updatedTract
      } else {
        console.warn(result.error)
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
  connectDeviceToNetwork,
  disconnectDeviceFromNetwork,
} = tractsSlice.actions

export default tractsSlice.reducer
