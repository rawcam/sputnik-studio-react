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

export const CalculationsPage: React.FC = () => {
  const dispatch = useDispatch()
  const viewMode = useSelector((state: RootState) => state.tracts.viewMode)
  const activeCalculator = useSelector((state: RootState) => state.tracts.activeCalculator)
  const activeTractId = useSelector((state: RootState) => state.tracts.activeTractId)
  const tracts = useSelector((state: RootState) => state.tracts.tracts)

  const activeTract = tracts.find(t => t.id === activeTractId)

  const handleBackFromCalculator = () => {
    dispatch(setViewMode('single'))
    dispatch(setActiveCalculator(null))
  }

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'led': return <LedCalculator onBack={handleBackFromCalculator} />
      case 'sound': return <SoundCalculator onBack={handleBackFromCalculator} />
      case 'vc': return <VcCalculator onBack={handleBackFromCalculator} />
      case 'ergo': return <ErgoCalculator onBack={handleBackFromCalculator} />
      case 'power': return <PowerCalculator onBack={handleBackFromCalculator} />
      default: return null
    }
  }

  if (viewMode === 'all') {
    return <AllTractsView />
  }

  if (viewMode === 'calculator' && activeCalculator) {
    return <>{renderCalculator()}</>
  }

  if (viewMode === 'single' && activeTract) {
    return <ActiveTract />
  }

  // Пустое состояние – временно для теста
 return (
  <div className="empty-calculations">
    <i className="fas fa-calculator"></i>
    <h3>Начните работу</h3>
    <p>
      Выберите один из калькуляторов (<strong>LED, звук, ВКС, эргономика, питание</strong>) в сайдбаре,<br />
      или создайте тракт для построения AV‑цепочки.
    </p>
    <small>Все расчёты сохраняются автоматически.</small>
  </div>
)
