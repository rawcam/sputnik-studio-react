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
  usb?: boolean
  usbVersion?: string
  audioEmbed?: number
  hasNetwork?: boolean
  poe?: boolean
  expanded?: boolean
  shortPrefix?: string
  ports?: number
  usedPorts?: number[]
  poeBudget?: number
  switchingLatency?: number
  usedPoE?: number
  inputs?: number
  outputs?: number
  latencyIn?: number
  latencyOut?: number
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

const generateShortName = (prefix: string, existingDevices: TractDevice[]): string => {
  let maxNum = 0
  const regex = new RegExp(`^${prefix}(\\d+)$`)
  for (const d of existingDevices) {
    if (d.shortName && regex.test(d.shortName)) {
      const num = parseInt(d.shortName.match(regex)![1], 10)
      if (num > maxNum) maxNum = num
    }
  }
  return prefix + (maxNum + 1)
}

const updateShortNames = (tract: Tract) => {
  const allDevices = [...tract.sourceDevices, ...tract.matrixDevices, ...tract.sinkDevices]
  for (const dev of allDevices) {
    if (!dev.shortName) {
      let prefix = dev.shortPrefix
      if (!prefix) {
        if (dev.type === 'source') prefix = 'SRC'
        else if (dev.type === 'tx') prefix = 'TX'
        else if (dev.type === 'rx') prefix = 'RX'
        else if (dev.type === 'matrix') prefix = 'MX'
        else if (dev.type === 'networkSwitch') prefix = 'SW'
        else if (dev.type === 'display') prefix = 'DISP'
        else prefix = 'DEV'
      }
      dev.shortName = generateShortName(prefix, allDevices)
    }
  }
}

