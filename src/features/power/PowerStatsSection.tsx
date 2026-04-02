// PowerStatsSection.tsx
import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

export const PowerStatsSection: React.FC = () => {
  const tracts = useSelector((state: RootState) => state.tracts.tracts)
  const totalPower = tracts.reduce((sum, t) => sum + t.totalPower, 0)
  const totalBTU = Math.round(totalPower * 3.412)
  const totalPoEBudget = tracts.reduce((sum, t) => sum + t.totalPoEBudget, 0)
  const usedPoE = tracts.reduce((sum, t) => sum + t.usedPoE, 0)

  return (
    <div className="section-content-inner">
      <div className="widget-item">
        <span className="widget-label">PoE:</span>
        <span className="power-value">{usedPoE}</span>/<span>{totalPoEBudget}</span> Вт
      </div>
      <div className="widget-item">
        <span className="widget-label">Мощность:</span>
        <span className="power-value">{totalPower}</span> Вт
      </div>
      <div className="widget-item">
        <span className="widget-label">Тепло:</span>
        <span className="power-value">{totalBTU}</span> BTU/ч
      </div>
    </div>
  )
}
