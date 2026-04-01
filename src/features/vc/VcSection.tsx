import React from 'react'
import { useDispatch } from 'react-redux'
import { setViewMode, setActiveCalculator } from '../../store/tractsSlice'

export const VcSection: React.FC = () => {
  const dispatch = useDispatch()

  const openCalculator = (mode: string) => {
    dispatch(setViewMode('calculator'))
    dispatch(setActiveCalculator('vc'))
  }

  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="vc">
        <i className="fas fa-chalkboard"></i>
        <span>VC (ВКС)</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content">
        <div className="mode-buttons">
          <button className="mode-btn" onClick={() => openCalculator('codec')}><i className="fas fa-satellite-dish"></i> Расчёт битрейта кодеков</button>
          <button className="mode-btn" onClick={() => openCalculator('multipoint')}><i className="fas fa-users"></i> Многоточечный вызов</button>
        </div>
      </div>
    </div>
  )
}
