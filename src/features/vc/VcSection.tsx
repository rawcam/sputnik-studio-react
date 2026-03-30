import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { setVcConfig } from '../../store/vcSlice'

export const VcSection: React.FC = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.vc)

  const handleModeChange = (mode: any) => {
    dispatch(setVcConfig({ activeMode: mode }))
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
          <button onClick={() => handleModeChange('codec')} className={config.activeMode === 'codec' ? 'active' : ''}>Расчёт битрейта кодеков</button>
          <button onClick={() => handleModeChange('multipoint')} className={config.activeMode === 'multipoint' ? 'active' : ''}>Многоточечный вызов</button>
        </div>
      </div>
    </div>
  )
}
