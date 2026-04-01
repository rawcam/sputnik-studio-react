import React, { useState, useEffect } from 'react'
import { TractDevice } from '../../store/tractsSlice'

interface DeviceEditModalProps {
  isOpen: boolean
  onClose: () => void
  device: TractDevice
  onSave: (updatedDevice: TractDevice) => void
  switches?: TractDevice[] // список коммутаторов в тракте для проверки доступности
}

export const DeviceEditModal: React.FC<DeviceEditModalProps> = ({ isOpen, onClose, device, onSave, switches = [] }) => {
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
      // Если отключаем PoE, Ethernet остаётся как есть (пользователь может оставить для управления)
    } else {
      let power = 15.4
      if (val === 'true-at') power = 30
      if (val === 'true-bt') power = 60
      handleChange('poeEnabled', true)
      handleChange('poePower', power)
      // При включении PoE автоматически включаем Ethernet
      if (!editedDevice.ethernet) {
        handleChange('ethernet', true)
      }
    }
  }

  const handleEthernetChange = (checked: boolean) => {
    if (checked) {
      // Проверяем, есть ли свободный порт в каком-нибудь коммутаторе
      const hasFreePort = switches.some(sw => {
        const freePorts = (sw.ports || 0) - (sw.usedPorts?.length || 0)
        if (freePorts === 0) return false
        if (editedDevice.poeEnabled && (!sw.poeBudget || (sw.poeBudget - (sw.usedPoE || 0) < (editedDevice.poePower || 0)))) return false
        return true
      })
      if (!hasFreePort) {
        setError('Нет доступных коммутаторов с свободными портами и достаточным PoE-бюджетом')
        return
      }
      handleChange('ethernet', true)
    } else {
      // При отключении Ethernet отключаем PoE
      if (editedDevice.poeEnabled) {
        handleChange('poeEnabled', false)
        handleChange('poePower', undefined)
      }
      handleChange('ethernet', false)
      // Также сбрасываем привязку к коммутатору (будет в слайсе)
    }
  }

  const handleSave = () => {
    if (editedDevice.ethernet && switches.length === 0) {
      setError('Нет коммутаторов в тракте. Сначала добавьте коммутатор.')
      return
    }
    onSave(editedDevice)
    onClose()
  }

  useEffect(() => {
    setEditedDevice(device)
    setError(null)
  }, [device])

  const usbOptions = [
    { value: 'none', label: 'Нет' },
    { value: '2.0', label: 'USB 2.0' },
    { value: '3.0', label: 'USB 3.0' },
  ]

  if (!isOpen) return null

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content edit-device-modal" style={{ maxWidth: '450px', padding: '20px' }}>
        <span className="modal-close" onClick={onClose}>×</span>
        <h3 style={{ marginBottom: '20px' }}>Редактировать устройство</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="setting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <label style={{ fontWeight: 500, width: '100px' }}>Мощность (Вт):</label>
            <input
              type="number"
              value={editedDevice.powerW}
              onChange={e => handleChange('powerW', parseFloat(e.target.value))}
              style={{ flex: 1, padding: '6px 10px', borderRadius: '20px', border: '1px solid var(--border-light)', background: 'var(--bg-panel-solid)' }}
            />
          </div>
          <div className="setting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <label style={{ fontWeight: 500, width: '100px' }}>PoE:</label>
            <select
              value={getPoeValue()}
              onChange={e => handlePoeChange(e.target.value)}
              style={{ flex: 1, padding: '6px 10px', borderRadius: '20px', border: '1px solid var(--border-light)', background: 'var(--bg-panel-solid)' }}
            >
              {poeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="setting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <label style={{ fontWeight: 500, width: '100px' }}>USB:</label>
            <select
              value={editedDevice.usb || 'none'}
              onChange={e => handleChange('usb', e.target.value === 'none' ? undefined : e.target.value)}
              style={{ flex: 1, padding: '6px 10px', borderRadius: '20px', border: '1px solid var(--border-light)', background: 'var(--bg-panel-solid)' }}
            >
              {usbOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="setting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <label style={{ fontWeight: 500, width: '100px' }}>Ethernet:</label>
            <input
              type="checkbox"
              checked={editedDevice.ethernet || false}
              onChange={e => handleEthernetChange(e.target.checked)}
              style={{ width: 'auto', margin: 0 }}
            />
          </div>
          {error && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', textAlign: 'center' }}>{error}</div>}
        </div>
        <div className="modal-buttons" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-primary" onClick={handleSave}>Сохранить</button>
          <button className="btn-secondary" onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  )
}
