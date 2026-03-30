import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { addTract, updateTract, deleteTract, setActiveTract, setViewMode, Tract, TractDevice } from '../../store/tractsSlice'
import { AddDeviceModal } from './AddDeviceModal'

export const ActiveTract: React.FC = () => {
  const dispatch = useDispatch()
  const tracts = useSelector((state: RootState) => state.tracts.tracts)
  const activeTractId = useSelector((state: RootState) => state.tracts.activeTractId)
  const activeTract = tracts.find(t => t.id === activeTractId) || null
  const [showModal, setShowModal] = useState(false)

  const handleNewTract = () => {
    const newId = Date.now().toString()
    const newTract: Tract = {
      id: newId,
      name: `Тракт ${tracts.length + 1}`,
      sourceDevices: [],
      sinkDevices: [],
      totalLatency: 0,
      totalPower: 0,
      totalBitrate: 0,
    }
    dispatch(addTract(newTract))
    dispatch(setActiveTract(newId))
  }

  const handleAddDevice = (device: any) => {
    if (!activeTract) return
    const newDevice: TractDevice = {
      id: Date.now().toString(),
      type: device.type,
      modelName: device.name,
      latency: device.latency || 0,
      poeEnabled: device.poe || false,
      powerW: device.powerW || 0,
      shortName: device.shortPrefix + (activeTract.sourceDevices.length + activeTract.sinkDevices.length + 1),
      attachedSwitchId: undefined,
      attachedPortNumber: undefined,
      ethernet: device.hasNetwork || false,
    }
    const updatedTract = {
      ...activeTract,
      sourceDevices: [...activeTract.sourceDevices, newDevice],
    }
    dispatch(updateTract(updatedTract))
    setShowModal(false)
  }

  const handleDeleteDevice = (deviceId: string) => {
    if (!activeTract) return
    const updatedTract = {
      ...activeTract,
      sourceDevices: activeTract.sourceDevices.filter(d => d.id !== deviceId),
      sinkDevices: activeTract.sinkDevices.filter(d => d.id !== deviceId),
    }
    dispatch(updateTract(updatedTract))
  }

  const handleBackToAll = () => {
    dispatch(setViewMode('all'))
  }

  if (!activeTract) {
    return (
      <div className="active-tract-container">
        <button className="btn-primary" onClick={handleNewTract}>
          <i className="fas fa-plus"></i> Новый тракт
        </button>
        <div className="empty-state">
          <i className="fas fa-road"></i>
          <h3>Нет активного тракта</h3>
          <p>Создайте новый тракт, чтобы начать работу</p>
          <button className="btn-primary" onClick={handleNewTract}>
            <i className="fas fa-plus"></i> Новый тракт
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="active-tract-container">
      <div className="tract-header">
        <h2>{activeTract.name}</h2>
        <div className="tract-actions">
          <button className="btn-secondary" onClick={handleBackToAll}>Все тракты</button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus"></i> Добавить устройство
          </button>
          <button className="btn-danger" onClick={() => {
            if (confirm('Удалить тракт?')) {
              dispatch(deleteTract(activeTract.id))
              dispatch(setActiveTract(null))
            }
          }}>
            <i className="fas fa-trash-alt"></i> Удалить тракт
          </button>
        </div>
      </div>

      <div className="tract-stats">
        <div className="stat-card">
          <div className="stat-label">Задержка</div>
          <div className="stat-value">{activeTract.totalLatency} мс</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Мощность</div>
          <div className="stat-value">{activeTract.totalPower} Вт</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Битрейт</div>
          <div className="stat-value">{activeTract.totalBitrate} Мбит/с</div>
        </div>
      </div>

      <div className="tract-devices">
        <h3>Устройства</h3>
        <div className="devices-list">
          {activeTract.sourceDevices.map(device => (
            <div key={device.id} className="device-item">
              <span>{device.modelName}</span>
              <button className="btn-small" onClick={() => handleDeleteDevice(device.id)}>
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))}
        </div>
      </div>

      <AddDeviceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddDevice}
      />
    </div>
  )
}
