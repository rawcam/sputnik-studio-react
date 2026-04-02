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
import './DashboardPage.css'  // если есть

export const DashboardPage: React.FC = () => {
  const { hasRole } = useAuth()
  const navigate = useNavigate()
  const projects = useSelector((state: RootState) => state.projects.list)
  const activeProjects = projects.filter(p => p.status !== 'done')

  const handleSelectProject = (project: any) => {
    navigate(`/projects?id=${project.id}`)
  }

  // Фильтрация виджетов по ролям (пример)
  const showCompanyFinance = hasRole('director') || hasRole('pm')
  const showProjectsFinance = hasRole('director') || hasRole('pm')
  const showService = true  // все видят
  const showWorkload = hasRole('director') || hasRole('pm') || hasRole('engineer')
  const showRisks = true

  return (
    <div className="dashboard-wrapper">
      <h2>ПАНЕЛЬ УПРАВЛЕНИЯ</h2>
      <div className="dashboard-grid">
        {showCompanyFinance && <CompanyFinanceWidget />}
        {showProjectsFinance && <ProjectsFinanceWidget />}
        {showService && <ServiceWidget />}
        {showWorkload && <WorkloadWidget />}
        {showRisks && <RisksWidget />}
      </div>

      <div className="widget-section" style={{ marginTop: '32px' }}>
        <h3>Активные проекты</h3>
        <ProjectsCarousel projects={activeProjects} onSelectProject={handleSelectProject} />
      </div>
    </div>
  )
}
