import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

export const ServiceWidget: React.FC = () => {
  const projects = useSelector((state: RootState) => state.projects.list)
  const allVisits = projects.flatMap(p =>
    p.serviceVisits.map(v => ({ ...v, projectName: p.name, projectId: p.id, projectShortId: p.shortId }))
  )
  const upcoming = [...allVisits]
    .filter(v => v.status === 'planned')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div className="widget-card service-widget">
      <div className="widget-header">
        <i className="fas fa-wrench"></i>
        <h3>Ближайшие сервисные выезды</h3>
      </div>
      <div className="widget-content">
        {upcoming.length === 0 && <div className="empty-message">Нет запланированных выездов</div>}
        {upcoming.map(visit => (
          <div key={visit.id} className="visit-item">
            <div className="visit-date">{visit.date}</div>
            <div className="visit-project">[{visit.projectShortId}] {visit.projectName}</div>
            <div className="visit-type">{visit.type}</div>
            <div className="visit-responsible">{visit.responsible}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
