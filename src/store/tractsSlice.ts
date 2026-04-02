import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './index'
import { VideoSettings, calcVideoBitrate } from './videoSlice'

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

// Вспомогательная функция для управления портами и PoE
const assignNetworkInternal = (
  tract: Tract,
  deviceId: string,
  updates: Partial<TractDevice>
): { success: boolean; error?: string; updatedTract?: Tract } => {
  const allDevices = [...tract.sourceDevices, ...tract.matrixDevices, ...tract.sinkDevices]
  const device = allDevices.find(d => d.id === deviceId)
  if (!device) return { success: false, error: 'Устройство не найдено' }

  const newEthernet = updates.ethernet !== undefined ? updates.ethernet : device.ethernet
  const newPoeEnabled = updates.poeEnabled !== undefined ? updates.poeEnabled : device.poeEnabled
  const newPoePower = updates.poePower !== undefined ? updates.poePower : device.poePower

  // Отключение Ethernet
  if (newEthernet === false && device.ethernet === true) {
    const newTract = JSON.parse(JSON.stringify(tract))
    const targetSwitch = newTract.matrixDevices.find((sw: any) => sw.id === device.attachedSwitchId)
    if (targetSwitch && device.attachedPortNumber) {
      // Освобождаем порт
      targetSwitch.usedPorts = (targetSwitch.usedPorts || []).filter((p: number) => p !== device.attachedPortNumber)
      // Возвращаем PoE
      if (device.poe && device.poeEnabled) {
        targetSwitch.usedPoE = (targetSwitch.usedPoE || 0) - (device.poePower || 0)
      }
    }
    const deviceCopy = { ...device, attachedSwitchId: undefined, attachedPortNumber: undefined, ethernet: false, poeEnabled: false }
    const updateArray = (arr: any[]) => arr.map((d: any) => d.id === deviceId ? deviceCopy : d)
    newTract.sourceDevices = updateArray(newTract.sourceDevices)
    newTract.matrixDevices = updateArray(newTract.matrixDevices)
    newTract.sinkDevices = updateArray(newTract.sinkDevices)
    return { success: true, updatedTract: newTract }
  }

  // Включение Ethernet (поиск подходящего коммутатора)
  if (newEthernet === true && device.ethernet === false) {
    const targetSwitch = tract.matrixDevices.find((sw: any) => {
      if (!sw.ports) return false
      const freePorts = sw.ports - (sw.usedPorts?.length || 0)
      if (freePorts <= 0) return false
      if (newPoeEnabled) {
        if (!sw.poeBudget) return false
        const availablePoE = sw.poeBudget - (sw.usedPoE || 0)
        if (availablePoE < (newPoePower || 0)) return false
      }
      return true
    })
    if (!targetSwitch) {
      return { success: false, error: 'Нет подходящего коммутатора (свободные порты и/или PoE)' }
    }
    const newTract = JSON.parse(JSON.stringify(tract))
    const swIndex = newTract.matrixDevices.findIndex((sw: any) => sw.id === targetSwitch.id)
    if (swIndex === -1) return { success: false, error: 'Коммутатор не найден' }
    const sw = newTract.matrixDevices[swIndex]
    // Инициализируем usedPorts и usedPoE, если их нет
    if (!sw.usedPorts) sw.usedPorts = []
    if (sw.usedPoE === undefined) sw.usedPoE = 0

    let newPort = 1
    const used = new Set(sw.usedPorts)
    while (used.has(newPort)) newPort++
    sw.usedPorts.push(newPort)
    if (newPoeEnabled) {
      sw.usedPoE += (newPoePower || 0)
    }
    const deviceCopy = { ...device, attachedSwitchId: sw.id, attachedPortNumber: newPort, ethernet: true, poeEnabled: newPoeEnabled, poePower: newPoePower }
    const updateArray = (arr: any[]) => arr.map((d: any) => d.id === deviceId ? deviceCopy : d)
    newTract.sourceDevices = updateArray(newTract.sourceDevices)
    newTract.matrixDevices = updateArray(newTract.matrixDevices)
    newTract.sinkDevices = updateArray(newTract.sinkDevices)
    return { success: true, updatedTract: newTract }
  }

  // Изменение PoE при уже включённом Ethernet
  if (device.ethernet === true && (updates.poeEnabled !== undefined || updates.poePower !== undefined)) {
    const newTract = JSON.parse(JSON.stringify(tract))
    const targetSwitch = newTract.matrixDevices.find((sw: any) => sw.id === device.attachedSwitchId)
    if (targetSwitch) {
      // Возвращаем старый PoE
      if (device.poe && device.poeEnabled) {
        targetSwitch.usedPoE = (targetSwitch.usedPoE || 0) - (device.poePower || 0)
      }
      // Выделяем новый
      if (newPoeEnabled) {
        const availablePoE = (targetSwitch.poeBudget || 0) - (targetSwitch.usedPoE || 0)
        if (availablePoE < (newPoePower || 0)) {
          return { success: false, error: 'Недостаточно PoE-бюджета' }
        }
        targetSwitch.usedPoE = (targetSwitch.usedPoE || 0) + (newPoePower || 0)
      }
    }
    const deviceCopy = { ...device, poeEnabled: newPoeEnabled, poePower: newPoePower }
    const updateArray = (arr: any[]) => arr.map((d: any) => d.id === deviceId ? deviceCopy : d)
    newTract.sourceDevices = updateArray(newTract.sourceDevices)
    newTract.matrixDevices = updateArray(newTract.matrixDevices)
    newTract.sinkDevices = updateArray(newTract.sinkDevices)
    return { success: true, updatedTract: newTract }
  }

  return { success: true, updatedTract: tract }
}

