import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { calcLoadPercent } from '../../store/networkSlice'

export const NetworkStatsSection: React.FC = () => {
  const network = useSelector((state: RootState) => state.network)
  const totalBitrate = useSelector((state: RootState) => 
    state.tracts.tracts.reduce((sum, t) => sum + t.totalBitrate, 0)
  )
  const loadPercent = calcLoadPercent(totalBitrate, network.cable)

  return (
    <div className="section-content-inner">
      <div className="widget-item">
        <span className="widget-label">Битрейт:</span>
        <span className="widget-value">{totalBitrate} Мбит/с</span>
      </div>
      <div className="widget-item">
        <span className="widget-label">Загрузка:</span>
        <span className="widget-value">{loadPercent}%</span>
      </div>
      <div className="widget-item">
        <span className="widget-label">Порты:</span>
        <span className="widget-value">0</span>/<span>0</span>
      </div>
      <div className="widget-item">
        <span className="widget-label">Multicast:</span>
        <span className="widget-value">{network.multicast ? 'Вкл' : 'Выкл'}</span>
      </div>
      <div className="widget-item">
        <span className="widget-label">QoS:</span>
        <span className="widget-value">{network.qos ? 'Вкл' : 'Выкл'}</span>
      </div>
    </div>
  )
}
