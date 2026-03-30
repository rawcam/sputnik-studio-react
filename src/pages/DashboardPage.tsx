import { useAuth } from '../hooks/useAuth'
import { CompanyFinanceWidget } from '../components/widgets/CompanyFinanceWidget'
import { ProjectsFinanceWidget } from '../components/widgets/ProjectsFinanceWidget'
import { ServiceWidget } from '../components/widgets/ServiceWidget'
import { WorkloadWidget } from '../components/widgets/WorkloadWidget'
import { RisksWidget } from '../components/widgets/RisksWidget'
import './DashboardPage.css'

export const DashboardPage = () => {
  const { hasRole } = useAuth()

  return (
    <div className="dashboard-wrapper">
      <h2>ПАНЕЛЬ УПРАВЛЕНИЯ</h2>
      <div className="dashboard-grid">
        {/* Колонка 1: Финансы компании (только для директора) */}
        {hasRole('director') ? (
          <CompanyFinanceWidget />
        ) : (
          <div className="widget-card placeholder">Финансы компании (доступны только директору)</div>
        )}

        {/* Колонка 2: Финансы проектов (директор и ГИП) */}
        {(hasRole('director') || hasRole('pm')) ? (
          <ProjectsFinanceWidget />
        ) : (
          <div className="widget-card placeholder">Финансы проектов (доступны руководителям)</div>
        )}

        {/* Колонка 3: Сервис (ближайшие выезды) */}
        <ServiceWidget />

        {/* Колонка 4: Загрузка сотрудников */}
        <WorkloadWidget />

        {/* Колонка 5: Риски */}
        <RisksWidget />
      </div>

      <div className="widget-section">
        <h3>Активные проекты</h3>
        <p>Здесь будет карусель проектов</p>
      </div>
    </div>
  )
}
