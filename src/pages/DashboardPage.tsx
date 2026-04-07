import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store'
import { useProjectsDb } from '../hooks/useProjectsDb'
import { useAuth } from '../hooks/useAuth'
import { CompanyFinanceWidget } from '../components/widgets/CompanyFinanceWidget'
import { ProjectsFinanceWidget } from '../components/widgets/ProjectsFinanceWidget'
import { ServiceWidget } from '../components/widgets/ServiceWidget'
import { WorkloadWidget } from '../components/widgets/WorkloadWidget'
import { RisksWidget } from '../components/widgets/RisksWidget'
import { ProjectsCarousel } from '../components/widgets/ProjectsCarousel'
import { WidgetConfigDrawer } from '../components/common/WidgetConfigDrawer'
import { resetToRolePreset } from '../store/widgetsSlice'
import './DashboardPage.css'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loadProjects, initDemoData } = useProjectsDb()
  const { hasRole, user } = useAuth()
  const projects = useSelector((state: RootState) => state.projects.list)
  const visibleWidgets = useSelector((state: RootState) => state.widgets.visibleWidgets)
  const displayMode = useSelector((state: RootState) => state.widgets.displayMode)
  const [loading, setLoading] = useState(true)

  // Инициализация проектов и виджетов при загрузке страницы
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      // 1. Инициализируем демо-данные (если база пуста)
      await initDemoData()
      // 2. Загружаем проекты из базы в Redux
      await loadProjects()
      setLoading(false)
    }
    init()
  }, [initDemoData, loadProjects])

  // После загрузки проектов и если роль определена, применяем пресет виджетов,
  // но только если виджеты ещё не были сохранены пользователем (проверяем наличие в localStorage)
  useEffect(() => {
    if (loading) return
    if (!user) return

    const savedVisible = localStorage.getItem('visibleWidgets')
    if (!savedVisible) {
      // Если пользовательские настройки виджетов отсутствуют, применяем пресет для текущей роли
      dispatch(resetToRolePreset(user.role))
    }
  }, [loading, user, dispatch])

  const activeProjects = projects.filter(p => p.status !== 'done')

  const handleSelectProject = (project: any) => {
    navigate(`/projects?id=${project.id}`)
  }

  if (loading) {
    return (
      <div className="dashboard-wrapper" style={{ textAlign: 'center', padding: '40px' }}>
        <i className="fas fa-spinner fa-pulse" style={{ fontSize: '2rem' }}></i>
        <p>Загрузка проектов...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-wrapper">
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
