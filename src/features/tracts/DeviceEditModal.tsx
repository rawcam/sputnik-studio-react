import React, { useState } from 'react'
import { TractDevice } from '../../store/tractsSlice'

interface DeviceEditModalProps {
  isOpen: boolean
  onClose: () => void
  device: TractDevice
  onSave: (updatedDevice: TractDevice) => void
}

export const DeviceEditModal: React.FC<DeviceEditModalProps> = ({ isOpen, onClose, device, onSave }) => {
  const [editedDevice, setEditedDevice] = useState<TractDevice>(device)

  const handleChange = (field: keyof TractDevice, value: any) => {
    setEditedDevice(prev => ({ ...prev, [field]: value }))
  }

  const poeOptions = [
    { value: 'false', label: 'Нет' },
    { value: 'true-af', label: '15.4 Вт' },
    { value: 'true-at', label: '30 Вт' },
    { value: 'true-bt', label: '60 Вт' },
  ]

  const getPoeValue = () => {
    if (!editedDevice.poeEnabled) return 'false'
    if (editedDevice.poePower === 15.4) return 'true-af'
    if (editedDevice.poePower === 30) return 'true-at'
    if (editedDevice.poePower === 60) return 'true-bt'
    return 'false'
  }

  const handlePoeChange = (val: string) => {
    if (val === 'false') {
      handleChange('poeEnabled', false)
      handleChange('poePower', undefined)
    } else if (val === 'true-af') {
      handleChange('poeEnabled', true)
      handleChange('poePower', 15.4)
    } else if (val === 'true-at') {
      handleChange('poeEnabled', true)
      handleChange('poePower', 30)
    } else if (val === 'true-bt') {
      handleChange('poeEnabled', true)
      handleChange('poePower', 60)
    }
  }

  const usbOptions = [
    { value: 'none', label: 'Нет' },
    { value: '2.0', label: 'USB 2.0' },
    { value: '3.0', label: 'USB 3.0' },
  ]

  const handleSave = () => {
    onSave(editedDevice)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <span className="modal-close" onClick={onClose}>×</span>
        <h3>Редактировать устройство</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          <div className="setting">
            <label>Мощность (Вт):</label>
            <input type="number" value={editedDevice.powerW} onChange={e => handleChange('powerW', parseFloat(e.target.value))} />
          </div>
          <div className="setting">
            <label>PoE:</label>
            <select value={getPoeValue()} onChange={e => handlePoeChange(e.target.value)}>
              {poeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="setting">
            <label>USB:</label>
            <select value={editedDevice.usb || 'none'} onChange={e => handleChange('usb', e.target.value === 'none' ? undefined : e.target.value)}>
              {usbOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="setting">
            <label>Ethernet:</label>
            <input
              type="checkbox"
              checked={editedDevice.ethernet || false}
              onChange={e => handleChange('ethernet', e.target.checked)}
            />
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
