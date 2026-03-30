import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { Project } from '../../store/projectsSlice'

interface ServiceVisit {
  id: string
  date: string
  type: string
  status: 'planned' | 'completed' | 'cancelled'
  responsible: string
  cost?: number
  projectId: string
  projectName: string
}

export const ServiceWidget: React.FC = () => {
  const projects = useSelector((state: RootState) => state.projects.list)

  // Собираем все сервисные работы из всех проектов
  const allVisits: ServiceVisit[] = projects.flatMap(project =>
    project.serviceVisits.map(visit => ({
      ...visit,
      projectId: project.id,
      projectName: project.name,
    }))
  )

  // Фильтруем запланированные (planned) и сортируем по дате
  const upcoming = allVisits
    .filter(v => v.status === 'planned')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3) // показываем топ-3 ближайших

  const handleClick = (projectId: string) => {
    // Переход на страницу проекта (нужно будет использовать роутинг)
    // Пока просто выводим в консоль
    console.log('Переход к проекту', projectId)
    // В будущем: navigate(`/projects/${projectId}`)
  }

  return (
    <div className="widget-card service-widget">
      <div className="widget-header">
        <i className="fas fa-tools"></i>
        <h3>Сервис и регламент</h3>
      </div>
      <div className="widget-content">
        {upcoming.length === 0 ? (
          <div className="empty-state-widget">Нет предстоящих выездов</div>
        ) : (
          upcoming.map(visit => (
            <div
              key={visit.id}
              className="service-item"
              onClick={() => handleClick(visit.projectId)}
              style={{ cursor: 'pointer' }}
            >
              <div className="service-date">{visit.date}</div>
              <div className="service-info">
                <strong>{visit.projectName}</strong>
                <span>{visit.type}</span>
                <span className="service-responsible">{visit.responsible}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
