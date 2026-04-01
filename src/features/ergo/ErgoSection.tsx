import React from 'react'
import { useDispatch } from 'react-redux'
import { setViewMode, setActiveCalculator } from '../../store/tractsSlice'

export const ErgoSection: React.FC = () => {
  const dispatch = useDispatch()

  const openCalculator = () => {
    dispatch(setViewMode('calculator'))
    dispatch(setActiveCalculator('ergo'))
  }

  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="ergo">
        <i className="fas fa-chalkboard-user"></i>
        <span>Эргономика ЭКП</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content">
        <button className="btn-primary" onClick={openCalculator}>
          <i className="fas fa-calculator"></i> Показать калькулятор
        </button>
      </div>
    </div>
  )
}
