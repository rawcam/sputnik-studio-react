import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import { toggleTheme } from '../../store/themeSlice'
import { setRole, UserRole } from '../../store/authSlice'
import { RootState } from '../../store'
import './Topbar.css'

export const Topbar = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const theme = useSelector((state: RootState) => state.theme.mode)
  const user = useSelector((state: RootState) => state.auth.user)

  const getActiveClass = (path: string) => {
    return location.pathname === path ? 'active' : ''
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setRole(e.target.value as UserRole))
  }

  return (
    <div className="topbar">
      <div className="topbar-logo">
        <i className="fas fa-satellite-dish"></i> Sputnik Studio
      </div>
      <div className="topbar-nav">
        <Link to="/dashboard" className={`topbar-btn ${getActiveClass('/dashboard')}`}>Главная</Link>
        <Link to="/projects" className={`topbar-btn ${getActiveClass('/projects')}`}>Проекты</Link>
        <Link to="/calculations" className={`topbar-btn ${getActiveClass('/calculations')}`}>Расчёты</Link>
        <Link to="/templates" className={`topbar-btn ${getActiveClass('/templates')}`}>Шаблоны</Link>
      </div>
      <div className="topbar-actions">
        <select value={user?.role || 'pm'} onChange={handleRoleChange} className="role-select">
          <option value="director">Директор</option>
          <option value="pm">ГИП</option>
          <option value="engineer">Инженер</option>
          <option value="designer">Проектировщик</option>
          <option value="logist">Логист</option>
        </select>
        <button onClick={() => dispatch(toggleTheme())} title="Тема">
          <i className={`fas fa-${theme === 'dark' ? 'moon' : 'sun'}`}></i>
        </button>
        <button id="topbarSave" title="Сохранить"><i className="fas fa-save"></i></button>
        <button id="topbarExport" title="Экспорт"><i className="fas fa-file-export"></i></button>
      </div>
    </div>
  )
}
