import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { setPowerConfig } from '../../store/powerSlice'

export const PowerSection: React.FC = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.power)

  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="power">
        <i className="fas fa-bolt"></i>
        <span>ЭНЕРГИЯ</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content">
        <button className="btn-primary" id="showPowerCalcBtn">Калькулятор питания</button>
      </div>
    </div>
  )
}
