import React from 'react'
import { useDispatch } from 'react-redux'
import { setViewMode, setActiveCalculator } from '../../store/tractsSlice'

export const SoundSection: React.FC = () => {
  const dispatch = useDispatch()

  const openCalculator = (mode: string) => {
    dispatch(setViewMode('calculator'))
    dispatch(setActiveCalculator('sound'))
    // режим можно передать через localStorage или в слайс sound, но пока просто открываем калькулятор
  }

  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="sound">
        <i className="fas fa-headphones"></i>
        <span>SOUND</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content">
        <div className="mode-buttons">
          <button className="mode-btn" onClick={() => openCalculator('spl')}><i className="fas fa-volume-up"></i> SPL на расстоянии</button>
          <button className="mode-btn" onClick={() => openCalculator('drop')}><i className="fas fa-chart-line"></i> Падение SPL от расстояния</button>
          <button className="mode-btn" onClick={() => openCalculator('power')}><i className="fas fa-bolt"></i> Изменение SPL от мощности</button>
          <button className="mode-btn" onClick={() => openCalculator('rt60')}><i className="fas fa-hourglass-half"></i> RT60 (реверберация)</button>
          <button className="mode-btn" onClick={() => openCalculator('speakers')}><i className="fas fa-microphone-alt"></i> Подбор громкоговорителей</button>
        </div>
      </div>
    </div>
  )
}
