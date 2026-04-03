import React, { useState } from 'react'
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
import { WidgetConfigDrawer } from '../components/common/WidgetConfigDrawer'
import './DashboardPage.css'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const projects = useSelector((state: RootState) => state.projects.list)
  const visibleWidgets = useSelector((state: RootState) => state.widgets.visibleWidgets)
  const displayMode = useSelector((state: RootState) => state.widgets.displayMode)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const activeProjects = projects.filter(p => p.status !== 'done')

  const handleSelectProject = (project: any) => {
    navigate(`/projects?id=${project.id}`)
  }

  // Роль для пресетов (можно передать в Drawer, но там уже есть resetToRolePreset)
  // Сама панель открывается по кнопке в топбаре (добавим позже)

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h2>ПАНЕЛЬ УПРАВЛЕНИЯ</h2>
        <button className="settings-icon-btn" onClick={() => setIsDrawerOpen(true)}>
          <i className="fas fa-sliders-h"></i>
        </button>
      </div>

      <div className={`dashboard-grid ${displayMode === 'compact' ? 'compact-mode' : ''}`}>
        {visibleWidgets.includes('companyFinance') && <CompanyFinanceWidget />}
        {visibleWidgets.includes('projectsFinance') && <ProjectsFinanceWidget />}
        {visibleWidgets.includes('service') && <ServiceWidget />}
        {visibleWidgets.includes('workload') && <WorkloadWidget />}
        {visibleWidgets.includes('risks') && <RisksWidget />}
      </div>

      {visibleWidgets.includes('carousel') && (
        <div className="widget-section">
          <h3>Активные проекты</h3>
          <ProjectsCarousel projects={activeProjects} onSelectProject={handleSelectProject} />
        </div>
      )}

      <WidgetConfigDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  )
}
