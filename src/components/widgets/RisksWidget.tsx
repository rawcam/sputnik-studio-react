import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useAuth } from '../../hooks/useAuth'

interface Risk {
  id: string
  projectId?: string
  projectName?: string
  message: string
  date?: string
  type: 'deadline' | 'finance' | 'network'
}

export const RisksWidget: React.FC = () => {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const projects = useSelector((state: RootState) => state.projects.list)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hiddenRisks, setHiddenRisks] = useState<string[]>(() => {
    const saved = localStorage.getItem('hiddenRisks')
    return saved ? JSON.parse(saved) : []
  })
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

  // Формирование списка рисков на основе данных проектов
  const allRisks: Risk[] = []

  projects.forEach(p => {
    // Финансовый риск: отрицательная маржа
    const actualMargin = p.actualIncome - p.actualExpenses
    if (actualMargin < 0) {
      allRisks.push({
        id: `finance-${p.id}`,
        projectId: p.id,
        projectName: p.name,
        message: `Отрицательная маржа: ${Math.abs(actualMargin).toLocaleString()} ₽`,
        type: 'finance',
      })
    }
    // Риск сдвига сроков: если плановая дата следующего этапа просрочена
    if (p.nextStatusDate && new Date(p.nextStatusDate) < new Date() && p.status !== 'done') {
      allRisks.push({
        id: `deadline-${p.id}`,
        projectId: p.id,
        projectName: p.name,
        message: `Сдвиг сроков: ${p.nextStatus} (${p.nextStatusDate})`,
        date: p.nextStatusDate,
        type: 'deadline',
      })
    }
  })

  // Демо-риск по сети (можно позже получать из трактов)
  if (allRisks.length < 3) {
    allRisks.push({
      id: 'network-1',
      message: 'Загрузка сети >90% (пик 94%)',
      type: 'network',
    })
  }

  const visibleRisks = allRisks.filter(risk => !hiddenRisks.includes(risk.id))

  const handleRiskCheck = (riskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newHidden = [...hiddenRisks, riskId]
    setHiddenRisks(newHidden)
    localStorage.setItem('hiddenRisks', JSON.stringify(newHidden))
  }

  const handleRiskClick = (risk: Risk, e: React.MouseEvent) => {
    e.stopPropagation()
    if (risk.projectId) {
      navigate(`/projects?id=${risk.projectId}`)
    } else {
      navigate('/network') // если риск сети, ведём на страницу сети
    }
  }

  const handleWidgetClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dashboard-widget-actions')) return
    navigate('/risks')
  }

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(prev => !prev)
  }

  const handleMenuAction = (action: string) => {
    setMenuOpen(false)
    if (action === 'refresh') {
      alert('Обновление данных (демо)')
    } else if (action === 'reset') {
      localStorage.removeItem('hiddenRisks')
      setHiddenRisks([])
      alert('Скрытые риски восстановлены')
    } else if (action === 'hide') {
      const hiddenWidgets = JSON.parse(localStorage.getItem('hiddenWidgets') || '[]')
      if (!hiddenWidgets.includes('risks')) {
        hiddenWidgets.push('risks')
        localStorage.setItem('hiddenWidgets', JSON.stringify(hiddenWidgets))
        alert('Виджет скрыт. Обновите страницу.')
        window.location.reload()
      }
    }
  }

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'deadline': return <i className="fas fa-clock"></i>
      case 'finance': return <i className="fas fa-chart-line"></i>
      case 'network': return <i className="fas fa-microchip"></i>
      default: return <i className="fas fa-exclamation-triangle"></i>
    }
  }

  return (
    <div className="dashboard-widget" onClick={handleWidgetClick}>
      <div className="dashboard-widget-header">
        <div className="dashboard-widget-title">
          <i className="fas fa-exclamation-triangle"></i> Риски
        </div>
        <div className="dashboard-widget-actions">
          <button ref={buttonRef} className="dashboard-icon-btn" onClick={handleMenuToggle}>
            <i className="fas fa-ellipsis-h"></i>
          </button>
          {menuOpen && (
            <div className="dashboard-widget-menu" ref={menuRef}>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('refresh')}>Обновить</div>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('reset')}>Восстановить риски</div>
              <div className="dashboard-widget-menu-item" onClick={() => handleMenuAction('hide')}>Скрыть виджет</div>
            </div>
          )}
        </div>
      </div>
      <div className="dashboard-widget-content">
        {visibleRisks.length === 0 && (
          <div className="dashboard-service-item">Нет активных рисков</div>
        )}
        {visibleRisks.map(risk => (
          <div 
            key={risk.id} 
            className="dashboard-risk-item" 
            onClick={(e) => handleRiskClick(risk, e)}
          >
            <div className="dashboard-risk-icon">{getRiskIcon(risk.type)}</div>
            <div className="dashboard-risk-text">
              {risk.projectName && <strong>{risk.projectName}</strong>} {risk.message}
            </div>
            {risk.date && <div className="dashboard-risk-date">{risk.date}</div>}
            <input 
              type="checkbox" 
              className="dashboard-risk-check" 
              onClick={(e) => handleRiskCheck(risk.id, e)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
