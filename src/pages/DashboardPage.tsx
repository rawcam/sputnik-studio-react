import { useAuth } from '../hooks/useAuth'
import { CompanyFinanceWidget } from '../components/widgets/CompanyFinanceWidget'
import { ProjectsFinanceWidget } from '../components/widgets/ProjectsFinanceWidget'
import { ServiceWidget } from '../components/widgets/ServiceWidget'
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
          <div className="project-card">Финансы (доступны только директору)</div>
        )}

        {/* Колонка 2: Финансы проектов (для директора и ГИП) */}
        {(hasRole('director') || hasRole('pm')) ? (
          <ProjectsFinanceWidget />
        ) : (
          <div className="project-card">Финансы проектов (доступны руководителям)</div>
        )}

        {/* Колонка 3: Сервис (все роли видят, но может быть ограничено по правам) */}
        <ServiceWidget />

        {/* Колонка 4: Загрузка (заглушка) */}
        <div className="project-card">Загрузка (скоро)</div>

        {/* Колонка 5: Риски (заглушка) */}
        <div className="project-card">Риски (скоро)</div>
      </div>

      <div className="widget-section">
        <h3>Активные проекты</h3>
        <p>Здесь будет карусель проектов</p>
      </div>
    </div>
  )
}
