import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { getProjectMargins } from '../../utils/financeUtils'
import { useAuth } from '../../hooks/useAuth'

export const ProjectsFinanceWidget: React.FC = () => {
  const navigate = useNavigate()
  const projects = useSelector((state: RootState) => state.projects.list)
  const { hasRole } = useAuth()
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

  if (!hasRole('director') && !hasRole('pm')) return null

  const projectMargins = projects.map(p => ({
    id: p.id,
    name: p.name,
    margin: getProjectMargins(p).actualMargin,
    profitability: getProjectMargins(p).actualProfitability,
  })).filter(p => p.margin !== 0 || p.profitability !== 0)

  const sortedByMargin = [...projectMargins].sort((a, b) => b.margin - a.margin)
  const top3 = sortedByMargin.slice(0, 3)
  const negativeMarginProjects = projectMargins.filter(p => p.margin < 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
  }

  const handleWidgetClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dashboard-widget-actions')) return
    navigate('/finance/projects')
  }

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(prev => !prev)
  }

  const handleMenuAction = (action: string) => {
    setMenuOpen(false)
    if (action === 'sortByMargin') {
      alert('Сортировка по марже (демо)')
    } else if (action === 'export') {
      alert('Экспорт CSV (демо)')
    } else if (action === 'hide') {
      const hidden = JSON.parse(localStorage.getItem('hiddenWidgets') || '[]')
      if (!hidden.includes('projectsFinance')) {
        hidden.push('projectsFinance')
        localStorage.setItem('hiddenWidgets', JSON.stringify(hidden))
        alert('Виджет скрыт. Обновите страницу.')
        window.location.reload()
      }
    }
  }

  const handleProjectClick = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/projects?id=${projectId}`)
  }

  return (
    <div className="dashboard-widget" onClick={handleWidgetClick}>
      <div className="dashboard-widget-header">
        <div className="dashboard-widget-title">
          <i className="fas fa-chart-pie"></i> Финансы проектов
        </div>
        <div className="dashboard-widget-actions">
          <button ref={buttonRef} className="dashboard-icon-btn" onClick={handleMenuToggle}>
            <i className="fas fa-ellipsis-h"></i>
          </button>
          {menuOpen && (
            <div className="dashboard-widget-menu" ref={menuRef}>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('sortByMargin')}>Сортировка по марже</div>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('export')}>Экспорт CSV</div>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('hide')}>Скрыть виджет</div>
            </div>
          )}
        </div>
      </div>
      <div className="dashboard-widget-content">
        <div className="dashboard-finance-label" style={{ marginBottom: '4px' }}>Топ‑3 по марже</div>
        {top3.map((project, idx) => (
          <div key={project.id} className="dashboard-finance-row" onClick={(e) => handleProjectClick(project.id, e)}>
            <span className="dashboard-finance-label">
              {idx === 0 && <i className="fas fa-crown" style={{ color: '#f5b042', marginRight: '6px' }}></i>}
              {idx === 1 && <i className="fas fa-medal" style={{ color: '#a0a0a0', marginRight: '6px' }}></i>}
              {idx === 2 && <i className="fas fa-medal" style={{ color: '#cd7f32', marginRight: '6px' }}></i>}
              {project.name}
            </span>
            <span className="dashboard-finance-value">{formatCurrency(project.margin)}</span>
          </div>
        ))}
        {negativeMarginProjects.length > 0 && (
          <>
            <div className="dashboard-finance-label" style={{ marginTop: '8px', marginBottom: '4px' }}>Отрицательная маржа</div>
            {negativeMarginProjects.map(project => (
              <div key={project.id} className="dashboard-finance-row" onClick={(e) => handleProjectClick(project.id, e)}>
                <span className="dashboard-finance-label">
                  <i className="fas fa-exclamation-triangle" style={{ color: 'var(--danger)', marginRight: '6px' }}></i>
                  {project.name}
                </span>
                <span className="dashboard-finance-value" style={{ color: 'var(--danger)' }}>{formatCurrency(project.margin)}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
