import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { toggleTheme } from '../../store/themeSlice'
import { openWidgetConfig } from '../../store/uiSlice'
import { useAuth } from '../../hooks/useAuth'

export const Topbar: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = useSelector((state: RootState) => state.theme.mode)
  const { user } = useAuth()

  return (
    <div className="topbar">
      <div className="logo" onClick={() => navigate('/dashboard')}>
        Sputnik Studio
      </div>
      <div className="nav-buttons">
        <button onClick={() => navigate('/dashboard')}>Главная</button>
        <button onClick={() => navigate('/projects')}>Проекты</button>
        <button onClick={() => navigate('/calculations')}>Расчёты</button>
        <button onClick={() => navigate('/templates')}>Шаблоны</button>
      </div>
      <div className="topbar-actions">
        <button onClick={() => dispatch(toggleTheme())}>
          <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>
        <button onClick={() => dispatch(openWidgetConfig())} className="widget-config-btn">
          <i className="fas fa-sliders-h"></i>
        </button>
        <span className="role-badge">{user?.role === 'director' ? 'Директор' : user?.role === 'pm' ? 'ГИП' : user?.role}</span>
      </div>
    </div>
  )
}
