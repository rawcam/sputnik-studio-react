import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Project, ProjectStatus, ProjectCategory } from '../../store/projectsSlice'
import { updateProject } from '../../store/projectsSlice'
import { useFinance } from '../../hooks/useFinance'
import { useProjectsDb } from '../../hooks/useProjectsDb'

interface ProjectDetailProps {
  project: Project
  onBack: () => void
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  const dispatch = useDispatch()
  const { updateProjectInDb } = useProjectsDb()
  const { getProjectMetrics } = useFinance()
  const metrics = getProjectMetrics(project.id)
  const [activeTab, setActiveTab] = useState<'info' | 'finances' | 'service'>('info')
  const [editedProject, setEditedProject] = useState<Project>(project)
  const [saving, setSaving] = useState(false)

  // Временные поля для новых встреч и закупок
  const [newMeeting, setNewMeeting] = useState({ date: new Date().toISOString().slice(0,10), subject: '' })
  const [newPurchase, setNewPurchase] = useState({ name: '', status: 'awaiting_payment', date: new Date().toISOString().slice(0,10) })

  const handleChange = (field: keyof Project, value: any) => {
    setEditedProject(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProjectInDb(editedProject)
      alert('Сохранено')
    } catch (err) {
      console.error(err)
      alert('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  // Встречи
  const addMeeting = () => {
    if (!newMeeting.subject.trim()) return
    setEditedProject(prev => ({
      ...prev,
      meetings: [...prev.meetings, { date: newMeeting.date, subject: newMeeting.subject }]
    }))
    setNewMeeting({ date: new Date().toISOString().slice(0,10), subject: '' })
  }

  const removeMeeting = (index: number) => {
    setEditedProject(prev => ({
      ...prev,
      meetings: prev.meetings.filter((_, i) => i !== index)
    }))
  }

  // Закупки
  const addPurchase = () => {
    if (!newPurchase.name.trim()) return
    setEditedProject(prev => ({
      ...prev,
      purchases: [...prev.purchases, { name: newPurchase.name, status: newPurchase.status, date: newPurchase.date }]
    }))
    setNewPurchase({ name: '', status: 'awaiting_payment', date: new Date().toISOString().slice(0,10) })
  }

  const removePurchase = (index: number) => {
    setEditedProject(prev => ({
      ...prev,
      purchases: prev.purchases.filter((_, i) => i !== index)
    }))
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

  const purchaseStatusOptions = [
    { value: 'awaiting_payment', label: 'Ожидает оплаты' },
    { value: 'paid', label: 'Оплачено' },
    { value: 'reserved', label: 'Зарезервировано' },
    { value: 'ordered', label: 'Заказано' },
    { value: 'in_transit', label: 'В пути' },
    { value: 'delivered', label: 'Доставлено' },
    { value: 'cancelled', label: 'Отменено' },
    { value: 'out_of_stock', label: 'Нет в наличии' },
  ]

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
        <>
          <div className="detail-form">
            {/* ... все поля формы, как ранее ... */}
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

          {/* Встречи */}
          <div className="detail-section">
            <h4>Встречи</h4>
            <div className="detail-list">
              {editedProject.meetings.map((meeting, idx) => (
                <div key={idx} className="list-item">
                  <input
                    type="date"
                    value={meeting.date}
                    onChange={e => {
                      const newMeetings = [...editedProject.meetings]
                      newMeetings[idx].date = e.target.value
                      setEditedProject(prev => ({ ...prev, meetings: newMeetings }))
                    }}
                  />
                  <input
                    type="text"
                    value={meeting.subject}
                    onChange={e => {
                      const newMeetings = [...editedProject.meetings]
                      newMeetings[idx].subject = e.target.value
                      setEditedProject(prev => ({ ...prev, meetings: newMeetings }))
                    }}
                    placeholder="Тема встречи"
                  />
                  <button className="remove-item" onClick={() => removeMeeting(idx)}>
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              ))}
              <div className="add-item-form">
                <input
                  type="date"
                  value={newMeeting.date}
                  onChange={e => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                />
                <input
                  type="text"
                  value={newMeeting.subject}
                  onChange={e => setNewMeeting(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Тема новой встречи"
                />
                <button className="btn-small" onClick={addMeeting}>+ Добавить</button>
              </div>
            </div>
          </div>

          {/* Закупки */}
          <div className="detail-section">
            <h4>Закупки</h4>
            <div className="detail-list">
              {editedProject.purchases.map((purchase, idx) => (
                <div key={idx} className="list-item">
                  <input
                    type="text"
                    value={purchase.name}
                    onChange={e => {
                      const newPurchases = [...editedProject.purchases]
                      newPurchases[idx].name = e.target.value
                      setEditedProject(prev => ({ ...prev, purchases: newPurchases }))
                    }}
                    placeholder="Наименование"
                  />
                  <select
                    value={purchase.status}
                    onChange={e => {
                      const newPurchases = [...editedProject.purchases]
                      newPurchases[idx].status = e.target.value
                      setEditedProject(prev => ({ ...prev, purchases: newPurchases }))
                    }}
                  >
                    {purchaseStatusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={purchase.date}
                    onChange={e => {
                      const newPurchases = [...editedProject.purchases]
                      newPurchases[idx].date = e.target.value
                      setEditedProject(prev => ({ ...prev, purchases: newPurchases }))
                    }}
                  />
                  <button className="remove-item" onClick={() => removePurchase(idx)}>
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              ))}
              <div className="add-item-form">
                <input
                  type="text"
                  value={newPurchase.name}
                  onChange={e => setNewPurchase(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Наименование закупки"
                />
                <select
                  value={newPurchase.status}
                  onChange={e => setNewPurchase(prev => ({ ...prev, status: e.target.value }))}
                >
                  {purchaseStatusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newPurchase.date}
                  onChange={e => setNewPurchase(prev => ({ ...prev, date: e.target.value }))}
                />
                <button className="btn-small" onClick={addPurchase}>+ Добавить</button>
              </div>
            </div>
          </div>
        </>
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
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>
    </div>
  )
}
