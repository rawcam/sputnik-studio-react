import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { setActiveTract, setViewMode } from '../../store/tractsSlice'

export const AllTractsView: React.FC = () => {
  const dispatch = useDispatch()
  const tracts = useSelector((state: RootState) => state.tracts.tracts)

  const handleSelectTract = (id: string) => {
    dispatch(setActiveTract(id))
    dispatch(setViewMode('single'))
  }

  return (
    <div className="all-tracts-view">
      <h2>Все тракты</h2>
      {tracts.length === 0 && <div className="empty-state">Нет трактов. Создайте первый.</div>}
      <div className="tracts-list">
        {tracts.map(tract => (
          <div key={tract.id} className="tract-summary" onClick={() => handleSelectTract(tract.id)}>
            <h3>{tract.name}</h3>
            <div className="tract-summary-stats">
              <span>Задержка: {tract.totalLatency} мс</span>
              <span>Битрейт: {tract.totalBitrate} Мбит/с</span>
              <span>Мощность: {tract.totalPower} Вт</span>
            </div>
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={() => dispatch(setViewMode('single'))}>
        Вернуться к активному тракту
      </button>
    </div>
  )
}
