import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { RootState } from '../../store'
import { sidebarModules } from '../../config/sidebarModules'
import './Sidebar.css'

export const Sidebar: React.FC = () => {
  const collapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed)
  const location = useLocation()
  const isCalculations = location.pathname.includes('/calculations')

  if (!isCalculations) return null

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
        {sidebarModules.map(module => (
          <module.component key={module.id} />
        ))}
      </div>
      <div className="sidebar-footer">Sputnik Studio v8.0<br />React Edition</div>
    </div>
  )
}
