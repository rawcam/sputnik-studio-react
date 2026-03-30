import React, { useState } from 'react'
import { Project } from '../../store/projectsSlice'
import { useFinance } from '../../hooks/useFinance'
import { format } from 'date-fns' // если используем date-fns, но можно без

interface ProjectDetailProps {
  project: Project
  onBack: () => void
  onSave: (project: Project) => void
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onSave }) => {
  const [editedProject, setEditedProject] = useState(project)
  const { getProjectMetrics } = useFinance()
  const metrics = getProjectMetrics(project.id)

  const handleSave = () => {
    onSave(editedProject)
  }

  const formatCurrency = (value: number) => value.toLocaleString('ru-RU') + ' ₽'

  return (
    <div className="project-detail-card">
      <button className="btn-secondary" onClick={onBack}>
        <i className="fas fa-arrow-left"></i> Назад
      </button>

      <h2>
        [{editedProject.shortId}] {editedProject.name}
      </h2>
      <div className="detail-badges">
        <span className="badge-category">{editedProject.category}</span>
        <span className="badge-status">{editedProject.status}</span>
      </div>

      <div className="detail-grid">
        <div className="detail-field">
          <label>Бюджет (сумма контракта):</label>
          <input
            type="number"
            value={editedProject.contractAmount}
            onChange={e => setEditedProject({ ...editedProject, contractAmount: +e.target.value })}
          />
        </div>
        <div className="detail-field">
          <label>Инженер:</label>
          <input
            value={editedProject.engineer}
            onChange={e => setEditedProject({ ...editedProject, engineer: e.target.value })}
          />
        </div>
        <div className="detail-field">
          <label>Руководитель проекта:</label>
          <input
            value={editedProject.projectManager}
            onChange={e => setEditedProject({ ...editedProject, projectManager: e.target.value })}
          />
        </div>
        <div className="detail-field">
          <label>Дата начала:</label>
          <input
            type="date"
            value={editedProject.startDate}
            onChange={e => setEditedProject({ ...editedProject, startDate: e.target.value })}
          />
        </div>
      </div>

      {metrics && (
        <div className="detail-finance">
          <h3>Финансовые показатели</h3>
          <div className="finance-grid">
            <div>Плановая маржа: {formatCurrency(metrics.margins.plannedMargin)}</div>
            <div>Плановая рентабельность: {(metrics.margins.plannedProfitability * 100).toFixed(1)}%</div>
            <div>Фактическая маржа: {formatCurrency(metrics.margins.actualMargin)}</div>
            <div>Фактическая рентабельность: {(metrics.margins.actualProfitability * 100).toFixed(1)}%</div>
            {metrics.nextGap && (
              <div className="warning">
                Кассовый разрыв: {formatCurrency(metrics.nextGap.amount)} на {metrics.nextGap.date}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="detail-actions">
        <button className="btn-primary" onClick={handleSave}>Сохранить изменения</button>
        <button className="btn-danger" onClick={() => {}}>Удалить проект</button>
      </div>
    </div>
  )
}
