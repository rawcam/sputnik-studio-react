import React, { useState } from 'react'
import { TractDevice } from '../../store/tractsSlice'

interface DeviceEditModalProps {
  isOpen: boolean
  onClose: () => void
  device: TractDevice
  switches: TractDevice[]
  onSave: (updatedDevice: TractDevice) => void
}

export const DeviceEditModal: React.FC<DeviceEditModalProps> = ({ isOpen, onClose, device, switches, onSave }) => {
  const [editedDevice, setEditedDevice] = useState<TractDevice>(device)
  const [selectedSwitchId, setSelectedSwitchId] = useState<string>(device.attachedSwitchId || '')
  const [networkEnabled, setNetworkEnabled] = useState(!!device.attachedSwitchId)

  const handleChange = (field: keyof TractDevice, value: any) => {
    setEditedDevice(prev => ({ ...prev, [field]: value }))
  }

  const handleNetworkToggle = (enabled: boolean) => {
    setNetworkEnabled(enabled)
    if (!enabled) {
      setSelectedSwitchId('')
      handleChange('attachedSwitchId', undefined)
      handleChange('attachedPortNumber', undefined)
    }
  }

  const handleSwitchChange = (switchId: string) => {
    setSelectedSwitchId(switchId)
    // Здесь можно автоматически назначить порт, но пока оставим пустым
    handleChange('attachedSwitchId', switchId || undefined)
  }

  const handleSave = () => {
    onSave(editedDevice)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <span className="modal-close" onClick={onClose}>×</span>
        <h3>Редактирование устройства</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Левая колонка – основные параметры */}
          <div>
            <div className="setting">
              <label>Модель:</label>
              <span>{editedDevice.modelName}</span>
            </div>
            <div className="setting">
              <label>Короткое имя:</label>
              <input type="text" value={editedDevice.shortName} onChange={e => handleChange('shortName', e.target.value)} />
            </div>
            <div className="setting">
              <label>Задержка (мс):</label>
              <input type="number" step="0.1" value={editedDevice.latency} onChange={e => handleChange('latency', parseFloat(e.target.value))} />
            </div>
            <div className="setting">
              <label>Мощность (Вт):</label>
              <input type="number" value={editedDevice.powerW} onChange={e => handleChange('powerW', parseFloat(e.target.value))} />
            </div>
            <div className="setting">
              <label>PoE:</label>
              <input
                type="checkbox"
                checked={editedDevice.poeEnabled || false}
                onChange={e => handleChange('poeEnabled', e.target.checked)}
              />
            </div>
            {editedDevice.poeEnabled && (
              <div className="setting">
                <label>PoE мощность (Вт):</label>
                <input
                  type="number"
                  value={editedDevice.poePower || 0}
                  onChange={e => handleChange('poePower', parseFloat(e.target.value))}
                />
              </div>
            )}
          </div>
          {/* Правая колонка – сетевое подключение */}
          <div>
            <div className="setting">
              <label>Сетевое подключение:</label>
              <input
                type="checkbox"
                checked={networkEnabled}
                onChange={e => handleNetworkToggle(e.target.checked)}
              />
            </div>
            {networkEnabled && (
              <>
                <div className="setting">
                  <label>Коммутатор:</label>
                  <select value={selectedSwitchId} onChange={e => handleSwitchChange(e.target.value)}>
                    <option value="">-- Не выбран --</option>
                    {switches.map(sw => (
                      <option key={sw.id} value={sw.id}>
                        {sw.shortName} (свободно портов: {(sw.ports || 0) - (sw.usedPorts?.length || 0)})
                        {sw.poeBudget ? `, PoE ${((sw.poeBudget || 0) - (sw.usedPoE || 0)).toFixed(0)} Вт` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedSwitchId && (
                  <div className="setting">
                    <label>Порт (автоматически):</label>
                    <span>будет назначен первый свободный</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="modal-buttons">
          <button className="btn-primary" onClick={handleSave}>Сохранить</button>
          <button className="btn-secondary" onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  )
}
