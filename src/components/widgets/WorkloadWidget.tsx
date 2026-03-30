import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { Project } from '../../store/projectsSlice'

export const WorkloadWidget: React.FC = () => {
  const projects = useSelector((state: RootState) => state.projects.list)

  const workload = useMemo(() => {
    // Только активные проекты (не завершённые)
    const activeProjects = projects.filter(p => p.status !== 'done')

    const engineerMap = new Map<string, number>()
    const managerMap = new Map<string, number>()

    activeProjects.forEach(project => {
      if (project.engineer) {
        engineerMap.set(project.engineer, (engineerMap.get(project.engineer) || 0) + 1)
      }
      if (project.projectManager) {
        managerMap.set(project.projectManager, (managerMap.get(project.projectManager) || 0) + 1)
      }
    })

    const engineers = Array.from(engineerMap.entries()).map(([name, count]) => ({ name, count, role: 'engineer' as const }))
    const managers = Array.from(managerMap.entries()).map(([name, count]) => ({ name, count, role: 'manager' as const }))
    const all = [...engineers, ...managers].sort((a, b) => b.count - a.count)

    const totalActive = activeProjects.length
    const avgEngineer = engineers.length ? engineers.reduce((sum, e) => sum + e.count, 0) / engineers.length : 0
    const avgManager = managers.length ? managers.reduce((sum, m) => sum + m.count, 0) / managers.length : 0
    const top3 = all.slice(0, 3)

    return { totalActive, avgEngineer, avgManager, top3, engineers, managers }
  }, [projects])

  return (
    <div className="widget-card workload-widget">
      <div className="widget-header">
        <i className="fas fa-users"></i>
        <h3>Загрузка сотрудников</h3>
      </div>
      <div className="widget-content">
        <div className="widget-stat">
          <span className="widget-label">Активных проектов</span>
          <span className="widget-value">{workload.totalActive}</span>
        </div>
        <div className="widget-stat">
          <span className="widget-label">Средняя загрузка инженеров</span>
          <span className="widget-value">{workload.avgEngineer.toFixed(1)}</span>
        </div>
        <div className="widget-stat">
          <span className="widget-label">Средняя загрузка РП</span>
          <span className="widget-value">{workload.avgManager.toFixed(1)}</span>
        </div>
        {workload.top3.length > 0 && (
          <div className="workload-top">
            <div className="widget-label">Топ загруженных:</div>
            {workload.top3.map((p, idx) => (
              <div key={p.name} className="workload-item">
                <span className="workload-name">{p.name} ({p.role === 'engineer' ? 'инж' : 'РП'})</span>
                <span className="workload-count">{p.count} проект(ов)</span>
                <div className="progress-bar-container small">
                  <div className="progress-fill" style={{ width: `${(p.count / Math.max(...workload.top3.map(t => t.count))) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
