import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { VideoSection } from '../../features/video/VideoSection'
import './Sidebar.css'

export const Sidebar: React.FC = () => {
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
        <VideoSection />
        {/* Остальные аккордеоны будут добавлены позже */}
        <div className="sidebar-section">
          <div className="section-header">
            <i className="fas fa-cog"></i>
            <span>Остальные настройки (скоро)</span>
          </div>
          <div className="section-content">
            <p>Содержимое будет добавлено в следующих шагах</p>
          </div>
        </div>
      </div>
      <div className="sidebar-footer">Sputnik Studio v8.0<br />React Edition</div>
    </div>
  )
}
