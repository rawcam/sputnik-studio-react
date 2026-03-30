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
    <div className="sidebar-section">
      <div className="section-header" data-section="networkStats">
        <i className="fas fa-chart-line"></i>
        <span>СЕТЬ</span>
        <i className="fas fa-angle-down"></i>
      </div>
      <div className="section-content">
        <div className="widget">
          <div className="widget-item">
            <span className="widget-label"><i className="fas fa-chart-line"></i><span> Битрейт:</span></span>
            <span className="widget-value">{totalBitrate}</span> Мбит/с
          </div>
          <div className="widget-item">
            <span className="widget-label"><i className="fas fa-tachometer-alt"></i><span> Загрузка:</span></span>
            <span className="widget-value">{loadPercent}%</span>
          </div>
          <div className="widget-item">
            <span className="widget-label"><i className="fas fa-plug"></i><span> Порты:</span></span>
            <span className="widget-value">0</span>/<span>0</span>
          </div>
          <div className="widget-item">
            <span className="widget-label"><i className="fas fa-broadcast-tower"></i><span> Multicast:</span></span>
            <span className="widget-value">{network.multicast ? 'Вкл' : 'Выкл'}</span>
          </div>
          <div className="widget-item">
            <span className="widget-label"><i className="fas fa-chart-pie"></i><span> QoS:</span></span>
            <span className="widget-value">{network.qos ? 'Вкл' : 'Выкл'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
