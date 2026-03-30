import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { VideoSettings } from './videoSlice'
import { calcVideoBitrate } from './videoSlice'

// ... остальные интерфейсы и initialState без изменений ...

// Функция пересчёта всех параметров тракта (без networkSettings)
export const recalcTract = (tract: Tract, videoSettings: VideoSettings): Tract => {
  const allDevices: TractDevice[] = [...tract.sourceDevices, ...tract.sinkDevices]
  const switches = tract.networkSwitches

  // Суммарная задержка
  const totalLatency = allDevices.reduce((sum, d) => sum + d.latency, 0) +
    switches.reduce((sum, s) => sum + s.switchingLatency, 0)

  // Битрейт: зависит от видео настроек и коэффициентов устройств
  let totalBitrate = calcVideoBitrate(videoSettings)
  allDevices.forEach(dev => {
    if (dev.bitrateFactor !== undefined) {
      totalBitrate = totalBitrate * dev.bitrateFactor
    }
  })
  totalBitrate = Math.round(totalBitrate)

  // Мощность и PoE
  let totalPower = 0
  let usedPoE = 0
  let totalPoEBudget = switches.reduce((sum, sw) => sum + (sw.poeBudget || 0), 0)

  allDevices.forEach(dev => {
    totalPower += dev.powerW || 0
    if (dev.poeEnabled) usedPoE += dev.powerW || 0
  })
  switches.forEach(sw => {
    totalPower += sw.powerW || 0
    if (sw.poeBudget) usedPoE += sw.powerW
  })

  // Порты
  let totalPorts = switches.reduce((sum, sw) => sum + sw.ports.length, 0)
  let usedPorts = switches.reduce((sum, sw) => sum + sw.ports.filter(p => p.deviceId !== null).length, 0)

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

// ... остальной код слайса без изменений ...
