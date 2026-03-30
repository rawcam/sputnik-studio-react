import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

export const WorkloadWidget: React.FC = () => {
  const projects = useSelector((state: RootState) => state.projects.list)

  // Собираем загрузку инженеров и руководителей
  const engineerLoad: Record<string, number> = {}
  const managerLoad: Record<string, number> = {}

  projects.forEach(p => {
    if (p.status !== 'done') {
      engineerLoad[p.engineer] = (engineerLoad[p.engineer] || 0) + 1
      managerLoad[p.projectManager] = (managerLoad[p.projectManager] || 0) + 1
    }
  })

  const maxEngineerLoad = Math.max(...Object.values(engineerLoad), 1)
  const maxManagerLoad = Math.max(...Object.values(managerLoad), 1)

  const formatLoad = (count: number, max: number) => {
    return `${count} проект(ов) (${Math.round((count / max) * 100)}%)`
  }

  return (
    <div className="widget-card workload-widget">
      <div className="widget-header">
        <i className="fas fa-users"></i>
        <h3>Загрузка сотрудников</h3>
      </div>
      <div className="widget-content">
        <div className="workload-section">
          <h4>Инженеры</h4>
          {Object.entries(engineerLoad).length === 0 && <p>Нет данных</p>}
          {Object.entries(engineerLoad)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => (
              <div key={name} className="workload-item">
                <span className="workload-name">{name}</span>
                <span className="workload-count">{formatLoad(count, maxEngineerLoad)}</span>
                <div className="progress-bar-container small">
                  <div className="progress-fill" style={{ width: `${(count / maxEngineerLoad) * 100}%` }}></div>
                </div>
              </div>
            ))}
        </div>
        <div className="workload-section">
          <h4>Руководители проектов</h4>
          {Object.entries(managerLoad).length === 0 && <p>Нет данных</p>}
          {Object.entries(managerLoad)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => (
              <div key={name} className="workload-item">
                <span className="workload-name">{name}</span>
                <span className="workload-count">{formatLoad(count, maxManagerLoad)}</span>
                <div className="progress-bar-container small">
                  <div className="progress-fill" style={{ width: `${(count / maxManagerLoad) * 100}%` }}></div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
