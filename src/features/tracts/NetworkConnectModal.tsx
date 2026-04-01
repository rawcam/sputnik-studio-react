import React, { useState } from 'react'
import { TractDevice } from '../../store/tractsSlice'

interface NetworkConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (switchId: string) => void
  switches: TractDevice[]
  device: TractDevice
}

export const NetworkConnectModal: React.FC<NetworkConnectModalProps> = ({ isOpen, onClose, onConnect, switches, device }) => {
  const [selectedSwitchId, setSelectedSwitchId] = useState<string>(switches[0]?.id || '')

  const handleConnect = () => {
    if (selectedSwitchId) {
      onConnect(selectedSwitchId)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <span className="modal-close" onClick={onClose}>×</span>
        <h3>Подключение к сети</h3>
        <p>Устройство: <strong>{device.modelName}</strong> ({device.shortName})</p>
        {device.poeEnabled && <p>🔌 PoE: потребление {device.poePower} Вт</p>}
        <div className="setting">
          <label>Коммутатор:</label>
          <select value={selectedSwitchId} onChange={e => setSelectedSwitchId(e.target.value)}>
            {switches.map(sw => {
              const freePorts = (sw.ports || 0) - (sw.usedPorts?.length || 0)
              const poeInfo = sw.poeBudget ? ` (PoE ${(sw.poeBudget - (sw.usedPoE || 0)).toFixed(0)} Вт свободно)` : ''
              return (
                <option key={sw.id} value={sw.id}>
                  {sw.shortName} – свободно портов: {freePorts}{poeInfo}
                </option>
              )
            })}
          </select>
        </div>
        <div className="modal-buttons">
          <button className="btn-primary" onClick={handleConnect}>Подключить</button>
          <button className="btn-secondary" onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  )
}
