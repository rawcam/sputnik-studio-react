import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { setVcConfig, setVcMode } from '../../store/vcSlice'

export const VcSection: React.FC = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.vc)

  const handleChange = (field: string, value: any) => {
    dispatch(setVcConfig({ [field]: value }))
  }

  return (
    <div className="sidebar-section">
      <div className="section-header" data-section="vc">
        <i className="fas fa-chalkboard"></i>
        <span>VC (ВКС)</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content">
        <div className="mode-buttons">
          <button className={config.activeMode === 'codec' ? 'active' : ''} onClick={() => dispatch(setVcMode('codec'))}>
            <i className="fas fa-satellite-dish"></i> Расчёт битрейта кодеков
          </button>
          <button className={config.activeMode === 'multipoint' ? 'active' : ''} onClick={() => dispatch(setVcMode('multipoint'))}>
            <i className="fas fa-users"></i> Многоточечный вызов
          </button>
        </div>

        {config.activeMode === 'codec' && (
          <>
            <div className="setting"><label>Кодек:</label>
              <select value={config.codecPreset} onChange={e => handleChange('codecPreset', e.target.value)}>
                <option value="trueconf">TrueConf</option>
                <option value="webrtc">WebRTC</option>
                <option value="h264">H.264</option>
                <option value="h265">H.265</option>
              </select>
            </div>
            <div className="setting"><label>Разрешение:</label>
              <select value={config.resolution} onChange={e => handleChange('resolution', e.target.value)}>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4K">4K</option>
              </select>
            </div>
            <div className="setting"><label>FPS:</label><input type="number" value={config.fps} onChange={e => handleChange('fps', parseInt(e.target.value))} /></div>
            <div className="setting"><label>Количество участников:</label><input type="number" value={config.participants} onChange={e => handleChange('participants', parseInt(e.target.value))} /></div>
          </>
        )}

        {config.activeMode === 'multipoint' && (
          <div className="setting"><label>Количество участников:</label><input type="number" value={config.multipointParticipants} onChange={e => handleChange('multipointParticipants', parseInt(e.target.value))} /></div>
        )}

        <div className="result-item">
          <span className="result-label">Результат</span>
          <span className="result-value">{config.resultText}</span>
        </div>
      </div>
    </div>
  )
}
