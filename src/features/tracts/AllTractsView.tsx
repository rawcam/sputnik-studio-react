import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { setActiveTract, setViewMode } from '../../store/tractsSlice'

export const AllTractsView = () => {
  const dispatch = useDispatch()
  const tracts = useSelector((state: RootState) => state.tracts.tracts)

  const handleSelectTract = (id: string) => {
    dispatch(setActiveTract(id))
    dispatch(setViewMode('single'))
  }

  return (
    <div className="all-tracts-view">
      <h3>Все тракты</h3>
      {tracts.length === 0 && <div>Нет трактов. Создайте первый.</div>}
      <ul>
        {tracts.map(tract => (
          <li key={tract.id} onClick={() => handleSelectTract(tract.id)} style={{ cursor: 'pointer' }}>
            {tract.name} (задержка: {tract.totalLatency} мс)
          </li>
        ))}
      </ul>
      <button className="btn-primary" onClick={() => dispatch(setViewMode('single'))}>
        Вернуться к активному тракту
      </button>
    </div>
  )
}
