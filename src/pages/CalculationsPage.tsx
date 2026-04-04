import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { setViewMode, setActiveCalculator } from '../store/tractsSlice'
import { Sidebar } from '../components/layout/Sidebar'
import { ActiveTract } from '../features/tracts/ActiveTract'
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

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'led': return <LedCalculator />
      case 'sound': return <SoundCalculator />
      case 'vc': return <VcCalculator />
      case 'ergo': return <ErgoCalculator />
      case 'power': return <PowerCalculator />
      default: return null
    }
  }

  // Если выбран калькулятор – показываем его
  if (viewMode === 'calculator' && activeCalculator) {
    return (
      <div className="calculations-layout">
        <Sidebar />
        <div className="main-content">
          {renderCalculator()}
        </div>
      </div>
    )
  }

  // Если режим одного тракта и есть активный тракт
  if (viewMode === 'single' && activeTract) {
    return (
      <div className="calculations-layout">
        <Sidebar />
        <div className="main-content">
          <ActiveTract />
        </div>
      </div>
    )
  }

  // Ничего не выбрано – показываем информационное сообщение
  return (
    <div className="calculations-layout">
      <Sidebar />
      <div className="main-content">
        <div className="empty-calculations">
          <i className="fas fa-calculator"></i>
          <h3>Начните работу</h3>
          <p>
            Выберите калькулятор из раздела <strong>«КАЛЬКУЛЯТОРЫ»</strong> в сайдбаре,<br />
            или создайте тракт для построения AV‑цепочки.
          </p>
          <small>Все расчёты сохраняются автоматически.</small>
        </div>
      </div>
    </div>
  )
}
