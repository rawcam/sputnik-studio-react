import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { setViewMode, setActiveCalculator } from '../store/tractsSlice'
import { ActiveTract } from '../features/tracts/ActiveTract'
import { AllTractsView } from '../features/tracts/AllTractsView'
import { LedCalculator } from '../features/led/LedCalculator'
// аналогично импорты для SoundCalculator, VcCalculator, ErgoCalculator, PowerCalculator – позже добавим
import './CalculationsPage.css'

export const CalculationsPage: React.FC = () => {
  const dispatch = useDispatch()
  const viewMode = useSelector((state: RootState) => state.tracts.viewMode)
  const activeCalculator = useSelector((state: RootState) => state.tracts.activeCalculator)

  const handleBackToTracts = () => {
    dispatch(setViewMode('single'))
    dispatch(setActiveCalculator(null))
  }

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'led':
        return <LedCalculator />
      // case 'sound': return <SoundCalculator />
      // case 'vc': return <VcCalculator />
      // case 'ergo': return <ErgoCalculator />
      // case 'power': return <PowerCalculator />
      default:
        return (
          <div className="calculator-view">
            <button className="btn-secondary" onClick={handleBackToTracts}>
              <i className="fas fa-arrow-left"></i> Назад к трактам
            </button>
            <div className="calculator-container">
              <p>Калькулятор {activeCalculator} будет здесь</p>
            </div>
          </div>
        )
    }
  }

  const renderContent = () => {
    if (viewMode === 'calculator' && activeCalculator) {
      return renderCalculator()
    }
    if (viewMode === 'all') {
      return <AllTractsView />
    }
    return <ActiveTract />
  }

  return <div className="calculations-page">{renderContent()}</div>
}
