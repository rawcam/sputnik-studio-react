import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useAuth } from '../../hooks/useAuth'

export const WorkloadWidget: React.FC = () => {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const projects = useSelector((state: RootState) => state.projects.list)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Доступно всем (или только определённым ролям? Оставляем как есть)
  if (!hasRole('director') && !hasRole('pm') && !hasRole('engineer')) return null

  // Подсчёт загрузки инженеров и руководителей проектов
  const engineerLoad: Record<string, number> = {}
  const managerLoad: Record<string, number> = {}

  projects.forEach(p => {
    if (p.status !== 'done') {
      engineerLoad[p.engineer] = (engineerLoad[p.engineer] || 0) + 1
      managerLoad[p.projectManager] = (managerLoad[p.projectManager] || 0) + 1
    }
  })

  const maxEngineerLoad = Math.max(...Object.values(engineerLoad), 1)
  const maxManagerLoad = Math.max(...Object.values(managerLoad), 1)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getProgressClass = (percent: number) => {
    if (percent >= 100) return 'danger'
    if (percent >= 85) return 'warning'
    return 'normal'
  }

  const handleWidgetClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dashboard-widget-actions')) return
    navigate('/resources')
  }

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(prev => !prev)
  }

  const handleMenuAction = (action: string) => {
    setMenuOpen(false)
    if (action === 'refresh') {
      alert('Обновление данных (демо)')
    } else if (action === 'sortByLoad') {
      alert('Сортировка по загрузке (демо)')
    } else if (action === 'hide') {
      const hidden = JSON.parse(localStorage.getItem('hiddenWidgets') || '[]')
      if (!hidden.includes('workload')) {
        hidden.push('workload')
        localStorage.setItem('hiddenWidgets', JSON.stringify(hidden))
        alert('Виджет скрыт. Обновите страницу.')
        window.location.reload()
      }
    }
  }

  return (
    <div className="dashboard-widget" onClick={handleWidgetClick}>
      <div className="dashboard-widget-header">
        <div className="dashboard-widget-title">
          <i className="fas fa-users"></i> Загрузка сотрудников
        </div>
        <div className="dashboard-widget-actions">
          <button ref={buttonRef} className="dashboard-icon-btn" onClick={handleMenuToggle}>
            <i className="fas fa-ellipsis-h"></i>
          </button>
          {menuOpen && (
            <div className="dashboard-widget-menu" ref={menuRef}>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('refresh')}>Обновить</div>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('sortByLoad')}>Сортировка по загрузке</div>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('hide')}>Скрыть виджет</div>
            </div>
          )}
        </div>
      </div>
      <div className="dashboard-widget-content">
        <div className="dashboard-finance-label">Инженеры</div>
        {Object.entries(engineerLoad).length === 0 && <div>Нет данных</div>}
        {Object.entries(engineerLoad)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => {
            const percent = Math.round((count / maxEngineerLoad) * 100)
            return (
              <div key={name} className="dashboard-employee-row">
                <div className="dashboard-avatar">{getInitials(name)}</div>
                <div className="dashboard-employee-info">
                  <div className="dashboard-employee-name">{name}</div>
                  <div className="dashboard-progress-bg">
                    <div className={`dashboard-progress-fill ${getProgressClass(percent)}`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
                <div className="dashboard-employee-percent">{percent}%</div>
              </div>
            )
          })}
        <div className="dashboard-finance-label" style={{ marginTop: '8px' }}>Руководители проектов</div>
        {Object.entries(managerLoad).length === 0 && <div>Нет данных</div>}
        {Object.entries(managerLoad)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => {
            const percent = Math.round((count / maxManagerLoad) * 100)
            return (
              <div key={name} className="dashboard-employee-row">
                <div className="dashboard-avatar">{getInitials(name)}</div>
                <div className="dashboard-employee-info">
                  <div className="dashboard-employee-name">{name}</div>
                  <div className="dashboard-progress-bg">
                    <div className={`dashboard-progress-fill ${getProgressClass(percent)}`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
                <div className="dashboard-employee-percent">{percent}%</div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
