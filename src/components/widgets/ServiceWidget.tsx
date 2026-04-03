import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useAuth } from '../../hooks/useAuth'

export const ServiceWidget: React.FC = () => {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const projects = useSelector((state: RootState) => state.projects.list)
  const displayMode = useSelector((state: RootState) => state.widgets.displayMode)
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

  if (!hasRole('director') && !hasRole('pm') && !hasRole('engineer') && !hasRole('logist')) return null

  const allVisits = projects.flatMap(p => 
    p.serviceVisits.map(v => ({ ...v, projectName: p.name, projectId: p.id }))
  )
  const upcomingVisits = allVisits
    .filter(v => v.status === 'planned')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
  }

  const handleWidgetClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dashboard-widget-actions')) return
    navigate('/service')
  }

  const handleVisitClick = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/projects?id=${projectId}`)
  }

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(prev => !prev)
  }

  const handleMenuAction = (action: string) => {
    setMenuOpen(false)
    if (action === 'refresh') alert('Обновление данных (демо)')
    else if (action === 'hide') alert('Используйте панель настроек для скрытия виджета')
  }

  // Компактный режим
  if (displayMode === 'compact') {
    const upcomingCount = upcomingVisits.length
    const nextDate = upcomingVisits[0] ? formatDate(upcomingVisits[0].date) : '—'
    return (
      <div className="dashboard-widget compact-widget" onClick={handleWidgetClick}>
        <div className="compact-widget-content">
          <i className="fas fa-tools"></i>
          <div className="compact-value">{upcomingCount}</div>
          <div className="compact-label">выезда</div>
          <div className="compact-sub">след. {nextDate}</div>
        </div>
      </div>
    )
  }

  // Обычный режим
  return (
    <div className="dashboard-widget" onClick={handleWidgetClick}>
      <div className="dashboard-widget-header">
        <div className="dashboard-widget-title">
          <i className="fas fa-tools"></i> Сервис и регламент
        </div>
        <div className="dashboard-widget-actions">
          <button ref={buttonRef} className="dashboard-icon-btn" onClick={handleMenuToggle}>
            <i className="fas fa-ellipsis-h"></i>
          </button>
          {menuOpen && (
            <div className="dashboard-widget-menu" ref={menuRef}>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('refresh')}>Обновить</div>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('hide')}>Скрыть виджет</div>
            </div>
          )}
        </div>
      </div>
      <div className="dashboard-widget-content">
        {upcomingVisits.length === 0 && <div className="dashboard-service-item">Нет предстоящих выездов</div>}
        {upcomingVisits.map(visit => (
          <div key={visit.id} className="dashboard-service-item" onClick={(e) => handleVisitClick(visit.projectId, e)}>
            <span className="dashboard-service-date">{formatDate(visit.date)}</span>
            <span className="dashboard-service-info"><strong>{visit.projectName}</strong> – {visit.type}</span>
            <span className="dashboard-service-responsible">{visit.responsible}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
