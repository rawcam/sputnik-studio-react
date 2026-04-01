import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { addTract, setActiveTract, setViewMode } from '../../store/tractsSlice'

export const TractsSection: React.FC = () => {
  const dispatch = useDispatch()
  const tracts = useSelector((state: RootState) => state.tracts.tracts)
  const activeTractId = useSelector((state: RootState) => state.tracts.activeTractId)

  const handleSelect = (id: string) => {
    dispatch(setActiveTract(id))
    dispatch(setViewMode('single'))
  }

  const handleNew = () => {
    const newId = Date.now().toString()
    dispatch(addTract({
      id: newId,
      name: `Тракт ${tracts.length + 1}`,
      sourceDevices: [],
      matrixDevices: [],
      sinkDevices: [],
    }))
    dispatch(setActiveTract(newId))
    dispatch(setViewMode('single'))
  }

  return (
    <div className="section-content-inner">
      <ul className="paths-list">
        {tracts.map(tract => (
          <li key={tract.id} onClick={() => handleSelect(tract.id)} className={tract.id === activeTractId ? 'active' : ''}>
            {tract.name}
          </li>
        ))}
      </ul>
      <div className="tracts-actions">
        <button className="mode-btn" onClick={handleNew}>
          <i className="fas fa-plus"></i> Новый тракт
        </button>
        <button className="mode-btn" onClick={() => dispatch(setViewMode('all'))}>
          <i className="fas fa-th-list"></i> Отобразить все тракты
        </button>
      </div>
    </div>
  )
}
