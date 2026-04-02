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
  speed?: number        // скорость порта коммутатора (Мбит/с)
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
  networkLoadPercent: number   // загрузка сети в % (от 0 до 100)
  linkSpeed: number            // минимальная скорость звена (Мбит/с)
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

// Вспомогательные функции
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

// Получение скорости порта по типу коммутатора (если не указана явно)
const getSwitchSpeed = (sw: TractDevice): number => {
  if (sw.speed) return sw.speed
  // По умолчанию по модели можно определить, но пока зададим 1000
  return 1000
}

// Получение пропускной способности среды (Мбит/с) по типу кабеля
const getLinkSpeed = (cableType: string): number => {
  const speeds: Record<string, number> = {
    Cat5e: 1000,
    Cat6: 1000,
    Cat6a: 10000,
    Cat7: 10000,
    Cat8: 40000,
    OM3: 10000,
    wireless: 600,   // пример
  }
  return speeds[cableType] || 1000
}

// Пересчёт тракта (центральная функция)
export const recalcTract = (tract: Tract, videoSettings: VideoSettings, networkSettings: any): Tract => {
  const allDevices = [...tract.sourceDevices, ...tract.matrixDevices, ...tract.sinkDevices]
  
  // 1. Базовый битрейт видео (несжатый)
  let rawBitrate = calcVideoBitrate(videoSettings)
  
  // 2. Применяем коэффициенты сжатия кодеков (tx и rx)
  let codecFactor = 1.0
  const txDevice = tract.sourceDevices.find(d => d.type === 'tx')
  if (txDevice && txDevice.bitrateFactor) codecFactor *= txDevice.bitrateFactor
  const rxDevice = tract.sinkDevices.find(d => d.type === 'rx')
  if (rxDevice && rxDevice.bitrateFactor) codecFactor *= rxDevice.bitrateFactor
  let totalBitrate = rawBitrate * codecFactor
  
  // Дополнительные факторы от других устройств (например, ledProc)
  allDevices.forEach(dev => {
    if (dev.bitrateFactor && dev.type !== 'tx' && dev.type !== 'rx') {
      totalBitrate *= dev.bitrateFactor
    }
    if (dev.type === 'rx' && dev.usb) {
      const usbSpeeds: Record<string, number> = { '2.0': 480, '3.0': 5000, '3.1': 10000 }
      totalBitrate += usbSpeeds[dev.usbVersion || '2.0'] || 0
    }
  })
  totalBitrate = Math.round(totalBitrate)

  // 3. Расчёт задержки
  let totalLatency = 0
  // Задержки устройств
  allDevices.forEach(dev => {
    let d = dev.latency || 0
    if (dev.usb) d += 0.5
    if (dev.audioEmbed) d += 1.0
    totalLatency += d
  })
  // Задержки матриц и коммутаторов
  tract.matrixDevices.forEach(sw => {
    if (sw.switchingLatency) totalLatency += sw.switchingLatency
    if (sw.latencyIn) totalLatency += sw.latencyIn
    if (sw.latencyOut) totalLatency += sw.latencyOut
  })
  // Задержка среды передачи (примерно 0.1 мс на 100 м, принимаем 0.2 мс на тракт)
  totalLatency += 0.2

  // 4. Мощность и PoE
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

  // 5. Порты и загрузка сети
  let totalPorts = 0, usedPorts = 0
  let minSwitchSpeed = Infinity
  tract.matrixDevices.forEach(sw => {
    if (sw.ports) {
      totalPorts += sw.ports
      usedPorts += sw.usedPorts?.length || 0
    }
    if (sw.type === 'networkSwitch') {
      const speed = getSwitchSpeed(sw)
      if (speed < minSwitchSpeed) minSwitchSpeed = speed
    }
  })
  const linkSpeed = getLinkSpeed(networkSettings.cable)
  const effectiveSpeed = Math.min(minSwitchSpeed, linkSpeed)
  let networkLoadPercent = 0
  if (effectiveSpeed !== Infinity && effectiveSpeed > 0) {
    networkLoadPercent = Math.min(100, Math.round((totalBitrate / effectiveSpeed) * 100))
  }

  return {
    ...tract,
    totalLatency: Math.round(totalLatency * 100) / 100,
    totalBitrate,
    totalPower,
    totalPoEBudget,
    usedPoE,
    usedPorts,
    totalPorts,
    networkLoadPercent,
    linkSpeed: effectiveSpeed,
  }
}

