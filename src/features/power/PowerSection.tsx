import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { setPowerConfig } from '../../store/powerSlice'

export const PowerSection: React.FC = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.power)

  const handleChange = (field: string, value: any) => {
    dispatch(setPowerConfig({ [field]: value }))
  }

  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="power">
        <i className="fas fa-bolt"></i>
        <span>ЭНЕРГИЯ</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content">
        <div className="setting"><label>Суммарная мощность оборудования (Вт):</label><input type="number" value={config.totalPower} onChange={e => handleChange('totalPower', parseFloat(e.target.value))} /></div>
        <div className="setting"><label>Требуемая автономия ИБП (часов):</label><input type="number" step="0.5" value={config.upsAutonomy} onChange={e => handleChange('upsAutonomy', parseFloat(e.target.value))} /></div>
        <div className="result-item">
          <span className="result-label">Рекомендация</span>
          <span className="result-value">{config.resultText}</span>
        </div>
      </div>
    </div>
  )
}
