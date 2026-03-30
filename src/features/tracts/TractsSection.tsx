import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { setActiveTract, setViewMode } from '../../store/tractsSlice'

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
    dispatch({
      type: 'tracts/addTract',
      payload: {
        id: newId,
        name: `Тракт ${tracts.length + 1}`,
        sourceDevices: [],
        sinkDevices: [],
        networkSwitches: [],
      }
    })
    dispatch(setActiveTract(newId))
    dispatch(setViewMode('single'))
  }

  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="paths">
        <i className="fas fa-road"></i>
        <span>TRACTS</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content" id="pathsContent">
        <ul className="paths-list">
          {tracts.map(tract => (
            <li key={tract.id} onClick={() => handleSelect(tract.id)} className={tract.id === activeTractId ? 'active' : ''}>
              {tract.name}
            </li>
          ))}
        </ul>
        <div className="tracts-actions">
          <button className="btn-primary add-path-btn" onClick={handleNew}>
            <i className="fas fa-plus"></i><span> Новый тракт</span>
          </button>
          <button className="btn-secondary" onClick={() => dispatch(setViewMode('all'))}>
            <i className="fas fa-th-list"></i><span> Отобразить все тракты</span>
          </button>
        </div>
      </div>
    </div>
  )
}
