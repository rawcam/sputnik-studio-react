import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import {
  updateTract,
  deleteTract,
  setActiveTract,
  setViewMode,
  addDeviceToTract,
  removeDeviceFromTract,
  addTract,
  TractDevice,
} from '../../store/tractsSlice'
import { recalcTract } from '../../store/tractsSlice'
import { AddDeviceModal } from './AddDeviceModal'
import { DeviceCard } from './DeviceCard'
import { DeviceEditModal } from './DeviceEditModal'

export const ActiveTract: React.FC = () => {
  const dispatch = useDispatch()
  const tracts = useSelector((state: RootState) => state.tracts.tracts)
  const activeTractId = useSelector((state: RootState) => state.tracts.activeTractId)
  const videoSettings = useSelector((state: RootState) => state.video)
  const activeTract = tracts.find(t => t.id === activeTractId) || null
  const [showModal, setShowModal] = useState(false)
  const [modalColumn, setModalColumn] = useState<'source' | 'matrix' | 'sink'>('source')
  const [selectedDevice, setSelectedDevice] = useState<TractDevice | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (activeTract) {
      const recalculated = recalcTract(activeTract, videoSettings)
      if (
        recalculated.totalLatency !== activeTract.totalLatency ||
        recalculated.totalBitrate !== activeTract.totalBitrate ||
        recalculated.totalPower !== activeTract.totalPower
      ) {
        dispatch(updateTract(recalculated))
      }
    }
  }, [activeTract, videoSettings, dispatch])

  const handleNewTract = () => {
    const newId = Date.now().toString()
    dispatch(addTract({
      id: newId,
      name: `Тракт ${tracts.length + 1}`,
      sourceDevices: [],
      matrixDevices: [],
      sinkDevices: [],
    }))
    dispatch(setActiveTract(newId))
  }

  const handleAddDevice = (device: any, column: 'source' | 'matrix' | 'sink') => {
    if (!activeTract) return
    const allDevices = [...activeTract.sourceDevices, ...activeTract.matrixDevices, ...activeTract.sinkDevices]
    let prefix = device.shortPrefix
    if (column === 'source') prefix = device.shortPrefix || 'SRC'
    if (column === 'matrix') prefix = device.shortPrefix || 'SW'
    if (column === 'sink') prefix = device.shortPrefix || 'SNK'
    let maxNum = 0
    const regex = new RegExp(`^${prefix}(\\d+)$`)
    allDevices.forEach(d => {
      if (d.shortName && regex.test(d.shortName)) {
        const num = parseInt(d.shortName.match(regex)![1], 10)
        if (num > maxNum) maxNum = num
      }
    })
    const shortName = prefix + (maxNum + 1)

    const newDevice: TractDevice = {
      id: Date.now().toString(),
      type: device.type,
      modelName: device.name,
      latency: device.latency || 0,
      poeEnabled: false,
      poePower: device.poePower || 0,
      powerW: device.powerW || 0,
      shortName,
      ethernet: false,
      bitrateFactor: device.bitrateFactor,
      ports: device.ports,
      poeBudget: device.poeBudget,
      switchingLatency: device.switchingLatency,
      poc: device.poc || false,
      usb: device.usb || undefined,
    }
    dispatch(addDeviceToTract({ tractId: activeTract.id, device: newDevice, column }))
    setShowModal(false)
  }

  const handleDeleteDevice = (deviceId: string, column: 'source' | 'matrix' | 'sink') => {
    if (!activeTract) return
    dispatch(removeDeviceFromTract({ tractId: activeTract.id, deviceId, column }))
  }

  const handleBackToAll = () => {
    dispatch(setViewMode('all'))
  }

  const handleRename = (newName: string) => {
    if (!activeTract) return
    dispatch(updateTract({ ...activeTract, name: newName }))
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
        <div className="tract-name">
          <input
            type="text"
            value={activeTract.name}
            onChange={e => handleRename(e.target.value)}
            className="tract-name-input"
          />
        </div>
        <div className="tract-stats-summary">
          <div className="stat-badge">⏱️ {activeTract.totalLatency} мс</div>
          <div className="stat-badge">📡 {activeTract.totalBitrate} Мбит/с</div>
          <div className="stat-badge">💡 {activeTract.totalPower} Вт</div>
        </div>
        <div className="tract-actions">
          <button className="btn-secondary" onClick={handleBackToAll}>Все тракты</button>
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

      <div className="tract-columns">
        <div className="tract-column">
          <div className="column-header">📡 Начало тракта</div>
          <div className="devices-list">
            {activeTract.sourceDevices.map(device => (
              <DeviceCard
                key={device.id}
                device={device}
                onClick={() => { setSelectedDevice(device); setShowEditModal(true); }}
                onDelete={(e) => { e.stopPropagation(); handleDeleteDevice(device.id, 'source'); }}
              />
            ))}
          </div>
          <button className="add-btn" onClick={() => { setModalColumn('source'); setShowModal(true); }}>
            + Добавить устройство
          </button>
        </div>

        <div className="tract-column">
          <div className="column-header">🔄 Коммутация</div>
          <div className="devices-list">
            {activeTract.matrixDevices.map(device => (
              <DeviceCard
                key={device.id}
                device={device}
                onClick={() => { setSelectedDevice(device); setShowEditModal(true); }}
                onDelete={(e) => { e.stopPropagation(); handleDeleteDevice(device.id, 'matrix'); }}
              />
            ))}
          </div>
          <button className="add-btn" onClick={() => { setModalColumn('matrix'); setShowModal(true); }}>
            + Добавить коммутатор/матрицу
          </button>
        </div>

        <div className="tract-column">
          <div className="column-header">🖥️ Конец тракта</div>
          <div className="devices-list">
            {activeTract.sinkDevices.map(device => (
              <DeviceCard
                key={device.id}
                device={device}
                onClick={() => { setSelectedDevice(device); setShowEditModal(true); }}
                onDelete={(e) => { e.stopPropagation(); handleDeleteDevice(device.id, 'sink'); }}
              />
            ))}
          </div>
          <button className="add-btn" onClick={() => { setModalColumn('sink'); setShowModal(true); }}>
            + Добавить устройство
          </button>
        </div>
      </div>

      <AddDeviceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={(device) => handleAddDevice(device, modalColumn)}
        column={modalColumn}
      />

      // Внутри рендера, где вызывается DeviceEditModal, замените на:
          {selectedDevice && (
            <DeviceEditModal
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              device={selectedDevice}
              tractId={activeTract.id}
            />
          )}
        />
      )}
    </div>
  )
}
