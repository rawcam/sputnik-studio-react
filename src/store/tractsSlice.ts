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
// Возвращает новый тракт (не мутирует исходный)
export const assignNetwork = (
  tract: Tract,
  deviceId: string,
  updatedDevice: Partial<TractDevice>
): { success: boolean; error?: string; updatedTract?: Tract } => {
  // Находим устройство в тракте
  const allDevices = [...tract.sourceDevices, ...tract.matrixDevices, ...tract.sinkDevices]
  const device = allDevices.find(d => d.id === deviceId)
  if (!device) return { success: false, error: 'Устройство не найдено' }

  // Если Ethernet выключен, освобождаем порт и возвращаем тракт без изменений
  if (updatedDevice.ethernet === false && device.ethernet) {
    // Нужно отключить устройство от сети
    const newTract = { ...tract }
    const targetSwitch = newTract.matrixDevices.find(sw => sw.id === device.attachedSwitchId)
    if (targetSwitch && device.attachedPortNumber) {
      targetSwitch.usedPorts = targetSwitch.usedPorts?.filter(p => p !== device.attachedPortNumber) || []
      if (device.poeEnabled) {
        targetSwitch.usedPoE = (targetSwitch.usedPoE || 0) - (device.poePower || 0)
      }
    }
    // Обновляем устройство в нужном массиве
    const deviceCopy = { ...device, attachedSwitchId: undefined, attachedPortNumber: undefined, ethernet: false }
    // Заменяем устройство в массивах
    const updateArray = (arr: TractDevice[]) => arr.map(d => d.id === deviceId ? deviceCopy : d)
    newTract.sourceDevices = updateArray(newTract.sourceDevices)
    newTract.matrixDevices = updateArray(newTract.matrixDevices)
    newTract.sinkDevices = updateArray(newTract.sinkDevices)
    return { success: true, updatedTract: newTract }
  }

  // Если Ethernet включается, ищем коммутатор
  if (updatedDevice.ethernet === true && !device.ethernet) {
    const targetSwitch = tract.matrixDevices.find(sw => {
      if (!sw.ports) return false
      const freePorts = sw.ports - (sw.usedPorts?.length || 0)
      if (freePorts === 0) return false
      const devicePoE = updatedDevice.poeEnabled !== undefined ? updatedDevice.poeEnabled : device.poeEnabled
      const devicePoEPower = updatedDevice.poePower !== undefined ? updatedDevice.poePower : device.poePower
      if (devicePoE && (!sw.poeBudget || (sw.poeBudget - (sw.usedPoE || 0) < (devicePoEPower || 0)))) return false
      return true
    })
    if (!targetSwitch) {
      return { success: false, error: 'Нет подходящего коммутатора с свободными портами и достаточным PoE-бюджетом' }
    }
    // Создаём копию тракта и коммутатора
    const newTract = { ...tract }
    const swIndex = newTract.matrixDevices.findIndex(sw => sw.id === targetSwitch.id)
    if (swIndex === -1) return { success: false, error: 'Коммутатор не найден' }
    const sw = { ...newTract.matrixDevices[swIndex] }
    // Находим свободный порт
    let newPort = 1
    const used = new Set(sw.usedPorts || [])
    while (used.has(newPort)) newPort++
    sw.usedPorts = [...(sw.usedPorts || []), newPort]
    if (updatedDevice.poeEnabled) {
      sw.usedPoE = (sw.usedPoE || 0) + (updatedDevice.poePower || device.poePower || 0)
    }
    newTract.matrixDevices[swIndex] = sw
    // Обновляем устройство
    const deviceCopy = { ...device, attachedSwitchId: sw.id, attachedPortNumber: newPort, ethernet: true }
    const updateArray = (arr: TractDevice[]) => arr.map(d => d.id === deviceId ? deviceCopy : d)
    newTract.sourceDevices = updateArray(newTract.sourceDevices)
    newTract.matrixDevices = updateArray(newTract.matrixDevices)
    newTract.sinkDevices = updateArray(newTract.sinkDevices)
    return { success: true, updatedTract: newTract }
  }

  // Если Ethernet не меняется, просто возвращаем тракт без изменений
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
      // Находим устройство в массивах
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
      // Теперь обрабатываем сетевое подключение, если изменились ethernet или poe
      const allDevices = [...tract.sourceDevices, ...tract.matrixDevices, ...tract.sinkDevices]
      const device = allDevices.find(d => d.id === action.payload.deviceId)
      if (device && (action.payload.updates.ethernet !== undefined || action.payload.updates.poeEnabled !== undefined)) {
        const result = assignNetwork(tract, action.payload.deviceId, action.payload.updates)
        if (result.success && result.updatedTract) {
          // Заменяем текущий тракт на обновлённый
          const index = state.tracts.findIndex(t => t.id === tract.id)
          if (index !== -1) {
            // Пересчитываем статистику
            const recalculated = recalcTract(result.updatedTract, (state as any).videoSettings || { resolution: '4K', chroma: '422', fps: 60, colorSpace: 'YCbCr', bitDepth: 10 })
            state.tracts[index] = recalculated
          }
        }
      } else {
        // Если сеть не трогали, просто пересчитываем тракт
        const index = state.tracts.findIndex(t => t.id === tract.id)
        if (index !== -1) {
          const videoSettings = (state as any).videoSettings || { resolution: '4K', chroma: '422', fps: 60, colorSpace: 'YCbCr', bitDepth: 10 }
          const recalculated = recalcTract(tract, videoSettings)
          state.tracts[index] = recalculated
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
