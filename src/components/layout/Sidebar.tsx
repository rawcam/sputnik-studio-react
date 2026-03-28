import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import './Sidebar.css'

export const Sidebar = () => {
  const collapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed)
  const location = window.location.pathname

  // Показываем сайдбар только на странице расчётов
  if (location !== '/calculations') return null

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>SPUTNIK STUDIO</h2>
        <div className="header-actions">
          <div className="theme-switch" id="themeSwitch"><i className="fas fa-sun"></i></div>
          <div className="collapse-btn" id="collapseSidebarBtn">
            <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`}></i>
          </div>
        </div>
      </div>
      <div id="sidebarSectionsContainer">
        {/* Аккордеоны будут добавлены позже */}
        <div className="sidebar-section">
          <div className="section-header">
            <i className="fas fa-cog"></i>
            <span>Настройки (заглушка)</span>
          </div>
          <div className="section-content">
            <p>Содержимое сайдбара будет реализовано позже</p>
          </div>
        </div>
      </div>
      <div className="sidebar-footer">Sputnik Studio v8.0<br />React Edition</div>
    </div>
  )
}