// Внутренняя функция для управления портами/PoE (без пересчёта)
const assignNetworkInternal = (
  tract: Tract,
  deviceId: string,
  updates: Partial<TractDevice>
): { success: boolean; error?: string; updatedTract?: Tract } => {
  const allDevices = [...tract.sourceDevices, ...tract.matrixDevices, ...tract.sinkDevices]
  const device = allDevices.find(d => d.id === deviceId)
  if (!device) return { success: false, error: 'Устройство не найдено' }

  // Определяем новые значения, учитывая связку PoE/Ethernet
  let newEthernet = updates.ethernet !== undefined ? updates.ethernet : device.ethernet
  let newPoeEnabled = updates.poeEnabled !== undefined ? updates.poeEnabled : device.poeEnabled
  let newPoePower = updates.poePower !== undefined ? updates.poePower : device.poePower

  // Правило: если включаем PoE, то Ethernet должен быть включён
  if (newPoeEnabled && !newEthernet) {
    newEthernet = true
  }
  // Правило: если выключаем Ethernet, то PoE тоже выключается
  if (newEthernet === false && device.ethernet === true) {
    newPoeEnabled = false
    newPoePower = 0
  }

  // Отключение Ethernet (освобождение ресурсов)
  if (newEthernet === false && device.ethernet === true) {
    const newTract = JSON.parse(JSON.stringify(tract))
    const targetSwitch = newTract.matrixDevices.find((sw: any) => sw.id === device.attachedSwitchId)
    if (targetSwitch && device.attachedPortNumber) {
      targetSwitch.usedPorts = (targetSwitch.usedPorts || []).filter((p: number) => p !== device.attachedPortNumber)
      if (device.poe && device.poeEnabled) {
        targetSwitch.usedPoE = (targetSwitch.usedPoE || 0) - (device.poePower || 0)
      }
    }
    const deviceCopy = { ...device, attachedSwitchId: undefined, attachedPortNumber: undefined, ethernet: false, poeEnabled: false, poePower: 0 }
    const updateArray = (arr: any[]) => arr.map((d: any) => d.id === deviceId ? deviceCopy : d)
    newTract.sourceDevices = updateArray(newTract.sourceDevices)
    newTract.matrixDevices = updateArray(newTract.matrixDevices)
    newTract.sinkDevices = updateArray(newTract.sinkDevices)
    return { success: true, updatedTract: newTract }
  }

  // Включение Ethernet (поиск коммутатора)
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
    if (!sw.usedPorts) sw.usedPorts = []
    if (sw.usedPoE === undefined) sw.usedPoE = 0

    let newPort = 1
    const used = new Set(sw.usedPorts)
    while (used.has(newPort)) newPort++
    sw.usedPorts.push(newPort)
    if (newPoeEnabled) {
      sw.usedPoE += (newPoePower || 0)
    }
    const deviceCopy = { ...device, attachedSwitchId: sw.id, attachedPortNumber: newPort, ethernet: true, poeEnabled: newPoeEnabled, poePower: newPoePower || 0 }
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
      if (device.poe && device.poeEnabled) {
        targetSwitch.usedPoE = (targetSwitch.usedPoE || 0) - (device.poePower || 0)
      }
      if (newPoeEnabled) {
        const availablePoE = (targetSwitch.poeBudget || 0) - (targetSwitch.usedPoE || 0)
        if (availablePoE < (newPoePower || 0)) {
          return { success: false, error: 'Недостаточно PoE-бюджета' }
        }
        targetSwitch.usedPoE = (targetSwitch.usedPoE || 0) + (newPoePower || 0)
      }
    }
    const deviceCopy = { ...device, poeEnabled: newPoeEnabled, poePower: newPoePower || 0 }
    const updateArray = (arr: any[]) => arr.map((d: any) => d.id === deviceId ? deviceCopy : d)
    newTract.sourceDevices = updateArray(newTract.sourceDevices)
    newTract.matrixDevices = updateArray(newTract.matrixDevices)
    newTract.sinkDevices = updateArray(newTract.sinkDevices)
    return { success: true, updatedTract: newTract }
  }

  return { success: true, updatedTract: tract }
}

