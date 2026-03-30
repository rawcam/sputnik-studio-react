import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { setViewMode, setActiveCalculator } from '../store/tractsSlice'
import { ActiveTract } from '../features/tracts/ActiveTract'
import { AllTractsView } from '../features/tracts/AllTractsView'
// Импорты калькуляторов будут добавлены позже, пока заглушки
import './CalculationsPage.css'

export const CalculationsPage: React.FC = () => {
  const dispatch = useDispatch()
  const viewMode = useSelector((state: RootState) => state.tracts.viewMode)
  const activeCalculator = useSelector((state: RootState) => state.tracts.activeCalculator)

  const handleBackToTracts = () => {
    dispatch(setViewMode('single'))
    dispatch(setActiveCalculator(null))
  }

  const renderContent = () => {
    if (viewMode === 'calculator' && activeCalculator) {
      // Здесь будем рендерить калькуляторы по activeCalculator
      return (
        <div className="calculator-view">
          <button className="btn-secondary" onClick={handleBackToTracts}>
            <i className="fas fa-arrow-left"></i> Назад к трактам
          </button>
          <div className="calculator-container">
            {/* Заглушка, позже заменим на реальные компоненты */}
            <p>Калькулятор {activeCalculator} будет здесь</p>
          </div>
        </div>
      )
    }
    if (viewMode === 'all') {
      return <AllTractsView />
    }
    return <ActiveTract />
  }

  return (
    <div className="calculations-page">
      {renderContent()}
    </div>
  )
}
