import React from 'react'
import { TractDevice } from '../../store/tractsSlice'

interface DeviceCardProps {
  device: TractDevice
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onClick, onDelete }) => {
  const getIcon = () => {
    if (device.type === 'source') return 'fas fa-camera'
    if (device.type === 'matrix') return 'fas fa-project-diagram'
    if (device.type === 'sink') return 'fas fa-tv'
    return 'fas fa-microchip'
  }

  const isConnected = device.attachedSwitchId !== undefined

  return (
    <div className="device-card" onClick={onClick}>
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
        {device.poc && <span>⚡ PoC</span>}
        <span>💡 {device.powerW} Вт</span>
        {isConnected && <span>🔗 {device.attachedSwitchId?.slice(-3)} порт {device.attachedPortNumber}</span>}
        <button className="delete-device" onClick={onDelete}>
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>
  )
}
