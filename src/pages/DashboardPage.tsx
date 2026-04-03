import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store'
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
  const projects = useSelector((state: RootState) => state.projects.list)
  const visibleWidgets = useSelector((state: RootState) => state.widgets.visibleWidgets)
  const displayMode = useSelector((state: RootState) => state.widgets.displayMode)

  const activeProjects = projects.filter(p => p.status !== 'done')

  const handleSelectProject = (project: any) => {
    navigate(`/projects?id=${project.id}`)
  }

  return (
    <div className="dashboard-wrapper">
      {/* Заголовок "Панель управления" удалён по согласованию */}

      <div className={`dashboard-grid ${displayMode === 'compact' ? 'compact-mode' : ''}`}>
        {visibleWidgets.includes('companyFinance') && <CompanyFinanceWidget />}
        {visibleWidgets.includes('projectsFinance') && <ProjectsFinanceWidget />}
        {visibleWidgets.includes('service') && <ServiceWidget />}
        {visibleWidgets.includes('workload') && <WorkloadWidget />}
        {visibleWidgets.includes('risks') && <RisksWidget />}
      </div>

      {visibleWidgets.includes('carousel') && (
        <div className="widget-section" style={{ marginTop: '32px' }}>
          <ProjectsCarousel projects={activeProjects} onSelectProject={handleSelectProject} />
        </div>
      )}

      <WidgetConfigDrawer />
    </div>
  )
}
