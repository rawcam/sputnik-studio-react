import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { setLedConfig, setLedMode } from '../../store/ledSlice'

export const LedSection: React.FC = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.led)

  const handleChange = (field: string, value: any) => {
    dispatch(setLedConfig({ [field]: value }))
  }

  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="led">
        <i className="fas fa-border-all"></i>
        <span>LED</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content">
        <div className="mode-buttons">
          <button className={config.activeMode === 'cabinets' ? 'active' : ''} onClick={() => dispatch(setLedMode('cabinets'))}>
            <i className="fas fa-th-large"></i> По кабинетам
          </button>
          <button className={config.activeMode === 'resolution' ? 'active' : ''} onClick={() => dispatch(setLedMode('resolution'))}>
            <i className="fas fa-bullseye"></i> По разрешению
          </button>
        </div>

        {config.activeMode === 'cabinets' && (
          <>
            <div className="setting"><label>Шаг пикселя (мм):</label><input type="number" step="0.1" value={config.pitch} onChange={e => handleChange('pitch', parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Ширина кабинета (мм):</label><input type="number" value={config.cabinetWidth} onChange={e => handleChange('cabinetWidth', parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Высота кабинета (мм):</label><input type="number" value={config.cabinetHeight} onChange={e => handleChange('cabinetHeight', parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Кабинетов по ширине:</label><input type="number" value={config.cabinetsW} onChange={e => handleChange('cabinetsW', parseInt(e.target.value))} /></div>
            <div className="setting"><label>Кабинетов по высоте:</label><input type="number" value={config.cabinetsH} onChange={e => handleChange('cabinetsH', parseInt(e.target.value))} /></div>
          </>
        )}

        {config.activeMode === 'resolution' && (
          <>
            <div className="setting"><label>Шаг пикселя (мм):</label><input type="number" step="0.1" value={config.pitch} onChange={e => handleChange('pitch', parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Целевое разрешение:</label>
              <select value={config.targetResolution} onChange={e => handleChange('targetResolution', e.target.value)}>
                <option value="fhd">Full HD (1920x1080)</option>
                <option value="4k">4K (3840x2160)</option>
                <option value="custom">Пользовательское</option>
              </select>
            </div>
            {config.targetResolution === 'custom' && (
              <>
                <div className="setting"><label>Ширина (пикс):</label><input type="number" value={config.customResW} onChange={e => handleChange('customResW', parseInt(e.target.value))} /></div>
                <div className="setting"><label>Высота (пикс):</label><input type="number" value={config.customResH} onChange={e => handleChange('customResH', parseInt(e.target.value))} /></div>
              </>
            )}
          </>
        )}

        <div className="result-grid">
          <div className="result-item"><span className="result-label">Разрешение</span><span className="result-value">{config.resW}×{config.resH}</span></div>
          <div className="result-item"><span className="result-label">Размер (м)</span><span className="result-value">{config.width_m.toFixed(1)}×{config.height_m.toFixed(1)}</span></div>
          <div className="result-item"><span className="result-label">Площадь (м²)</span><span className="result-value">{config.area.toFixed(1)}</span></div>
          <div className="result-item"><span className="result-label">Мощность (Вт)</span><span className="result-value">{Math.round(config.power)}</span></div>
        </div>
      </div>
    </div>
  )
}