// Thunk для обновления устройства (с учётом сети и PoE)
export const updateDeviceThunk = createAsyncThunk<
  { tractId: string; updatedTract: Tract },
  { tractId: string; deviceId: string; updates: Partial<TractDevice> },
  { state: RootState }
>(
  'tracts/updateDeviceThunk',
  async (payload, { getState }) => {
    const { tractId, deviceId, updates } = payload
    const state = getState()
    const tract = state.tracts.tracts.find(t => t.id === tractId)
    if (!tract) throw new Error('Тракт не найден')

    const videoSettings = state.video
    const result = assignNetworkInternal(tract, deviceId, updates)
    if (!result.success) {
      throw new Error(result.error || 'Ошибка при подключении к сети')
    }
    let updatedTract = result.updatedTract!
    updatedTract = recalcTract(updatedTract, videoSettings)
    return { tractId, updatedTract }
  }
)

// Thunk для пересчёта тракта (например, при изменении videoSettings)
export const recalcTractThunk = createAsyncThunk<
  { tractId: string; updatedTract: Tract },
  string,
  { state: RootState }
>(
  'tracts/recalcTractThunk',
  async (tractId, { getState }) => {
    const state = getState()
    const tract = state.tracts.tracts.find(t => t.id === tractId)
    if (!tract) throw new Error('Тракт не найден')
    const videoSettings = state.video
    const updatedTract = recalcTract(tract, videoSettings)
    return { tractId, updatedTract }
  }
)

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
      const device = action.payload.device
      if (action.payload.column === 'matrix' && device.ports) {
        device.usedPorts = device.usedPorts || []
        device.usedPoE = device.usedPoE || 0
      }
      if (action.payload.column === 'source') {
        tract.sourceDevices.push(device)
      } else if (action.payload.column === 'matrix') {
        tract.matrixDevices.push(device)
      } else if (action.payload.column === 'sink') {
        tract.sinkDevices.push(device)
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateDeviceThunk.fulfilled, (state, action) => {
        const { tractId, updatedTract } = action.payload
        const index = state.tracts.findIndex(t => t.id === tractId)
        if (index !== -1) {
          state.tracts[index] = updatedTract
        }
      })
      .addCase(recalcTractThunk.fulfilled, (state, action) => {
        const { tractId, updatedTract } = action.payload
        const index = state.tracts.findIndex(t => t.id === tractId)
        if (index !== -1) {
          state.tracts[index] = updatedTract
        }
      })
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
} = tractsSlice.actions

export default tractsSlice.reducer
