import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

export const RisksWidget: React.FC = () => {
  const projects = useSelector((state: RootState) => state.projects.list)

  const risks: { projectId: string; projectName: string; message: string; type: string }[] = []

  projects.forEach(p => {
    // Проекты с отрицательной маржой
    if (p.actualIncome < p.actualExpenses) {
      risks.push({
        projectId: p.id,
        projectName: p.name,
        message: `Отрицательная маржа: расходы превышают доходы на ${(p.actualExpenses - p.actualIncome).toLocaleString()} ₽`,
        type: 'finance',
      })
    }
    // Сдвиг сроков (если дата следующего этапа в прошлом)
    if (p.nextStatusDate && new Date(p.nextStatusDate) < new Date()) {
      risks.push({
        projectId: p.id,
        projectName: p.name,
        message: `Сдвиг сроков: плановая дата ${p.nextStatus} (${p.nextStatusDate}) просрочена`,
        type: 'deadline',
      })
    }
  })

  if (risks.length === 0) {
    return (
      <div className="widget-card risks-widget">
        <div className="widget-header">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Риски</h3>
        </div>
        <div className="widget-content">Нет активных рисков</div>
      </div>
    )
  }

  return (
    <div className="widget-card risks-widget">
      <div className="widget-header">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Риски</h3>
      </div>
      <div className="widget-content">
        {risks.map((risk, idx) => (
          <div key={idx} className="risk-item">
            <span className="risk-project">{risk.projectName}</span>
            <span className="risk-message">{risk.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
