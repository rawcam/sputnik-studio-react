import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { 
  toggleWidget, 
  setDisplayMode, 
  resetToRolePreset, 
  WidgetId,
  DisplayMode 
} from '../../store/widgetsSlice'

interface WidgetConfigDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const WidgetConfigDrawer: React.FC<WidgetConfigDrawerProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const visibleWidgets = useSelector((state: RootState) => state.widgets.visibleWidgets)
  const displayMode = useSelector((state: RootState) => state.widgets.displayMode)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node) && isOpen) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const widgetsList: { id: WidgetId; label: string; icon: string }[] = [
    { id: 'companyFinance', label: 'Финансы компании', icon: 'fa-chart-line' },
    { id: 'projectsFinance', label: 'Финансы проектов', icon: 'fa-chart-pie' },
    { id: 'service', label: 'Сервис и регламент', icon: 'fa-tools' },
    { id: 'workload', label: 'Загрузка сотрудников', icon: 'fa-users' },
    { id: 'risks', label: 'Риски', icon: 'fa-exclamation-triangle' },
    { id: 'carousel', label: 'Активные проекты', icon: 'fa-rocket' },
  ]

  const handleToggle = (id: WidgetId) => {
    dispatch(toggleWidget(id))
  }

  const handleModeChange = (mode: DisplayMode) => {
    dispatch(setDisplayMode(mode))
  }

  const handlePreset = (role: string) => {
    dispatch(resetToRolePreset(role))
  }

  if (!isOpen) return null

  return (
    <>
      <div className="drawer-overlay visible" onClick={onClose}></div>
      <div className="widget-drawer" ref={drawerRef}>
        <div className="drawer-header">
          <h3><i className="fas fa-sliders-h"></i> Настройка виджетов</h3>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        <div className="drawer-section">
          <h4>Отображение виджетов</h4>
          {widgetsList.map(w => (
            <div key={w.id} className="drawer-toggle-item">
              <span><i className={`fas ${w.icon}`}></i> {w.label}</span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={visibleWidgets.includes(w.id)} 
                  onChange={() => handleToggle(w.id)}
                />
                <span className="slider"></span>
              </label>
            </div>
          ))}
        </div>

        <div className="drawer-section">
          <h4>Режим отображения</h4>
          <div className="mode-buttons">
            <button 
              className={`mode-btn ${displayMode === 'normal' ? 'active' : ''}`}
              onClick={() => handleModeChange('normal')}
            >
              Обычный
            </button>
            <button 
              className={`mode-btn ${displayMode === 'compact' ? 'active' : ''}`}
              onClick={() => handleModeChange('compact')}
            >
              Компактный
            </button>
          </div>
        </div>

        <div className="drawer-section">
          <h4>Быстрые настройки (по ролям)</h4>
          <div className="preset-buttons">
            <button className="preset-btn" onClick={() => handlePreset('engineer')}>🔧 Инженер</button>
            <button className="preset-btn" onClick={() => handlePreset('pm')}>📋 Руководитель</button>
            <button className="preset-btn" onClick={() => handlePreset('director')}>👑 Директор</button>
          </div>
        </div>
      </div>
    </>
  )
}
