import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Project } from '../../store/projectsSlice'
import { updateProject } from '../../store/projectsSlice'
import { useFinance } from '../../hooks/useFinance'

interface ProjectDetailProps {
  project: Project
  onBack: () => void
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  const dispatch = useDispatch()
  const { getProjectMetrics } = useFinance()
  const metrics = getProjectMetrics(project.id)
  const [activeTab, setActiveTab] = useState<'info' | 'finances' | 'service'>('info')

  const handleSave = () => {
    dispatch(updateProject(project))
    alert('Сохранено')
  }

  return (
    <div className="project-detail-card">
      <button className="btn-secondary" onClick={onBack}>
        <i className="fas fa-arrow-left"></i> Назад
      </button>
      <h2>[{project.shortId}] {project.name}</h2>
      <div className="detail-tabs">
        <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>Общая информация</button>
        <button className={activeTab === 'finances' ? 'active' : ''} onClick={() => setActiveTab('finances')}>Финансы</button>
        <button className={activeTab === 'service' ? 'active' : ''} onClick={() => setActiveTab('service')}>Сервис</button>
      </div>

      {activeTab === 'info' && (
        <div>
          <p><strong>Категория:</strong> {project.category}</p>
          <p><strong>Статус:</strong> {project.status}</p>
          <p><strong>Инженер:</strong> {project.engineer}</p>
          <p><strong>РП:</strong> {project.projectManager}</p>
          <p><strong>Дата начала:</strong> {project.startDate}</p>
          <p><strong>Прогресс:</strong> {project.progress}%</p>
        </div>
      )}

      {activeTab === 'finances' && metrics && (
        <div>
          <h3>Финансовые показатели</h3>
          <p><strong>Сумма контракта:</strong> {project.contractAmount.toLocaleString()} ₽</p>
          <p><strong>Плановая маржа:</strong> {metrics.margins.plannedMargin.toLocaleString()} ₽</p>
          <p><strong>Плановая рентабельность:</strong> {(metrics.margins.plannedProfitability * 100).toFixed(1)}%</p>
          <p><strong>Фактическая маржа:</strong> {metrics.margins.actualMargin.toLocaleString()} ₽</p>
          <p><strong>Фактическая рентабельность:</strong> {(metrics.margins.actualProfitability * 100).toFixed(1)}%</p>
          <details>
            <summary>График денежных потоков</summary>
            <pre>{JSON.stringify(metrics.cashFlow, null, 2)}</pre>
          </details>
        </div>
      )}

      {activeTab === 'service' && (
        <div>
          <h3>Сервисные работы</h3>
          {project.serviceVisits.length === 0 && <p>Нет запланированных выездов</p>}
          <ul>
            {project.serviceVisits.map(v => (
              <li key={v.id}>{v.date} — {v.type} ({v.status})</li>
            ))}
          </ul>
        </div>
      )}

      <div className="detail-actions">
        <button className="btn-primary" onClick={handleSave}>Сохранить изменения</button>
      </div>
    </div>
  )
}
