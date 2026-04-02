import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useAuth } from '../../hooks/useAuth'

interface EmployeeLoad {
  name: string
  role: 'engineer' | 'projectManager'
  loadPercent: number
  projectsCount: number
  serviceVisitsCount: number
}

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

  if (!hasRole('director') && !hasRole('pm') && !hasRole('engineer')) return null

  const getServiceVisitsCountForEngineer = (engineerName: string): number => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 86400000)
    let count = 0
    projects.forEach(p => {
      p.serviceVisits.forEach(v => {
        if (v.responsible === engineerName && v.status === 'planned') {
          const visitDate = new Date(v.date)
          if (visitDate >= today && visitDate <= nextWeek) {
            count++
          }
        }
      })
    })
    return count
  }

  const calculateEngineerLoad = (projectsCount: number, serviceVisitsCount: number): number => {
    // Без ограничения сверху
    return projectsCount * 50 + serviceVisitsCount * 20
  }

  const calculatePMLoad = (projectsCount: number): number => {
    return projectsCount * 30
  }

  const engineerMap = new Map<string, { projectsCount: number; name: string }>()
  const pmMap = new Map<string, { projectsCount: number; name: string }>()

  projects.forEach(p => {
    if (p.status !== 'done') {
      const engName = p.engineer
      if (engName) {
        const existing = engineerMap.get(engName) || { projectsCount: 0, name: engName }
        existing.projectsCount++
        engineerMap.set(engName, existing)
      }
      const pmName = p.projectManager
      if (pmName) {
        const existing = pmMap.get(pmName) || { projectsCount: 0, name: pmName }
        existing.projectsCount++
        pmMap.set(pmName, existing)
      }
    }
  })

  const engineerLoads: EmployeeLoad[] = Array.from(engineerMap.values()).map(eng => {
    const visits = getServiceVisitsCountForEngineer(eng.name)
    return {
      name: eng.name,
      role: 'engineer',
      projectsCount: eng.projectsCount,
      serviceVisitsCount: visits,
      loadPercent: calculateEngineerLoad(eng.projectsCount, visits)
    }
  })

  const pmLoads: EmployeeLoad[] = Array.from(pmMap.values()).map(pm => ({
    name: pm.name,
    role: 'projectManager',
    projectsCount: pm.projectsCount,
    serviceVisitsCount: 0,
    loadPercent: calculatePMLoad(pm.projectsCount)
  }))

  const topEngineers = [...engineerLoads].sort((a, b) => b.loadPercent - a.loadPercent).slice(0, 3)
  const topPMs = [...pmLoads].sort((a, b) => b.loadPercent - a.loadPercent).slice(0, 3)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getProgressClass = (percent: number) => {
    if (percent >= 100) return 'danger'
    if (percent >= 85) return 'warning'
    return 'normal'
  }

  // Для прогресс-бара показываем до 100% (если больше 100 – полная шкала)
  const getBarWidth = (percent: number) => Math.min(percent, 100)

  const handleWidgetClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dashboard-widget-actions')) return
    navigate('/employees')
  }

  const handleEmployeeClick = (employeeName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/employee?name=${encodeURIComponent(employeeName)}`)
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
        <div className="dashboard-finance-label">Топ‑3 инженера</div>
        {topEngineers.length === 0 && <div>Нет данных</div>}
        {topEngineers.map(emp => (
          <div key={emp.name} className="dashboard-employee-row" onClick={(e) => handleEmployeeClick(emp.name, e)}>
            <div className="dashboard-avatar">{getInitials(emp.name)}</div>
            <div className="dashboard-employee-info">
              <div className="dashboard-employee-name">{emp.name}</div>
              <div className="dashboard-progress-bg">
                <div className={`dashboard-progress-fill ${getProgressClass(emp.loadPercent)}`} style={{ width: `${getBarWidth(emp.loadPercent)}%` }}></div>
              </div>
            </div>
            <div className="dashboard-employee-percent">{Math.round(emp.loadPercent)}%</div>
          </div>
        ))}
        <div className="dashboard-finance-label" style={{ marginTop: '8px' }}>Топ‑3 руководителя проектов</div>
        {topPMs.length === 0 && <div>Нет данных</div>}
        {topPMs.map(emp => (
          <div key={emp.name} className="dashboard-employee-row" onClick={(e) => handleEmployeeClick(emp.name, e)}>
            <div className="dashboard-avatar">{getInitials(emp.name)}</div>
            <div className="dashboard-employee-info">
              <div className="dashboard-employee-name">{emp.name}</div>
              <div className="dashboard-progress-bg">
                <div className={`dashboard-progress-fill ${getProgressClass(emp.loadPercent)}`} style={{ width: `${getBarWidth(emp.loadPercent)}%` }}></div>
              </div>
            </div>
            <div className="dashboard-employee-percent">{Math.round(emp.loadPercent)}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}
