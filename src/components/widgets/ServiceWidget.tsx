import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

export const ServiceWidget: React.FC = () => {
  const projects = useSelector((state: RootState) => state.projects.list)
  const allVisits = projects.flatMap(p => p.serviceVisits.map(v => ({ ...v, projectName: p.name })))
  const upcoming = allVisits.filter(v => v.status === 'planned').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3)

  return (
    <div className="widget-card service-widget">
      <div className="widget-header">
        <i className="fas fa-tools"></i>
        <h3>Сервис и регламент</h3>
      </div>
      <div className="widget-content">
        {upcoming.length === 0 && <div>Нет предстоящих выездов</div>}
        {upcoming.map(visit => (
          <div key={visit.id} className="service-item">
            <div className="service-date">{visit.date}</div>
            <div className="service-info">
              <strong>{visit.projectName}</strong> – {visit.type}
            </div>
            <div className="service-responsible">{visit.responsible}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
