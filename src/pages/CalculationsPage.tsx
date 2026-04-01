import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { setViewMode, setActiveCalculator } from '../store/tractsSlice'
import { ActiveTract } from '../features/tracts/ActiveTract'
import { AllTractsView } from '../features/tracts/AllTractsView'
import { LedCalculator } from '../features/led/LedCalculator'
import { SoundCalculator } from '../features/sound/SoundCalculator'
import { VcCalculator } from '../features/vc/VcCalculator'
import { ErgoCalculator } from '../features/ergo/ErgoCalculator'
import { PowerCalculator } from '../features/power/PowerCalculator'
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
        return <LedCalculator onBack={handleBackToTracts} />
      case 'sound':
        return <SoundCalculator onBack={handleBackToTracts} />
      case 'vc':
        return <VcCalculator onBack={handleBackToTracts} />
      case 'ergo':
        return <ErgoCalculator onBack={handleBackToTracts} />
      case 'power':
        return <PowerCalculator onBack={handleBackToTracts} />
      default:
        return null
    }
  }

  const renderContent = () => {
    if (viewMode === 'calculator' && activeCalculator) {
      return <div className="calculator-view">{renderCalculator()}</div>
    }
    if (viewMode === 'all') {
      return <AllTractsView />
    }
    return <ActiveTract />
  }

  return <div className="calculations-page">{renderContent()}</div>
}
