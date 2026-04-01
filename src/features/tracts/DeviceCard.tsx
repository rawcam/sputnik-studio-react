import React from 'react'
import { TractDevice } from '../../store/tractsSlice'

interface DeviceCardProps {
  device: TractDevice
  onDelete: () => void
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onDelete }) => {
  const getIcon = () => {
    if (device.type === 'source') return 'fas fa-camera'
    if (device.type === 'matrix') return 'fas fa-project-diagram'
    if (device.type === 'sink') return 'fas fa-tv'
    return 'fas fa-microchip'
  }

  return (
    <div className="device-card">
      <div className="device-header">
        <div className="device-name">
          <i className={getIcon()} style={{ marginRight: 6 }}></i>
          {device.modelName}
        </div>
        <div className="device-short">{device.shortName}</div>
      </div>
      <div className="device-details">
        <span>⏱️ {device.latency} мс</span>
        {device.poeEnabled && <span>🔌 PoE {device.poePower} Вт</span>}
        <span>💡 {device.powerW} Вт</span>
        {device.ethernet && device.attachedSwitchId && <span>🔗 сеть</span>}
        {device.ports && <span>🔌 портов: {device.ports}</span>}
        {device.poeBudget && <span>⚡ PoE бюджет: {device.poeBudget} Вт</span>}
        <button className="delete-device" onClick={onDelete}>
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>
  )
}
