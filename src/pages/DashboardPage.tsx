import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { useAuth } from '../hooks/useAuth'
import { CompanyFinanceWidget } from '../components/widgets/CompanyFinanceWidget'
import { ProjectsFinanceWidget } from '../components/widgets/ProjectsFinanceWidget'
import { ServiceWidget } from '../components/widgets/ServiceWidget'
import { WorkloadWidget } from '../components/widgets/WorkloadWidget'
import { RisksWidget } from '../components/widgets/RisksWidget'
import { ProjectsCarousel } from '../components/widgets/ProjectsCarousel'
import './DashboardPage.css'

export const DashboardPage: React.FC = () => {
  const { hasRole } = useAuth()
  const projects = useSelector((state: RootState) => state.projects.list)
  const activeProjects = projects.filter(p => p.status !== 'done')

  // Заглушка для перехода к деталям проекта – позже можно добавить роутинг или модалку
  const handleSelectProject = (project: any) => {
    // Временное действие: показать alert с id проекта
    alert(`Выбран проект: ${project.name} (id: ${project.id})`)
    // В будущем здесь можно добавить навигацию к детальной странице
  }

  return (
    <div className="dashboard-wrapper">
      <h2>ПАНЕЛЬ УПРАВЛЕНИЯ</h2>
      <div className="dashboard-grid">
        {/* Колонка 1: Финансы компании (только для директора) */}
        {hasRole('director') ? (
          <CompanyFinanceWidget />
        ) : (
          <div className="project-card">Финансы компании (только директор)</div>
        )}

        {/* Колонка 2: Финансы проектов (директор и ГИП) */}
        {(hasRole('director') || hasRole('pm')) ? (
          <ProjectsFinanceWidget />
        ) : (
          <div className="project-card">Финансы проектов (только директор/ГИП)</div>
        )}

        {/* Колонка 3: Сервис и регламент */}
        <ServiceWidget />

        {/* Колонка 4: Загрузка сотрудников */}
        <WorkloadWidget />

        {/* Колонка 5: Риски и уведомления */}
        <RisksWidget />
      </div>

      <div className="widget-section">
        <h3>Активные проекты</h3>
        <ProjectsCarousel projects={activeProjects} onSelectProject={handleSelectProject} />
      </div>
    </div>
  )
}
