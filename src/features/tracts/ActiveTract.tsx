import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { addTract, setActiveTract, updateTract, deleteTract } from '../../store/tractsSlice'
import { AddDeviceModal } from './AddDeviceModal'
import { TractDeviceItem } from './TractDeviceItem'
import { modelDB } from '../../utils/modelDB'
import { PortManager } from '../../utils/portManager'

export const ActiveTract: React.FC = () => {
  const dispatch = useDispatch()
  const tracts = useSelector((state: RootState) => state.tracts.tracts)
  const activeTractId = useSelector((state: RootState) => state.tracts.activeTractId)
  const activeTract = tracts.find(t => t.id === activeTractId)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deviceType, setDeviceType] = useState<'source' | 'tx' | 'rx' | 'matrix' | 'networkSwitch' | 'splitter' | 'switch2x1' | 'ledProc' | 'display' | 'dante'>('source')
  const [side, setSide] = useState<'source' | 'sink'>('source')

  const handleNewTract = () => {
    const newId = Date.now().toString()
    const newTract = {
      id: newId,
      name: `Тракт ${tracts.length + 1}`,
      sourceDevices: [],
      sinkDevices: [],
      totalLatency: 0,
      totalPower: 0,
      totalBitrate: 0,
      switches: []
    }
    dispatch(addTract(newTract))
    dispatch(setActiveTract(newId))
  }

  const handleAddDevice = (model: any) => {
    if (!activeTract) return

    // Создаём устройство
    const newDevice = {
      id: Date.now().toString(),
      type: deviceType,
      modelName: model.name,
      latency: model.latency ?? 0,
      poeEnabled: model.poe ?? false,
      powerW: model.powerW ?? 0,
      shortName: '',
      ethernet: model.hasNetwork ?? false,
      attachedSwitchId: null,
      attachedPortNumber: null,
      // Специфичные поля для разных типов
      ...(model.bitrateFactor ? { bitrateFactor: model.bitrateFactor } : {}),
      ...(model.ports ? { ports: model.ports, speed: model.speed, switchingLatency: model.switchingLatency, poeBudget: model.poeBudget } : {}),
    }

    const updatedTract = { ...activeTract }
    if (side === 'source') {
      updatedTract.sourceDevices = [...updatedTract.sourceDevices, newDevice]
    } else {
      updatedTract.sinkDevices = [...updatedTract.sinkDevices, newDevice]
    }

    // Пересчёт
    const recalc = recalcTract(updatedTract)
    dispatch(updateTract(recalc))
    setShowAddModal(false)
  }

  const recalcTract = (tract: any) => {
    const allDevices = [...tract.sourceDevices, ...tract.sinkDevices]
    const totalLatency = allDevices.reduce((sum, d) => sum + (d.latency ?? 0), 0)
    const totalPower = allDevices.reduce((sum, d) => sum + (d.powerW ?? 0), 0)

    // Битрейт: суммируем битрейт всех устройств (пока просто заглушка)
    const totalBitrate = allDevices.reduce((sum, d) => sum + (d.bitrateFactor ? 1000 * d.bitrateFactor : 0), 0)

    // Порты (пока просто передаём)
    const switches = tract.switches || []

    return { ...tract, totalLatency, totalPower, totalBitrate, switches }
  }

  const handleDeleteDevice = (deviceId: string, side: 'source' | 'sink') => {
    if (!activeTract) return
    const updatedTract = { ...activeTract }
    if (side === 'source') {
      updatedTract.sourceDevices = updatedTract.sourceDevices.filter(d => d.id !== deviceId)
    } else {
      updatedTract.sinkDevices = updatedTract.sinkDevices.filter(d => d.id !== deviceId)
    }
    const recalc = recalcTract(updatedTract)
    dispatch(updateTract(recalc))
  }

  const handleDeleteTract = () => {
    if (activeTract && confirm('Удалить тракт?')) {
      dispatch(deleteTract(activeTract.id))
    }
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
        </div>
      </div>
    )
  }

  return (
    <div className="active-tract-container">
      <div className="tract-header">
        <h3>{activeTract.name}</h3>
        <div className="tract-actions">
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="fas fa-plus"></i> Добавить устройство
          </button>
          <button className="btn-danger" onClick={handleDeleteTract}>
            <i className="fas fa-trash"></i> Удалить тракт
          </button>
        </div>
      </div>

      <div className="tract-stats">
        <div className="stat-item">
          <span className="stat-label">Суммарная задержка</span>
          <span className="stat-value">{activeTract.totalLatency} мс</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Мощность</span>
          <span className="stat-value">{activeTract.totalPower} Вт</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Битрейт</span>
          <span className="stat-value">{activeTract.totalBitrate} Мбит/с</span>
        </div>
      </div>

      <div className="tract-devices">
        <div className="devices-column">
          <h4>Источники</h4>
          {activeTract.sourceDevices.length === 0 && <p>Нет устройств</p>}
          {activeTract.sourceDevices.map(device => (
            <TractDeviceItem
              key={device.id}
              device={device}
              onDelete={() => handleDeleteDevice(device.id, 'source')}
            />
          ))}
        </div>
        <div className="devices-column">
          <h4>Приёмники</h4>
          {activeTract.sinkDevices.length === 0 && <p>Нет устройств</p>}
          {activeTract.sinkDevices.map(device => (
            <TractDeviceItem
              key={device.id}
              device={device}
              onDelete={() => handleDeleteDevice(device.id, 'sink')}
            />
          ))}
        </div>
      </div>

      <AddDeviceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddDevice}
        deviceType={deviceType}
        setDeviceType={setDeviceType}
        side={side}
        setSide={setSide}
      />
    </div>
  )
}
