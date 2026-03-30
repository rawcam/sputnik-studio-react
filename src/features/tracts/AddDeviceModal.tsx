import React, { useState, useEffect } from 'react'
import { modelDB } from '../../utils/modelDB'

interface AddDeviceModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (model: any) => void
  deviceType: string
  setDeviceType: (type: any) => void
  side: 'source' | 'sink'
  setSide: (side: 'source' | 'sink') => void
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  deviceType,
  setDeviceType,
  side,
  setSide
}) => {
  const [models, setModels] = useState<any[]>([])
  const [selectedModel, setSelectedModel] = useState<any>(null)

  useEffect(() => {
    if (deviceType && modelDB[deviceType]) {
      setModels(modelDB[deviceType])
      if (modelDB[deviceType].length > 0) {
        setSelectedModel(modelDB[deviceType][0])
      }
    }
  }, [deviceType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedModel) {
      onAdd(selectedModel)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <span className="modal-close" onClick={onClose}>×</span>
        <h3>Добавить устройство</h3>
        <form onSubmit={handleSubmit}>
          <div className="setting">
            <label>Тип устройства:</label>
            <select value={deviceType} onChange={e => setDeviceType(e.target.value)}>
              <option value="source">Источник</option>
              <option value="tx">Передатчик (TX)</option>
              <option value="rx">Приёмник (RX)</option>
              <option value="matrix">Матрица</option>
              <option value="networkSwitch">Коммутатор</option>
              <option value="splitter">Сплиттер</option>
              <option value="switch2x1">Переключатель 2x1</option>
              <option value="ledProc">LED-процессор</option>
              <option value="display">Дисплей</option>
              <option value="dante">Dante-устройство</option>
            </select>
          </div>
          <div className="setting">
            <label>Модель:</label>
            <select value={selectedModel?.name || ''} onChange={e => {
              const model = models.find(m => m.name === e.target.value)
              setSelectedModel(model)
            }}>
              {models.map(m => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="setting">
            <label>Размещение:</label>
            <select value={side} onChange={e => setSide(e.target.value as any)}>
              <option value="source">Источник</option>
              <option value="sink">Приёмник</option>
            </select>
          </div>
          <div className="modal-buttons">
            <button type="submit" className="btn-primary">Добавить</button>
            <button type="button" className="btn-secondary" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  )
}
