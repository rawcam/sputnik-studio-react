import React, { useState } from 'react'
import { modelDB } from '../../utils/modelDB'

interface AddDeviceModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (device: any) => void
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [deviceType, setDeviceType] = useState<keyof typeof modelDB>('source')
  const [selectedModel, setSelectedModel] = useState<any>(null)

  const deviceTypes = Object.keys(modelDB) as (keyof typeof modelDB)[]

  const handleTypeChange = (type: keyof typeof modelDB) => {
    setDeviceType(type)
    setSelectedModel(modelDB[type][0] || null)
  }

  const handleAdd = () => {
    if (selectedModel) {
      onAdd({ ...selectedModel, type: deviceType })
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <span className="modal-close" onClick={onClose}>×</span>
        <h3>Добавить устройство</h3>
        <div className="setting">
          <label>Тип устройства:</label>
          <select value={deviceType} onChange={e => handleTypeChange(e.target.value as keyof typeof modelDB)}>
            {deviceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="setting">
          <label>Модель:</label>
          <select value={selectedModel?.name || ''} onChange={e => {
            const model = modelDB[deviceType].find(m => m.name === e.target.value)
            setSelectedModel(model)
          }}>
            {modelDB[deviceType].map(model => (
              <option key={model.name} value={model.name}>{model.name}</option>
            ))}
          </select>
        </div>
        <div className="modal-buttons">
          <button className="btn-primary" onClick={handleAdd}>Добавить</button>
          <button className="btn-secondary" onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  )
}
