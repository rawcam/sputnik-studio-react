import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { setViewMode } from '../../store/tractsSlice'

export const TractsSection: React.FC = () => {
  const dispatch = useDispatch()
  const tracts = useSelector((state: RootState) => state.tracts.tracts)
  const activeTractId = useSelector((state: RootState) => state.tracts.activeTractId)

  const handleNewTract = () => {
    // Создаём новый тракт через глобальный экшен – он будет обработан в ActiveTract
    // Но проще вызвать экшен из tractsSlice, но там нет отдельного экшена для создания через сайдбар,
    // поэтому пока сделаем так: переключимся на режим одного тракта и вызовем создание через ActiveTract.
    // Для простоты оставим пока как заглушку.
    alert('Используйте кнопку "Новый тракт" в области расчётов')
  }

  const handleShowAll = () => {
    dispatch(setViewMode('all'))
  }

  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="paths">
        <i className="fas fa-road"></i>
        <span>TRACTS</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content" id="pathsContent">
        <ul className="paths-list" id="sidebarPathsList">
          {tracts.map(tract => (
            <li key={tract.id} className={tract.id === activeTractId ? 'active' : ''}>
              <span className="path-name">{tract.name}</span>
              <div className="path-actions">
                <button className="edit-path" title="Переключиться">→</button>
              </div>
            </li>
          ))}
        </ul>
        <div className="tracts-actions">
          <button className="btn-primary add-path-btn" onClick={handleNewTract}>
            <i className="fas fa-plus"></i><span> Новый тракт</span>
          </button>
          <button className="btn-secondary" onClick={handleShowAll}>
            <i className="fas fa-th-list"></i><span> Отобразить все тракты</span>
          </button>
        </div>
      </div>
    </div>
  )
}
