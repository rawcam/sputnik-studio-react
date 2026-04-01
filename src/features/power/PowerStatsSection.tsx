import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

export const PowerStatsSection: React.FC = () => {
  const totalPower = useSelector((state: RootState) =>
    state.tracts.tracts.reduce((sum, t) => sum + t.totalPower, 0)
  )
  const totalBTU = Math.round(totalPower * 3.412)

  return (
    <div className="section-content-inner">
      <div className="widget-item">
        <span className="widget-label">PoE:</span>
        <span className="power-value">0</span>/<span>0</span> Вт
      </div>
      <div className="widget-item">
        <span className="widget-label">Мощность:</span>
        <span className="power-value">{totalPower} Вт</span>
      </div>
      <div className="widget-item">
        <span className="widget-label">Тепло:</span>
        <span className="power-value">{totalBTU} BTU/ч</span>
      </div>
    </div>
  )
}
