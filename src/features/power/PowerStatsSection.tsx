import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

export const PowerStatsSection: React.FC = () => {
  const totalPower = useSelector((state: RootState) =>
    state.tracts.tracts.reduce((sum, t) => sum + t.totalPower, 0)
  )
  const totalBTU = Math.round(totalPower * 3.412)

  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="powerStats">
        <i className="fas fa-bolt"></i>
        <span>ПИТАНИЕ</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content">
        <div className="widget">
          <div className="widget-item">
            <span className="widget-label"><i className="fas fa-bolt"></i><span> PoE:</span></span>
            <span className="widget-value">0</span>/<span>0</span> Вт
          </div>
          <div className="widget-item">
            <span className="widget-label"><i className="fas fa-fire"></i><span> Мощность:</span></span>
            <span className="widget-value">{totalPower}</span> Вт
          </div>
          <div className="widget-item">
            <span className="widget-label"><i className="fas fa-thermometer-half"></i><span> Тепло:</span></span>
            <span className="widget-value">{totalBTU}</span> BTU/ч
          </div>
        </div>
      </div>
    </div>
  )
}
