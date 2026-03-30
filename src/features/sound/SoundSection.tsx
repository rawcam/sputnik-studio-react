import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { setSoundConfig, setSoundMode } from '../../store/soundSlice'

export const SoundSection: React.FC = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.sound)

  const modes = [
    { mode: 'spl', label: 'SPL на расстоянии', icon: 'fa-volume-up' },
    { mode: 'drop', label: 'Падение SPL', icon: 'fa-chart-line' },
    { mode: 'power', label: 'Изменение SPL от мощности', icon: 'fa-bolt' },
    { mode: 'rt60', label: 'RT60 (реверберация)', icon: 'fa-hourglass-half' },
    { mode: 'speakers', label: 'Подбор громкоговорителей', icon: 'fa-microphone-alt' },
  ]

  const handleChange = (field: string, value: any) => {
    dispatch(setSoundConfig({ [field]: value }))
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
          {modes.map(m => (
            <button key={m.mode} className={config.activeMode === m.mode ? 'active' : ''} onClick={() => dispatch(setSoundMode(m.mode as any))}>
              <i className={m.icon}></i> {m.label}
            </button>
          ))}
        </div>

        {config.activeMode === 'spl' && (
          <>
            <div className="setting"><label>Чувствительность (дБ):</label><input type="number" value={config.sensitivity} onChange={e => handleChange('sensitivity', parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Мощность (Вт):</label><input type="number" value={config.sourcePower} onChange={e => handleChange('sourcePower', parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Расстояние (м):</label><input type="number" step="0.1" value={config.distance} onChange={e => handleChange('distance', parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Запас по звуку (дБ):</label><input type="number" value={config.headroom} onChange={e => handleChange('headroom', parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Усиление помещения (дБ):</label><input type="number" value={config.roomGain} onChange={e => handleChange('roomGain', parseFloat(e.target.value))} /></div>
          </>
        )}

        {config.activeMode === 'drop' && (
          <>
            <div className="setting"><label>Начальное расстояние (м):</label><input type="number" step="0.1" value={config.startDistance} onChange={e => handleChange('startDistance', parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Конечное расстояние (м):</label><input type="number" step="0.1" value={config.endDistance} onChange={e => handleChange('endDistance', parseFloat(e.target.value))} /></div>
          </>
        )}

        {config.activeMode === 'power' && (
          <>
            <div className="setting"><label>Начальная мощность (Вт):</label><input type="number" value={config.powerChangeFrom} onChange={e => handleChange('powerChangeFrom', parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Конечная мощность (Вт):</label><input type="number" value={config.powerChangeTo} onChange={e => handleChange('powerChangeTo', parseFloat(e.target.value))} /></div>
          </>
        )}

        {config.activeMode === 'rt60' && (
          <>
            <div className="setting"><label>Объём помещения (м³):</label><input type="number" value={config.roomVolume} onChange={e => handleChange('roomVolume', parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Площадь поверхностей (м²):</label><input type="number" value={config.roomArea} onChange={e => handleChange('roomArea', parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Средний коэффициент поглощения:</label><input type="number" step="0.01" value={config.avgAbsorption} onChange={e => handleChange('avgAbsorption', parseFloat(e.target.value))} /></div>
          </>
        )}

        {config.activeMode === 'speakers' && (
          <>
            <div className="setting"><label>Требуемый SPL (дБ):</label><input type="number" value={config.requiredSPL} onChange={e => handleChange('requiredSPL', parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Чувствительность громкоговорителя (дБ):</label><input type="number" value={config.speakerSensitivity} onChange={e => handleChange('speakerSensitivity', parseFloat(e.target.value))} /></div>
            <div className="setting"><label>Расстояние (м):</label><input type="number" step="0.1" value={config.distance} onChange={e => handleChange('distance', parseFloat(e.target.value))} /></div>
          </>
        )}

        <div className="result-item">
          <span className="result-label">Результат</span>
          <span className="result-value">{config.resultText}</span>
        </div>
      </div>
    </div>
  )
}
