import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useAuth } from '../../hooks/useAuth'
import { getProjectMargins } from '../../utils/financeUtils'

export const ProjectsFinanceWidget: React.FC = () => {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const projects = useSelector((state: RootState) => state.projects.list)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Закрытие меню по клику вне
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

  // Доступно только директору и ГИП
  if (!hasRole('director') && !hasRole('pm')) return null

  // Рассчитываем маржу для каждого проекта
  const projectMargins = projects.map(p => ({
    id: p.id,
    name: p.name,
    shortId: p.shortId,
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

  const handleProjectClick = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/projects?id=${projectId}`)
  }

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(prev => !prev)
  }

  const handleMenuAction = (action: string) => {
    setMenuOpen(false)
    if (action === 'refresh') {
      alert('Обновление данных (демо)')
    } else if (action === 'sortByMargin') {
      alert('Сортировка по марже (демо)')
    } else if (action === 'export') {
      alert('Экспорт в CSV (демо)')
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
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('refresh')}>Обновить</div>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('sortByMargin')}>Сортировка по марже</div>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('export')}>Экспорт CSV</div>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('hide')}>Скрыть виджет</div>
            </div>
          )}
        </div>
      </div>
      <div className="dashboard-widget-content">
        <div className="dashboard-finance-label" style={{ marginBottom: '4px' }}>Топ‑3 по марже</div>
        {top3.map((p, idx) => (
          <div 
            key={p.id} 
            className="dashboard-finance-row" 
            onClick={(e) => handleProjectClick(p.id, e)}
            style={{ cursor: 'pointer' }}
          >
            <span className="dashboard-finance-label">
              {idx === 0 && <i className="fas fa-crown" style={{ color: '#f5b042', marginRight: '6px' }}></i>}
              {idx === 1 && <i className="fas fa-medal" style={{ color: '#a0a0a0', marginRight: '6px' }}></i>}
              {idx === 2 && <i className="fas fa-medal" style={{ color: '#cd7f32', marginRight: '6px' }}></i>}
              {p.name}
            </span>
            <span className="dashboard-finance-value">{formatCurrency(p.margin)}</span>
          </div>
        ))}
        {negativeMarginProjects.length > 0 && (
          <>
            <div className="dashboard-finance-label" style={{ marginTop: '8px', marginBottom: '4px' }}>Отрицательная маржа</div>
            {negativeMarginProjects.map(p => (
              <div 
                key={p.id} 
                className="dashboard-finance-row" 
                onClick={(e) => handleProjectClick(p.id, e)}
                style={{ cursor: 'pointer' }}
              >
                <span className="dashboard-finance-label">
                  <i className="fas fa-exclamation-triangle" style={{ color: 'var(--danger)', marginRight: '6px' }}></i>
                  {p.name}
                </span>
                <span className="dashboard-finance-value" style={{ color: 'var(--danger)' }}>{formatCurrency(p.margin)}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
