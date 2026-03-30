import React from 'react'

interface TractDeviceItemProps {
  device: any
  onDelete: () => void
}

export const TractDeviceItem: React.FC<TractDeviceItemProps> = ({ device, onDelete }) => {
  return (
    <div className="tract-device-item">
      <div className="device-info">
        <i className={`fas ${device.icon || 'fa-microchip'}`}></i>
        <span className="device-name">{device.modelName}</span>
        <span className="device-latency">{device.latency} мс</span>
        <span className="device-power">{device.powerW} Вт</span>
      </div>
      <button className="remove-item" onClick={onDelete} title="Удалить">
        <i className="fas fa-trash-alt"></i>
      </button>
    </div>
  )
}
