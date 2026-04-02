import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { calcLoadPercent } from '../../store/networkSlice'

export const NetworkStatsSection: React.FC = () => {
  const network = useSelector((state: RootState) => state.network)
  const tracts = useSelector((state: RootState) => state.tracts.tracts)
  const totalBitrate = tracts.reduce((sum, t) => sum + t.totalBitrate, 0)
  const loadPercent = calcLoadPercent(totalBitrate, network.cable)
  const totalPorts = tracts.reduce((sum, t) => sum + t.totalPorts, 0)
  const usedPorts = tracts.reduce((sum, t) => sum + t.usedPorts, 0)

  return (
    <div className="section-content-inner">
      <div className="widget-item">
        <span className="widget-label">Битрейт:</span>
        <span className="network-value">{totalBitrate} Мбит/с</span>
      </div>
      <div className="widget-item">
        <span className="widget-label">Загрузка:</span>
        <span className="network-value">{loadPercent}%</span>
      </div>
      <div className="widget-item">
        <span className="widget-label">Порты:</span>
        <span className="network-value">{usedPorts}</span>/<span>{totalPorts}</span>
      </div>
      <div className="widget-item">
        <span className="widget-label">Multicast:</span>
        <span className="network-value">{network.multicast ? 'Вкл' : 'Выкл'}</span>
      </div>
      <div className="widget-item">
        <span className="widget-label">QoS:</span>
        <span className="network-value">{network.qos ? 'Вкл' : 'Выкл'}</span>
      </div>
    </div>
  )
}
