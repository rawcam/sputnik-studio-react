import React from 'react'
import { TractDevice } from '../../store/tractsSlice'

interface DeviceCardProps {
  device: TractDevice
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
  onToggleExpand: (e: React.MouseEvent) => void
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onClick, onDelete, onToggleExpand }) => {
  const getIcon = () => {
    if (device.type === 'source') return 'fas fa-camera'
    if (device.type === 'matrix') return 'fas fa-project-diagram'
    if (device.type === 'sink') return 'fas fa-tv'
    if (device.type === 'networkSwitch') return 'fas fa-network-wired'
    return 'fas fa-microchip'
  }

  const isExpanded = device.expanded !== false

  return (
    <div className={`device-card ${isExpanded ? 'expanded' : 'collapsed'}`} onClick={onClick}>
      <div className="device-header">
        <div className="device-name">
          <i className={getIcon()} style={{ marginRight: 6 }}></i>
          {isExpanded ? device.modelName : device.shortName}
        </div>
        <div className="device-short">{device.shortName}</div>
        <button className="delete-device" onClick={onDelete}>✕</button>
        <button className="collapse-device" onClick={onToggleExpand} title={isExpanded ? 'Свернуть' : 'Развернуть'}>
          <i className={`fas ${isExpanded ? 'fa-compress' : 'fa-expand'}`}></i>
        </button>
      </div>
      {isExpanded && (
        <div className="device-details">
          <span>⚡ {device.powerW} Вт</span>
          {device.poe && device.poeEnabled && <span>🔌 PoE ({device.poePower} Вт)</span>}
          {device.usb && <span>🔌 USB {device.usbVersion || '2.0'}</span>}
          {device.ethernet && <span>🔗 Ethernet</span>}
          <span>⏱️ {device.latency} мс</span>
        </div>
      )}
    </div>
  )
}
