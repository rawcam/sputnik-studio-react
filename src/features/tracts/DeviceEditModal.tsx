import React, { useState } from 'react'
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

  const handleChange = (field: keyof TractDevice, value: any) => {
    setEditedDevice(prev => ({ ...prev, [field]: value }))
    setError(null)
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
              onChange={e => handleChange('ethernet', e.target.checked)}
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
