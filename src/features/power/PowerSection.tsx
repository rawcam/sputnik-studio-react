import React from 'react'
import { useDispatch } from 'react-redux'
import { setViewMode, setActiveCalculator } from '../../store/tractsSlice'

export const PowerSection: React.FC = () => {
  const dispatch = useDispatch()

  const openCalculator = () => {
    dispatch(setActiveCalculator('power'))
    dispatch(setViewMode('calculator'))
  }

  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="power">
        <i className="fas fa-bolt"></i>
        <span>ЭНЕРГИЯ</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content">
        <button className="btn-primary" onClick={openCalculator}>
          <i className="fas fa-calculator"></i> Калькулятор питания
        </button>
      </div>
    </div>
  )
}
