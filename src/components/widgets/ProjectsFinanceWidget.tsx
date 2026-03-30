import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { getProjectMargins } from '../../utils/financeUtils'

export const ProjectsFinanceWidget: React.FC = () => {
  const projects = useSelector((state: RootState) => state.projects.list)

  const projectMargins = projects.map(p => ({
    id: p.id,
    name: p.name,
    margin: getProjectMargins(p).actualMargin,
    profitability: getProjectMargins(p).actualProfitability,
  })).filter(p => p.margin !== 0 || p.profitability !== 0)

  const sortedByMargin = [...projectMargins].sort((a, b) => b.margin - a.margin)
  const top3 = sortedByMargin.slice(0, 3)
  const negativeMarginProjects = projectMargins.filter(p => p.margin < 0)

  return (
    <div className="widget-card projects-finance-widget">
      <div className="widget-header">
        <i className="fas fa-chart-pie"></i>
        <h3>Финансы проектов</h3>
      </div>
      <div className="widget-content">
        <div className="widget-stat">
          <span className="widget-label">Топ‑3 по марже</span>
          <div>
            {top3.map(p => (
              <div key={p.id} className="project-margin-item">
                <span>{p.name}</span>
                <span>{p.margin.toLocaleString()} ₽</span>
              </div>
            ))}
          </div>
        </div>
        {negativeMarginProjects.length > 0 && (
          <div className="widget-stat warning">
            <span className="widget-label">Проекты с отрицательной маржой</span>
            <div>
              {negativeMarginProjects.map(p => (
                <div key={p.id} className="project-margin-item">
                  <span>{p.name}</span>
                  <span>{p.margin.toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
