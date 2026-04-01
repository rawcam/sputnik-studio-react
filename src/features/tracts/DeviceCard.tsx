import React, { useState } from 'react'
import { TractDevice } from '../../store/tractsSlice'
import { NetworkConnectModal } from './NetworkConnectModal'

interface DeviceCardProps {
  device: TractDevice
  onDelete: () => void
  onConnect: (deviceId: string, switchId?: string) => void
  onDisconnect: (deviceId: string) => void
  switches: TractDevice[]
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onDelete, onConnect, onDisconnect, switches }) => {
  const [showNetworkModal, setShowNetworkModal] = useState(false)

  const getIcon = () => {
    if (device.type === 'source') return 'fas fa-camera'
    if (device.type === 'matrix') return 'fas fa-project-diagram'
    if (device.type === 'sink') return 'fas fa-tv'
    return 'fas fa-microchip'
  }

  const isConnected = device.attachedSwitchId !== undefined
  const showNetworkButton = device.ethernet && switches.length > 0

  return (
    <>
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
          {device.poc && <span>⚡ PoC</span>}
          <span>💡 {device.powerW} Вт</span>
          {isConnected && <span>🔗 {device.attachedSwitchId?.slice(-3)} порт {device.attachedPortNumber}</span>}
          {showNetworkButton && !isConnected && (
            <button className="network-btn" onClick={() => setShowNetworkModal(true)}>🔌 Подключить</button>
          )}
          {showNetworkButton && isConnected && (
            <button className="network-btn" onClick={() => onDisconnect(device.id)}>🔌 Отключить</button>
          )}
          <button className="delete-device" onClick={onDelete}>
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>

      <NetworkConnectModal
        isOpen={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
        onConnect={(switchId) => onConnect(device.id, switchId)}
        switches={switches}
        device={device}
      />
    </>
  )
}
