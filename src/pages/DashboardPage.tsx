export const DashboardPage = () => {
  return (
    <div className="dashboard-wrapper">
      <h2>ПАНЕЛЬ УПРАВЛЕНИЯ</h2>
      <div className="stats-card" id="statsCard">
        <div className="stats-grid">
          <div className="stat-item"><span className="stat-label">Заглушка</span><span className="stat-number">0</span></div>
        </div>
      </div>
      <div className="dashboard-grid">
        <div className="project-card">Бюджет</div>
        <div className="project-card">Прогресс</div>
        <div className="project-card">Срочные</div>
        <div className="project-card">Встречи</div>
        <div className="project-card">Загрузка</div>
      </div>
      <div className="widget-section">
        <h3>Активные проекты</h3>
        <p>Здесь будет карусель проектов</p>
      </div>
    </div>
  )
}
