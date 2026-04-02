import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFinance } from '../../hooks/useFinance'
import { useAuth } from '../../hooks/useAuth'

export const CompanyFinanceWidget: React.FC = () => {
  const navigate = useNavigate()
  const { totalIncome, totalMargin, totalProfitability, nextCompanyGap } = useFinance()
  const { hasRole } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Закрыть меню при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Директор и ГИП видят виджет, остальные не видят (рендерится только если hasRole)
  if (!hasRole('director') && !hasRole('pm')) {
    return null
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
  }

  const handleWidgetClick = (e: React.MouseEvent) => {
    // Не срабатывает, если клик по кнопке меню
    if ((e.target as HTMLElement).closest('.dashboard-widget-actions')) return
    navigate('/finance/company')
  }

  const handleMenuAction = (action: string) => {
    setMenuOpen(false)
    if (action === 'refresh') {
      // Можно вызвать reload данных (пока заглушка)
      console.log('Обновить данные')
    } else if (action === 'export') {
      console.log('Экспорт CSV')
    } else if (action === 'settings') {
      console.log('Настройки виджета')
    } else if (action === 'hide') {
      // Скрыть виджет (сохранить в localStorage)
      const hidden = JSON.parse(localStorage.getItem('hiddenWidgets') || '[]')
      if (!hidden.includes('companyFinance')) {
        hidden.push('companyFinance')
        localStorage.setItem('hiddenWidgets', JSON.stringify(hidden))
        window.location.reload() // Простой способ обновить дашборд
      }
    }
  }

  return (
    <div className="dashboard-widget" onClick={handleWidgetClick}>
      <div className="dashboard-widget-header">
        <div className="dashboard-widget-title">
          <i className="fas fa-chart-line"></i> Финансы компании
        </div>
        <div className="dashboard-widget-actions" style={{ position: 'relative' }}>
          <button className="dashboard-icon-btn" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}>
            <i className="fas fa-ellipsis-h"></i>
          </button>
          {menuOpen && (
            <div className="dashboard-widget-menu" ref={menuRef}>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('refresh')}>Обновить</div>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('export')}>Экспорт CSV</div>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('settings')}>Настройки</div>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('hide')}>Скрыть виджет</div>
            </div>
          )}
        </div>
      </div>
      <div className="dashboard-widget-content">
        <div className="dashboard-finance-row">
          <span className="dashboard-finance-label">Выручка (факт)</span>
          <span className="dashboard-finance-value">{formatCurrency(totalIncome)}</span>
        </div>
        <div className="dashboard-finance-row">
          <span className="dashboard-finance-label">Маржа (факт)</span>
          <span className="dashboard-finance-value">{formatCurrency(totalMargin)}</span>
        </div>
        <div className="dashboard-finance-row">
          <span className="dashboard-finance-label">Рентабельность</span>
          <span className="dashboard-finance-value">{(totalProfitability * 100).toFixed(1)}%</span>
        </div>
        {nextCompanyGap && (
          <div className="dashboard-finance-row">
            <span className="dashboard-finance-label">Кассовый разрыв</span>
            <span className="dashboard-finance-value" style={{ color: 'var(--danger)' }}>{formatCurrency(nextCompanyGap.deficit)} <span className="dashboard-trend down">до {nextCompanyGap.date}</span></span>
          </div>
        )}
        <div className="dashboard-spark" style={{ height: '32px', background: 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 24"><polyline points="0,16 25,20 50,10 75,22 100,8 125,18 150,6 175,14 200,8" stroke="%232c6e9e" fill="none" stroke-width="1.5"/></svg>\') no-repeat center', backgroundSize: 'cover', opacity: 0.5 }}></div>
      </div>
    </div>
  )
}
