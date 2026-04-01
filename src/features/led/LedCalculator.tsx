import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { setViewMode, setActiveCalculator, addDeviceToTract } from '../../store/tractsSlice'
import { setLedConfig } from '../../store/ledSlice'

export const LedCalculator: React.FC = () => {
  const dispatch = useDispatch()
  const ledConfig = useSelector((state: RootState) => state.led)
  const activeTractId = useSelector((state: RootState) => state.tracts.activeTractId)

  const [cabinetWidth, setCabinetWidth] = useState(ledConfig.cabinetWidth)
  const [cabinetHeight, setCabinetHeight] = useState(ledConfig.cabinetHeight)
  const [cabinetsW, setCabinetsW] = useState(ledConfig.cabinetsW)
  const [cabinetsH, setCabinetsH] = useState(ledConfig.cabinetsH)
  const [pitch, setPitch] = useState(ledConfig.pitch)

  const [targetResolution, setTargetResolution] = useState(ledConfig.targetResolution)
  const [customResW, setCustomResW] = useState(ledConfig.customResW)
  const [customResH, setCustomResH] = useState(ledConfig.customResH)

  // Локальный расчёт
  const calculate = () => {
    if (ledConfig.activeMode === 'cabinets') {
      const width_m = (cabinetWidth / 1000) * cabinetsW
      const height_m = (cabinetHeight / 1000) * cabinetsH
      const resW = Math.round(width_m / (pitch / 1000))
      const resH = Math.round(height_m / (pitch / 1000))
      const area = width_m * height_m
      const power = area * (pitch === 0.7 ? 500 : pitch <= 1 ? 450 : 400)
      return { width_m, height_m, resW, resH, area, power }
    } else {
      let targetW: number, targetH: number
      if (targetResolution === 'fhd') { targetW = 1920; targetH = 1080 }
      else if (targetResolution === '4k') { targetW = 3840; targetH = 2160 }
      else { targetW = customResW; targetH = customResH }
      const width_m = (targetW * pitch) / 1000
      const height_m = (targetH * pitch) / 1000
      const area = width_m * height_m
      const power = area * (pitch === 0.7 ? 500 : pitch <= 1 ? 450 : 400)
      return { width_m, height_m, resW: targetW, resH: targetH, area, power }
    }
  }

  const result = calculate()

  const handleAddToTract = () => {
    if (!activeTractId) {
      alert('Сначала создайте тракт')
      return
    }
    const device = {
      id: Date.now().toString(),
      type: 'ledScreen',
      modelName: `LED ${ledConfig.activeMode === 'cabinets' ? 'по кабинетам' : 'по разрешению'}`,
      latency: 4.5,
      poeEnabled: false,
      powerW: Math.round(result.power),
      shortName: `LED${Date.now()}`,
      ethernet: false,
      width_m: result.width_m,
      height_m: result.height_m,
      resolution: `${result.resW}x${result.resH}`,
    }
    dispatch(addDeviceToTract({ tractId: activeTractId, device }))
    alert('Устройство добавлено в тракт')
    // остаёмся в калькуляторе, но можно предложить вернуться
  }

  const handleBack = () => {
    dispatch(setViewMode('single'))
    dispatch(setActiveCalculator(null))
  }

  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <h2>LED калькулятор – {ledConfig.activeMode === 'cabinets' ? 'По кабинетам' : 'По разрешению'}</h2>
        <button className="btn-secondary" onClick={handleBack}>Назад к трактам</button>
      </div>
      <div className="calculator-form">
        {ledConfig.activeMode === 'cabinets' && (
          <>
            <div className="setting"><label>Шаг пикселя (мм):</label><input type="number" step="0.1" value={pitch} onChange={e => setPitch(parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Ширина кабинета (мм):</label><input type="number" value={cabinetWidth} onChange={e => setCabinetWidth(parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Высота кабинета (мм):</label><input type="number" value={cabinetHeight} onChange={e => setCabinetHeight(parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Кабинетов по ширине:</label><input type="number" value={cabinetsW} onChange={e => setCabinetsW(parseInt(e.target.value))} /></div>
            <div className="setting"><label>Кабинетов по высоте:</label><input type="number" value={cabinetsH} onChange={e => setCabinetsH(parseInt(e.target.value))} /></div>
          </>
        )}
        {ledConfig.activeMode === 'resolution' && (
          <>
            <div className="setting"><label>Шаг пикселя (мм):</label><input type="number" step="0.1" value={pitch} onChange={e => setPitch(parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Целевое разрешение:</label>
              <select value={targetResolution} onChange={e => setTargetResolution(e.target.value)}>
                <option value="fhd">Full HD (1920x1080)</option>
                <option value="4k">4K (3840x2160)</option>
                <option value="custom">Пользовательское</option>
              </select>
            </div>
            {targetResolution === 'custom' && (
              <>
                <div className="setting"><label>Ширина (пикс):</label><input type="number" value={customResW} onChange={e => setCustomResW(parseInt(e.target.value))} /></div>
                <div className="setting"><label>Высота (пикс):</label><input type="number" value={customResH} onChange={e => setCustomResH(parseInt(e.target.value))} /></div>
              </>
            )}
          </>
        )}
      </div>

      <div className="result-grid">
        <div className="result-item"><span className="result-label">Разрешение</span><span className="result-value">{result.resW}×{result.resH}</span></div>
        <div className="result-item"><span className="result-label">Размер (м)</span><span className="result-value">{result.width_m.toFixed(1)}×{result.height_m.toFixed(1)}</span></div>
        <div className="result-item"><span className="result-label">Площадь (м²)</span><span className="result-value">{result.area.toFixed(1)}</span></div>
        <div className="result-item"><span className="result-label">Мощность (Вт)</span><span className="result-value">{Math.round(result.power)}</span></div>
      </div>

      <div className="calculator-actions">
        <button className="btn-primary" onClick={handleAddToTract}>Добавить LED-экран в тракт</button>
      </div>
    </div>
  )
}
