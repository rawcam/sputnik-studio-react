import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { toggleSidebar } from '../../store/uiSlice'
import { VideoSection } from '../../features/video/VideoSection'
import { NetworkSection } from '../../features/network/NetworkSection'
import { LedSection } from '../../features/led/LedSection'
import { SoundSection } from '../../features/sound/SoundSection'
import { VcSection } from '../../features/vc/VcSection'
import { ErgoSection } from '../../features/ergo/ErgoSection'
import { PowerSection } from '../../features/power/PowerSection'
import { TractsSection } from '../../features/tracts/TractsSection'
import './Sidebar.css'

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch()
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
          <div className="collapse-btn" onClick={() => dispatch(toggleSidebar())}>
            <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`}></i>
          </div>
        </div>
      </div>

      <div id="sidebarSectionsContainer">
        <VideoSection />
        <NetworkSection />
        <LedSection />
        <SoundSection />
        <VcSection />
        <ErgoSection />
        <PowerSection />
        <TractsSection />
        {/* Здесь можно добавить статистику и управление, но для краткости оставим */}
      </div>

      <div className="sidebar-footer">Sputnik Studio v8.0<br />React Edition</div>
    </div>
  )
}
