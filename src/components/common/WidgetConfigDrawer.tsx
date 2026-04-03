import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { closeWidgetConfig } from '../../store/uiSlice'
import { 
  toggleWidget, 
  setDisplayMode, 
  resetToRolePreset, 
  WidgetId,
  DisplayMode 
} from '../../store/widgetsSlice'
import { setRole } from '../../store/authSlice' // предполагаем, что есть экшен setRole

export const WidgetConfigDrawer: React.FC = () => {
  const dispatch = useDispatch()
  const isOpen = useSelector((state: RootState) => state.ui.widgetConfigOpen)
  const visibleWidgets = useSelector((state: RootState) => state.widgets.visibleWidgets)
  const displayMode = useSelector((state: RootState) => state.widgets.displayMode)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) dispatch(closeWidgetConfig())
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, dispatch])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node) && isOpen) {
        dispatch(closeWidgetConfig())
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, dispatch])

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

  const handleRolePreset = (role: string) => {
    dispatch(resetToRolePreset(role))
    dispatch(setRole(role))  // обновляем роль в authSlice
  }

  if (!isOpen) return null

  return (
    <>
      <div className="drawer-overlay visible" onClick={() => dispatch(closeWidgetConfig())}></div>
      <div className="widget-drawer" ref={drawerRef}>
        <div className="drawer-header">
          <h3><i className="fas fa-sliders-h"></i> Настройка виджетов</h3>
          <button className="drawer-close" onClick={() => dispatch(closeWidgetConfig())}>×</button>
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
          <select 
            className="role-select"
            onChange={(e) => handleRolePreset(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Выберите роль</option>
            <option value="engineer">🔧 Инженер</option>
            <option value="pm">📋 Руководитель (ГИП)</option>
            <option value="director">👑 Директор</option>
          </select>
        </div>
      </div>
    </>
  )
}
