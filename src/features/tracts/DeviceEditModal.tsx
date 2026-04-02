import React, { useState, useEffect } from 'react'
import { useAppDispatch } from '../../hooks'
import { TractDevice } from '../../store/tractsSlice'
import { updateDeviceThunk } from '../../store/tractsSlice'

interface DeviceEditModalProps {
  isOpen: boolean
  onClose: () => void
  device: TractDevice
  tractId: string
}

export const DeviceEditModal: React.FC<DeviceEditModalProps> = ({ isOpen, onClose, device, tractId }) => {
  const dispatch = useAppDispatch()
  const [editedDevice, setEditedDevice] = useState<TractDevice>(device)
  const [error, setError] = useState<string | null>(null)

  // Синхронизация при изменении device извне
  useEffect(() => {
    setEditedDevice(device)
  }, [device])

  const handleChange = (field: keyof TractDevice, value: any) => {
    setEditedDevice(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  // Опции PoE с указанием стандартов
  const poeOptions = [
    { value: 'false', label: 'Нет' },
    { value: 'true-af', label: '15.4 Вт (802.3af)' },
    { value: 'true-at', label: '30 Вт (802.3at)' },
    { value: 'true-bt-60', label: '60 Вт (802.3bt Type 3)' },
    { value: 'true-bt-90', label: '90 Вт (802.3bt Type 4)' },
  ]

  const getPoeValue = () => {
    if (!editedDevice.poeEnabled) return 'false'
    if (editedDevice.poePower === 15.4) return 'true-af'
    if (editedDevice.poePower === 30) return 'true-at'
    if (editedDevice.poePower === 60) return 'true-bt-60'
    if (editedDevice.poePower === 90) return 'true-bt-90'
    return 'false'
  }

  const handlePoeChange = (val: string) => {
    if (val === 'false') {
      handleChange('poeEnabled', false)
      handleChange('poePower', 0)
      // При выключении PoE Ethernet не выключаем (оставляем как есть)
    } else {
      let power = 0
      if (val === 'true-af') power = 15.4
      else if (val === 'true-at') power = 30
      else if (val === 'true-bt-60') power = 60
      else if (val === 'true-bt-90') power = 90
      handleChange('poeEnabled', true)
      handleChange('poePower', power)
      // Если Ethernet был выключен, включаем его автоматически
      if (!editedDevice.ethernet) {
        handleChange('ethernet', true)
      }
    }
  }

  const handleEthernetChange = (checked: boolean) => {
    if (!checked && editedDevice.poeEnabled) {
      // Если выключаем Ethernet, то PoE тоже должен выключиться
      handleChange('ethernet', false)
      handleChange('poeEnabled', false)
      handleChange('poePower', 0)
    } else {
      handleChange('ethernet', checked)
    }
  }

  const usbOptions = [
    { value: 'none', label: 'Нет' },
    { value: '2.0', label: 'USB 2.0' },
    { value: '3.0', label: 'USB 3.0' },
    { value: '3.1', label: 'USB 3.1' },
  ]

  const handleSave = async () => {
    try {
      await dispatch(updateDeviceThunk({
        tractId,
        deviceId: device.id,
        updates: editedDevice
      })).unwrap()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении')
    }
  }

  if (!isOpen) return null

  const supportsPoE = device.poe === true

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content edit-device-modal" style={{ maxWidth: '500px', padding: '20px' }}>
        <span className="modal-close" onClick={onClose}>×</span>
        <h3 style={{ marginBottom: '20px' }}>Редактировать устройство</h3>
        {error && <div style={{ color: 'red', marginBottom: '12px' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="setting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <label style={{ fontWeight: 500, width: '120px' }}>Мощность (Вт):</label>
            <input
              type="number"
              value={editedDevice.powerW}
              onChange={e => handleChange('powerW', parseFloat(e.target.value))}
              style={{ flex: 1, padding: '6px 10px', borderRadius: '20px', border: '1px solid var(--border-light)', background: 'var(--bg-panel-solid)' }}
            />
          </div>
          {supportsPoE && (
            <div className="setting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <label style={{ fontWeight: 500, width: '120px' }}>PoE:</label>
              <select
                value={getPoeValue()}
                onChange={e => handlePoeChange(e.target.value)}
                style={{ flex: 1, padding: '6px 10px', borderRadius: '20px', border: '1px solid var(--border-light)', background: 'var(--bg-panel-solid)' }}
              >
                {poeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          )}
          <div className="setting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <label style={{ fontWeight: 500, width: '120px' }}>USB:</label>
            <select
              value={editedDevice.usbVersion || 'none'}
              onChange={e => {
                const val = e.target.value
                handleChange('usb', val !== 'none')
                handleChange('usbVersion', val !== 'none' ? val : undefined)
              }}
              style={{ flex: 1, padding: '6px 10px', borderRadius: '20px', border: '1px solid var(--border-light)', background: 'var(--bg-panel-solid)' }}
            >
              {usbOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="setting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <label style={{ fontWeight: 500, width: '120px' }}>Ethernet:</label>
            <input
              type="checkbox"
              checked={editedDevice.ethernet || false}
              onChange={e => handleEthernetChange(e.target.checked)}
              style={{ width: 'auto', margin: 0 }}
            />
          </div>
          {(editedDevice.type === 'matrix') && (
            <>
              <div className="setting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <label style={{ fontWeight: 500, width: '120px' }}>Входы:</label>
                <input
                  type="number"
                  value={editedDevice.inputs || 4}
                  onChange={e => handleChange('inputs', parseInt(e.target.value))}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: '20px', border: '1px solid var(--border-light)', background: 'var(--bg-panel-solid)' }}
                />
              </div>
              <div className="setting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <label style={{ fontWeight: 500, width: '120px' }}>Выходы:</label>
                <input
                  type="number"
                  value={editedDevice.outputs || 4}
                  onChange={e => handleChange('outputs', parseInt(e.target.value))}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: '20px', border: '1px solid var(--border-light)', background: 'var(--bg-panel-solid)' }}
                />
              </div>
            </>
          )}
        </div>
        <div className="modal-buttons" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-primary" onClick={handleSave}>Сохранить</button>
          <button className="btn-secondary" onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  )
}
