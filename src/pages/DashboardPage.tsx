import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const projects = useSelector((state: RootState) => state.projects.list)
  const activeProjects = projects.filter(p => p.status !== 'done')

  const handleSelectProject = (project: any) => {
    // Переход на страницу проектов с параметром id
    navigate(`/projects?id=${project.id}`)
  }

  return (
    <div className="dashboard-wrapper">
      <h2>ПАНЕЛЬ УПРАВЛЕНИЯ</h2>
      <div className="dashboard-grid">
        {hasRole('director') ? (
          <CompanyFinanceWidget />
        ) : (
          <div className="project-card">Финансы компании (только директор)</div>
        )}
        {(hasRole('director') || hasRole('pm')) ? (
          <ProjectsFinanceWidget />
        ) : (
          <div className="project-card">Финансы проектов (только директор/ГИП)</div>
        )}
        <ServiceWidget />
        <WorkloadWidget />
        <RisksWidget />
      </div>

      <div className="widget-section">
        <h3>Активные проекты</h3>
        <ProjectsCarousel projects={activeProjects} onSelectProject={handleSelectProject} />
      </div>
    </div>
  )
}
