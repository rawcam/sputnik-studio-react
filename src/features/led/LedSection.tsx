import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { setLedConfig } from '../../store/ledSlice'

export const LedSection: React.FC = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.led)

  const handleModeChange = (mode: 'cabinets' | 'resolution') => {
    dispatch(setLedConfig({ activeMode: mode }))
  }

  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="led">
        <i className="fas fa-border-all"></i>
        <span>LED</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content" id="ledContent">
        <div className="mode-buttons">
          <button className={`mode-btn ${config.activeMode === 'cabinets' ? 'active' : ''}`} onClick={() => handleModeChange('cabinets')}>
            <i className="fas fa-th-large"></i> По кабинетам
          </button>
          <button className={`mode-btn ${config.activeMode === 'resolution' ? 'active' : ''}`} onClick={() => handleModeChange('resolution')}>
            <i className="fas fa-bullseye"></i> По разрешению
          </button>
        </div>
        {/* Здесь позже добавим поля */}
      </div>
    </div>
  )
}
