import React from 'react'
import { useDispatch } from 'react-redux'
import { setViewMode, setActiveCalculator } from '../../store/tractsSlice'
import { setSoundMode } from '../../store/soundSlice'

export const SoundSection: React.FC = () => {
  const dispatch = useDispatch()

  const openCalculator = (mode: 'spl' | 'drop' | 'power' | 'rt60' | 'speakers') => {
    dispatch(setSoundMode(mode))
    dispatch(setActiveCalculator('sound'))
    dispatch(setViewMode('calculator'))
  }

  const modes = [
    { mode: 'spl', label: 'SPL на расстоянии', icon: 'fa-volume-up' },
    { mode: 'drop', label: 'Падение SPL', icon: 'fa-chart-line' },
    { mode: 'power', label: 'Изменение SPL от мощности', icon: 'fa-bolt' },
    { mode: 'rt60', label: 'RT60 (реверберация)', icon: 'fa-hourglass-half' },
    { mode: 'speakers', label: 'Подбор громкоговорителей', icon: 'fa-microphone-alt' },
  ]

  return (
    <div className="section-content-inner">
      <div className="mode-buttons">
        {modes.map(m => (
          <button key={m.mode} className="mode-btn" onClick={() => openCalculator(m.mode as any)}>
            <i className={m.icon}></i> {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
