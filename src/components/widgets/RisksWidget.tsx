import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useFinance } from '../../hooks/useFinance'

export const RisksWidget: React.FC = () => {
  const projects = useSelector((state: RootState) => state.projects.list)
  const { getProjectMetrics, nextCompanyGap } = useFinance()

  const risks = useMemo(() => {
    const items: { type: 'finance' | 'technical' | 'logistics'; message: string; projectId?: string; date?: string }[] = []

    // Финансовые риски
    if (nextCompanyGap) {
      items.push({
        type: 'finance',
        message: `Кассовый разрыв компании: ${nextCompanyGap.deficit.toLocaleString()} ₽ до ${nextCompanyGap.date}`,
      })
    }

    projects.forEach(project => {
      const metrics = getProjectMetrics(project.id)
      if (metrics && metrics.margins.actualProfitability < 0) {
        items.push({
          type: 'finance',
          message: `Отрицательная рентабельность проекта [${project.shortId}] ${project.name}`,
          projectId: project.id,
        })
      }
      // Здесь можно добавить другие финансовые риски, например, превышение бюджета
    })

    // Логистические риски: закупки с датой поставки сегодня или в прошлом и не оплаченные/не доставленные
    projects.forEach(project => {
      project.purchases.forEach(purchase => {
        const purchaseDate = new Date(purchase.date)
        const today = new Date()
        today.setHours(0,0,0,0)
        if (purchaseDate <= today && purchase.status !== 'delivered' && purchase.status !== 'cancelled') {
          items.push({
            type: 'logistics',
            message: `Просрочена закупка "${purchase.name}" в проекте [${project.shortId}] ${project.name}`,
            projectId: project.id,
            date: purchase.date,
          })
        }
      })
    })

    // Технические риски (заглушка, позже добавим реальные)
    // items.push({ type: 'technical', message: 'Технические риски будут добавлены позже' })

    return items
  }, [projects, getProjectMetrics, nextCompanyGap])

  if (risks.length === 0) {
    return (
      <div className="widget-card risks-widget">
        <div className="widget-header">
          <i className="fas fa-shield-alt"></i>
          <h3>Риски</h3>
        </div>
        <div className="widget-content">
          <p className="no-risks">Нет активных рисков</p>
        </div>
      </div>
    )
  }

  return (
    <div className="widget-card risks-widget">
      <div className="widget-header">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Риски и уведомления</h3>
      </div>
      <div className="widget-content">
        {risks.map((risk, idx) => (
          <div key={idx} className={`risk-item risk-${risk.type}`}>
            <i className={`fas fa-${risk.type === 'finance' ? 'chart-line' : risk.type === 'logistics' ? 'truck' : 'microchip'}`}></i>
            <span>{risk.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
