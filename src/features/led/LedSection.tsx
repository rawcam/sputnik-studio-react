import React from 'react'
import { useDispatch } from 'react-redux'
import { setViewMode, setActiveCalculator } from '../../store/tractsSlice'
import { setLedMode } from '../../store/ledSlice'

export const LedSection: React.FC = () => {
  const dispatch = useDispatch()

  const openCalculator = (mode: 'cabinets' | 'resolution') => {
    dispatch(setLedMode(mode))
    dispatch(setActiveCalculator('led'))
    dispatch(setViewMode('calculator'))
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
          <button className="mode-btn" onClick={() => openCalculator('cabinets')}>
            <i className="fas fa-th-large"></i> По кабинетам
          </button>
          <button className="mode-btn" onClick={() => openCalculator('resolution')}>
            <i className="fas fa-bullseye"></i> По разрешению
          </button>
        </div>
      </div>
    </div>
  )
}
