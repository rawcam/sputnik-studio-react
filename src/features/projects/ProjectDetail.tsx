import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Project, ProjectStatus, ProjectCategory } from '../../store/projectsSlice'
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
  const [editedProject, setEditedProject] = useState<Project>(project)

  const handleChange = (field: keyof Project, value: any) => {
    setEditedProject(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    dispatch(updateProject(editedProject))
    alert('Сохранено')
  }

  const statusColors: Record<string, string> = {
    presale: '#f59e0b',
    design: '#3b82f6',
    ready: '#10b981',
    construction: '#8b5cf6',
    done: '#6b7280',
  }

  const categoryLabels: Record<ProjectCategory, string> = {
    new: 'Новый',
    modernization: 'Модернизация',
    service: 'Сервис',
    standard: 'Типовой',
    pilot: 'Пилот',
  }

  return (
    <div className="project-detail-card">
      <button className="btn-secondary" onClick={onBack}>
        <i className="fas fa-arrow-left"></i> Назад
      </button>
      <h2>[{editedProject.shortId}] {editedProject.name}</h2>
      <div className="detail-tabs">
        <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>
          Общая информация
        </button>
        <button className={activeTab === 'finances' ? 'active' : ''} onClick={() => setActiveTab('finances')}>
          Финансы
        </button>
        <button className={activeTab === 'service' ? 'active' : ''} onClick={() => setActiveTab('service')}>
          Сервис
        </button>
      </div>

      {activeTab === 'info' && (
        <div className="detail-form">
          <div className="detail-field">
            <label>Название:</label>
            <input
              type="text"
              value={editedProject.name}
              onChange={e => handleChange('name', e.target.value)}
            />
          </div>
          <div className="detail-field">
            <label>Категория:</label>
            <select
              value={editedProject.category}
              onChange={e => handleChange('category', e.target.value as ProjectCategory)}
            >
              <option value="new">Новый (0000–1999)</option>
              <option value="modernization">Модернизация (2000–3999)</option>
              <option value="service">Сервис (4000–5999)</option>
              <option value="standard">Типовой (6000–7999)</option>
              <option value="pilot">Пилот (8000–9999)</option>
            </select>
          </div>
          <div className="detail-field">
            <label>Статус:</label>
            <select
              value={editedProject.status}
              onChange={e => handleChange('status', e.target.value as ProjectStatus)}
              style={{ background: statusColors[editedProject.status] || '#ccc', color: 'white' }}
            >
              <option value="presale">Пресейл</option>
              <option value="design">Стадия П</option>
              <option value="ready">Стадия Р</option>
              <option value="construction">Монтаж</option>
              <option value="done">Завершён</option>
            </select>
          </div>
          <div className="detail-field">
            <label>Сумма контракта (₽):</label>
            <input
              type="number"
              value={editedProject.contractAmount}
              onChange={e => handleChange('contractAmount', Number(e.target.value))}
            />
          </div>
          <div className="detail-field">
            <label>Инженер:</label>
            <input
              type="text"
              value={editedProject.engineer}
              onChange={e => handleChange('engineer', e.target.value)}
            />
          </div>
          <div className="detail-field">
            <label>Руководитель проекта:</label>
            <input
              type="text"
              value={editedProject.projectManager}
              onChange={e => handleChange('projectManager', e.target.value)}
            />
          </div>
          <div className="detail-field">
            <label>Дата начала:</label>
            <input
              type="date"
              value={editedProject.startDate}
              onChange={e => handleChange('startDate', e.target.value)}
            />
          </div>
          <div className="detail-field">
            <label>Прогресс (%):</label>
            <input
              type="number"
              min="0"
              max="100"
              value={editedProject.progress}
              onChange={e => handleChange('progress', Number(e.target.value))}
            />
          </div>
          <div className="detail-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={editedProject.priority}
                onChange={e => handleChange('priority', e.target.checked)}
              />
              Срочный проект
            </label>
          </div>
        </div>
      )}

      {activeTab === 'finances' && metrics && (
        <div>
          <h3>Финансовые показатели</h3>
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
          {editedProject.serviceVisits.length === 0 && <p>Нет запланированных выездов</p>}
          <ul>
            {editedProject.serviceVisits.map(v => (
              <li key={v.id}>{v.date} — {v.type} ({v.status})</li>
            ))}
          </ul>
          {/* Здесь позже добавим форму добавления */}
        </div>
      )}

      <div className="detail-actions">
        <button className="btn-primary" onClick={handleSave}>
          Сохранить изменения
        </button>
      </div>
    </div>
  )
}