export const recalcTract = (tract: Tract, videoSettings: VideoSettings): Tract => {
  const allDevices = [...tract.sourceDevices, ...tract.matrixDevices, ...tract.sinkDevices]
  const fps = videoSettings.fps
  const codecFactor = (videoSettings.resolution === '1080p' ? 1 : videoSettings.resolution === '4K' ? 1.5 : 2.5) *
    (videoSettings.chroma === '444' ? 1.2 : videoSettings.chroma === '422' ? 1 : 0.9) *
    (videoSettings.colorSpace === 'RGB' ? 1.2 : 1) *
    (videoSettings.bitDepth / 10) *
    (fps / 60)

  let totalLatency = 0
  allDevices.forEach(dev => {
    let d = dev.latency || 0
    if (dev.usb) d += 0.5
    if (dev.audioEmbed) d += 1.0
    if (dev.type === 'tx' || dev.type === 'rx' || dev.type === 'ledProc') d *= codecFactor
    totalLatency += d
  })
  tract.matrixDevices.forEach(sw => {
    if (sw.switchingLatency) totalLatency += sw.switchingLatency
    if (sw.latencyIn) totalLatency += sw.latencyIn
    if (sw.latencyOut) totalLatency += sw.latencyOut
  })

  let totalBitrate = calcVideoBitrate(videoSettings)
  allDevices.forEach(dev => {
    if (dev.bitrateFactor !== undefined) totalBitrate *= dev.bitrateFactor
    if (dev.type === 'rx' && dev.usb) {
      const usbSpeeds: Record<string, number> = { '2.0': 480, '3.0': 5000, '3.1': 10000 }
      totalBitrate += usbSpeeds[dev.usbVersion || '2.0'] || 0
    }
  })
  totalBitrate = Math.round(totalBitrate)

  let totalPower = 0
  let usedPoE = 0
  let totalPoEBudget = 0
  tract.matrixDevices.forEach(sw => {
    totalPoEBudget += sw.poeBudget || 0
    totalPower += sw.powerW || 0
  })
  allDevices.forEach(dev => {
    totalPower += dev.powerW || 0
    if (dev.poe && dev.poeEnabled) usedPoE += dev.poePower || dev.powerW || 0
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

// Новая функция assignNetwork, строго по логике v6
const assignNetwork = (tract: Tract, deviceId: string, updates: Partial<TractDevice>): { success: boolean; error?: string; updatedTract?: Tract } => {
  // Находим устройство
  const allDevices = [...tract.sourceDevices, ...tract.matrixDevices, ...tract.sinkDevices]
  const device = allDevices.find(d => d.id === deviceId)
  if (!device) return { success: false, error: 'Устройство не найдено' }

  // Определяем, что изменилось
  const newEthernet = updates.ethernet !== undefined ? updates.ethernet : device.ethernet
  const newPoeEnabled = updates.poeEnabled !== undefined ? updates.poeEnabled : device.poeEnabled
  const newPoePower = updates.poePower !== undefined ? updates.poePower : device.poePower

  // Если Ethernet выключается
  if (newEthernet === false && device.ethernet === true) {
    // Создаём копию тракта
    const newTract = { ...tract }
    // Находим коммутатор, к которому было подключено устройство
    const targetSwitch = newTract.matrixDevices.find(sw => sw.id === device.attachedSwitchId)
    if (targetSwitch && device.attachedPortNumber) {
      // Освобождаем порт
      targetSwitch.usedPorts = targetSwitch.usedPorts?.filter(p => p !== device.attachedPortNumber) || []
      // Освобождаем PoE, если было
      if (device.poe && device.poeEnabled) {
        targetSwitch.usedPoE = (targetSwitch.usedPoE || 0) - (device.poePower || 0)
      }
    }
    // Обновляем устройство
    const deviceCopy = { ...device, attachedSwitchId: undefined, attachedPortNumber: undefined, ethernet: false }
    const updateArray = (arr: TractDevice[]) => arr.map(d => d.id === deviceId ? deviceCopy : d)
    newTract.sourceDevices = updateArray(newTract.sourceDevices)
    newTract.matrixDevices = updateArray(newTract.matrixDevices)
    newTract.sinkDevices = updateArray(newTract.sinkDevices)
    return { success: true, updatedTract: newTract }
  }

  // Если Ethernet включается
  if (newEthernet === true && device.ethernet === false) {
    // Ищем подходящий коммутатор
    const targetSwitch = tract.matrixDevices.find(sw => {
      if (!sw.ports) return false
      const freePorts = sw.ports - (sw.usedPorts?.length || 0)
      if (freePorts <= 0) return false
      // Если устройство требует PoE, проверяем бюджет
      if (newPoeEnabled) {
        if (!sw.poeBudget) return false
        const availablePoE = sw.poeBudget - (sw.usedPoE || 0)
        if (availablePoE < (newPoePower || 0)) return false
      }
      return true
    })
    if (!targetSwitch) {
      return { success: false, error: 'Нет подходящего коммутатора (нет свободных портов или недостаточно PoE)' }
    }
    // Создаём копию тракта
    const newTract = { ...tract }
    const swIndex = newTract.matrixDevices.findIndex(sw => sw.id === targetSwitch.id)
    if (swIndex === -1) return { success: false, error: 'Коммутатор не найден' }
    const sw = { ...newTract.matrixDevices[swIndex] }
    // Находим первый свободный порт
    let newPort = 1
    const used = new Set(sw.usedPorts || [])
    while (used.has(newPort)) newPort++
    sw.usedPorts = [...(sw.usedPorts || []), newPort]
    // Если устройство PoE, занимаем бюджет
    if (newPoeEnabled) {
      sw.usedPoE = (sw.usedPoE || 0) + (newPoePower || 0)
    }
    newTract.matrixDevices[swIndex] = sw
    // Обновляем устройство
    const deviceCopy = { ...device, attachedSwitchId: sw.id, attachedPortNumber: newPort, ethernet: true, poeEnabled: newPoeEnabled, poePower: newPoePower }
    const updateArray = (arr: TractDevice[]) => arr.map(d => d.id === deviceId ? deviceCopy : d)
    newTract.sourceDevices = updateArray(newTract.sourceDevices)
    newTract.matrixDevices = updateArray(newTract.matrixDevices)
    newTract.sinkDevices = updateArray(newTract.sinkDevices)
    return { success: true, updatedTract: newTract }
  }

  // Если Ethernet не меняется, но изменился PoE (включили или выключили)
  if (device.ethernet === true && (updates.poeEnabled !== undefined || updates.poePower !== undefined)) {
    const newTract = { ...tract }
    // Находим коммутатор, к которому подключено устройство
    const targetSwitch = newTract.matrixDevices.find(sw => sw.id === device.attachedSwitchId)
    if (targetSwitch && device.attachedPortNumber) {
      // Сначала освобождаем старый PoE, если был
      if (device.poe && device.poeEnabled) {
        targetSwitch.usedPoE = (targetSwitch.usedPoE || 0) - (device.poePower || 0)
      }
      // Затем применяем новый PoE
      if (newPoeEnabled) {
        // Проверяем, хватает ли бюджета
        const availablePoE = (targetSwitch.poeBudget || 0) - (targetSwitch.usedPoE || 0)
        if (availablePoE < (newPoePower || 0)) {
          return { success: false, error: 'Недостаточно PoE-бюджета' }
        }
        targetSwitch.usedPoE = (targetSwitch.usedPoE || 0) + (newPoePower || 0)
      }
    }
    // Обновляем устройство
    const deviceCopy = { ...device, poeEnabled: newPoeEnabled, poePower: newPoePower }
    const updateArray = (arr: TractDevice[]) => arr.map(d => d.id === deviceId ? deviceCopy : d)
    newTract.sourceDevices = updateArray(newTract.sourceDevices)
    newTract.matrixDevices = updateArray(newTract.matrixDevices)
    newTract.sinkDevices = updateArray(newTract.sinkDevices)
    return { success: true, updatedTract: newTract }
  }

  // Ничего не изменилось
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
      updateShortNames(newTract)
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
      if (action.payload.column === 'matrix' && action.payload.device.ports) {
        action.payload.device.usedPorts = []
        action.payload.device.usedPoE = 0
      }
      if (action.payload.column === 'source') {
        tract.sourceDevices.push(action.payload.device)
      } else if (action.payload.column === 'matrix') {
        tract.matrixDevices.push(action.payload.device)
      } else if (action.payload.column === 'sink') {
        tract.sinkDevices.push(action.payload.device)
      }
      updateShortNames(tract)
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
      updateShortNames(tract)
    },
    updateDeviceInTract: (state, action: PayloadAction<{ tractId: string; deviceId: string; updates: Partial<TractDevice> }>) => {
      const tractIndex = state.tracts.findIndex(t => t.id === action.payload.tractId)
      if (tractIndex === -1) return
      const tract = state.tracts[tractIndex]
      let found = false
      const updateArray = (arr: TractDevice[]): TractDevice[] => arr.map(d => {
        if (d.id === action.payload.deviceId) {
          found = true
          return { ...d, ...action.payload.updates }
        }
        return d
      })
      const newSource = updateArray(tract.sourceDevices)
      const newMatrix = updateArray(tract.matrixDevices)
      const newSink = updateArray(tract.sinkDevices)
      if (!found) return
      let updatedTract = { ...tract, sourceDevices: newSource, matrixDevices: newMatrix, sinkDevices: newSink }

      // Если изменился Ethernet или PoE, вызываем assignNetwork
      if (action.payload.updates.ethernet !== undefined || action.payload.updates.poeEnabled !== undefined || action.payload.updates.poePower !== undefined) {
        const result = assignNetwork(updatedTract, action.payload.deviceId, action.payload.updates)
        if (result.success && result.updatedTract) {
          updatedTract = result.updatedTract
        } else if (result.error) {
          console.warn(result.error)
        }
      }
      // Пересчитываем статистику
      const videoSettings = (state as any).videoSettings || { resolution: '4K', chroma: '422', fps: 60, colorSpace: 'YCbCr', bitDepth: 10 }
      const recalculated = recalcTract(updatedTract, videoSettings)
      state.tracts[tractIndex] = recalculated
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
