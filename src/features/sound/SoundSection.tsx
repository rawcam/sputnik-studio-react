import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { setSoundConfig } from '../../store/soundSlice'

export const SoundSection: React.FC = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.sound)

  const handleModeChange = (mode: any) => {
    dispatch(setSoundConfig({ activeMode: mode }))
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
          <button onClick={() => handleModeChange('spl')} className={config.activeMode === 'spl' ? 'active' : ''}>SPL на расстоянии</button>
          <button onClick={() => handleModeChange('drop')} className={config.activeMode === 'drop' ? 'active' : ''}>Падение SPL</button>
          <button onClick={() => handleModeChange('power')} className={config.activeMode === 'power' ? 'active' : ''}>Изменение SPL от мощности</button>
          <button onClick={() => handleModeChange('rt60')} className={config.activeMode === 'rt60' ? 'active' : ''}>RT60</button>
          <button onClick={() => handleModeChange('speakers')} className={config.activeMode === 'speakers' ? 'active' : ''}>Подбор громкоговорителей</button>
        </div>
        {/* Поля будут добавлены позже */}
      </div>
    </div>
  )
}