// Thunk для обновления устройства
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
    const networkSettings = state.network
    const result = assignNetworkInternal(tract, deviceId, updates)
    if (!result.success) throw new Error(result.error || 'Ошибка сети/PoE')
    let updatedTract = result.updatedTract!
    updatedTract = recalcTract(updatedTract, videoSettings, networkSettings)
    return { tractId, updatedTract }
  }
)

// Thunk для удаления устройства с освобождением ресурсов
export const removeDeviceThunk = createAsyncThunk<
  { tractId: string; updatedTract: Tract },
  { tractId: string; deviceId: string; column: 'source' | 'matrix' | 'sink' },
  { state: RootState }
>(
  'tracts/removeDeviceThunk',
  async (payload, { getState }) => {
    const { tractId, deviceId, column } = payload
    const state = getState()
    const tract = state.tracts.tracts.find(t => t.id === tractId)
    if (!tract) throw new Error('Тракт не найден')

    // Копия тракта
    const newTract = JSON.parse(JSON.stringify(tract)) as Tract
    let deviceToRemove: TractDevice | undefined

    // Находим и удаляем устройство, заодно освобождаем ресурсы
    if (column === 'source') {
      deviceToRemove = newTract.sourceDevices.find(d => d.id === deviceId)
      newTract.sourceDevices = newTract.sourceDevices.filter(d => d.id !== deviceId)
    } else if (column === 'matrix') {
      deviceToRemove = newTract.matrixDevices.find(d => d.id === deviceId)
      newTract.matrixDevices = newTract.matrixDevices.filter(d => d.id !== deviceId)
    } else {
      deviceToRemove = newTract.sinkDevices.find(d => d.id === deviceId)
      newTract.sinkDevices = newTract.sinkDevices.filter(d => d.id !== deviceId)
    }

    if (deviceToRemove && deviceToRemove.attachedSwitchId && deviceToRemove.attachedPortNumber) {
      const targetSwitch = newTract.matrixDevices.find(sw => sw.id === deviceToRemove!.attachedSwitchId)
      if (targetSwitch) {
        targetSwitch.usedPorts = (targetSwitch.usedPorts || []).filter(p => p !== deviceToRemove!.attachedPortNumber)
        if (deviceToRemove.poe && deviceToRemove.poeEnabled) {
          targetSwitch.usedPoE = (targetSwitch.usedPoE || 0) - (deviceToRemove.poePower || 0)
        }
      }
    }

    const videoSettings = state.video
    const networkSettings = state.network
    const updatedTract = recalcTract(newTract, videoSettings, networkSettings)
    return { tractId, updatedTract }
  }
)

// Thunk для пересчёта тракта (например, при изменении видео/сети)
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
    const networkSettings = state.network
    const updatedTract = recalcTract(tract, videoSettings, networkSettings)
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
    addTract: (state, action: PayloadAction<Omit<Tract, 'totalLatency' | 'totalBitrate' | 'totalPower' | 'totalPoEBudget' | 'usedPoE' | 'usedPorts' | 'totalPorts' | 'networkLoadPercent' | 'linkSpeed'>>) => {
      const newTract: Tract = {
        ...action.payload,
        totalLatency: 0,
        totalBitrate: 0,
        totalPower: 0,
        totalPoEBudget: 0,
        usedPoE: 0,
        usedPorts: 0,
        totalPorts: 0,
        networkLoadPercent: 0,
        linkSpeed: 1000,
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
      if (action.payload.column === 'source') tract.sourceDevices.push(device)
      else if (action.payload.column === 'matrix') tract.matrixDevices.push(device)
      else if (action.payload.column === 'sink') tract.sinkDevices.push(device)
      updateShortNames(tract)
    },
    // Синхронное удаление (оставлено для совместимости, но лучше использовать thunk)
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
        const idx = state.tracts.findIndex(t => t.id === tractId)
        if (idx !== -1) state.tracts[idx] = updatedTract
      })
      .addCase(removeDeviceThunk.fulfilled, (state, action) => {
        const { tractId, updatedTract } = action.payload
        const idx = state.tracts.findIndex(t => t.id === tractId)
        if (idx !== -1) state.tracts[idx] = updatedTract
      })
      .addCase(recalcTractThunk.fulfilled, (state, action) => {
        const { tractId, updatedTract } = action.payload
        const idx = state.tracts.findIndex(t => t.id === tractId)
        if (idx !== -1) state.tracts[idx] = updatedTract
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
