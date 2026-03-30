import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { setErgoConfig } from '../../store/ergoSlice'

export const ErgoSection: React.FC = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.ergo)

  const handleChange = (field: string, value: any) => {
    dispatch(setErgoConfig({ [field]: value }))
  }

  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="ergo">
        <i className="fas fa-chalkboard-user"></i>
        <span>Эргономика ЭКП</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content">
        <div className="setting"><label>Ширина экрана (см):</label><input type="number" value={config.screenWidth} onChange={e => handleChange('screenWidth', parseFloat(e.target.value))} /></div>
        <div className="setting"><label>Высота экрана (см):</label><input type="number" value={config.screenHeight} onChange={e => handleChange('screenHeight', parseFloat(e.target.value))} /></div>
        <div className="setting"><label>Расстояние до экрана (см):</label><input type="number" value={config.distance} onChange={e => handleChange('distance', parseFloat(e.target.value))} /></div>
        <div className="result-item">
          <span className="result-label">Рекомендация</span>
          <span className="result-value">{config.resultText}</span>
        </div>
      </div>
    </div>
  )
}
