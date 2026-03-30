import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useFinance } from '../../hooks/useFinance'

export const ProjectsFinanceWidget: React.FC = () => {
  const projects = useSelector((state: RootState) => state.projects.list)
  const { getProjectMetrics } = useFinance()

  const projectsWithMetrics = projects
    .map(p => ({ ...p, metrics: getProjectMetrics(p.id) }))
    .filter(p => p.metrics !== null)

  const sortedByMargin = [...projectsWithMetrics].sort((a, b) => b.metrics!.margins.actualMargin - a.metrics!.margins.actualMargin)
  const top3 = sortedByMargin.slice(0, 3)
  const negativeMarginProjects = sortedByMargin.filter(p => p.metrics!.margins.actualMargin < 0)

  return (
    <div className="widget-card projects-finance-widget">
      <div className="widget-header">
        <i className="fas fa-chart-pie"></i>
        <h3>Финансы проектов</h3>
      </div>
      <div className="widget-content">
        <div className="widget-subsection">
          <h4>Топ-3 по марже</h4>
          {top3.length === 0 && <div className="empty-message">Нет проектов</div>}
          {top3.map(p => (
            <div key={p.id} className="project-row">
              <span className="project-name">{p.shortId} {p.name}</span>
              <span className="project-margin">{p.metrics!.margins.actualMargin.toLocaleString()} ₽</span>
            </div>
          ))}
        </div>

        {negativeMarginProjects.length > 0 && (
          <div className="widget-subsection warning">
            <h4>Проекты с отрицательной маржой</h4>
            {negativeMarginProjects.map(p => (
              <div key={p.id} className="project-row">
                <span className="project-name">{p.shortId} {p.name}</span>
                <span className="project-margin">{p.metrics!.margins.actualMargin.toLocaleString()} ₽</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
