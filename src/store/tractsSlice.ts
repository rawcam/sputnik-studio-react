// ... (остальной код слайса без изменений)

// Внутри createSlice добавим обновлённый редьюсер updateDeviceInTract
updateDeviceInTract: (state, action: PayloadAction<{ tractId: string; deviceId: string; updates: Partial<TractDevice> }>) => {
  const tract = state.tracts.find(t => t.id === action.payload.tractId)
  if (!tract) return
  const allDevices = [...tract.sourceDevices, ...tract.matrixDevices, ...tract.sinkDevices]
  const device = allDevices.find(d => d.id === action.payload.deviceId)
  if (!device) return

  // Сохраняем старое значение ethernet
  const oldEthernet = device.ethernet
  // Применяем обновления
  Object.assign(device, action.payload.updates)

  // Если Ethernet включился, а раньше был выключен
  if (device.ethernet && !oldEthernet) {
    // Ищем подходящий коммутатор
    let targetSwitch: TractDevice | undefined
    for (const sw of tract.matrixDevices) {
      if (!sw.ports) continue
      const freePorts = sw.ports - (sw.usedPorts?.length || 0)
      if (freePorts === 0) continue
      if (device.poeEnabled && (!sw.poeBudget || (sw.poeBudget - (sw.usedPoE || 0) < (device.poePower || 0)))) continue
      targetSwitch = sw
      break
    }
    if (targetSwitch) {
      // Назначаем первый свободный порт
      let newPort = 1
      const used = new Set(targetSwitch.usedPorts || [])
      while (used.has(newPort)) newPort++
      targetSwitch.usedPorts = [...(targetSwitch.usedPorts || []), newPort]
      device.attachedSwitchId = targetSwitch.id
      device.attachedPortNumber = newPort
      if (device.poeEnabled) {
        targetSwitch.usedPoE = (targetSwitch.usedPoE || 0) + (device.poePower || 0)
      }
    } else {
      // Если нет подходящего коммутатора, отключаем Ethernet
      device.ethernet = false
      device.attachedSwitchId = undefined
      device.attachedPortNumber = undefined
      console.warn('Нет доступного коммутатора для подключения устройства')
    }
  }
  // Если Ethernet отключился, освобождаем порт и PoE
  else if (!device.ethernet && oldEthernet && device.attachedSwitchId) {
    const sw = tract.matrixDevices.find(s => s.id === device.attachedSwitchId)
    if (sw) {
      if (device.attachedPortNumber) {
        sw.usedPorts = sw.usedPorts?.filter(p => p !== device.attachedPortNumber) || []
      }
      if (device.poeEnabled) {
        sw.usedPoE = (sw.usedPoE || 0) - (device.poePower || 0)
      }
    }
    device.attachedSwitchId = undefined
    device.attachedPortNumber = undefined
  }
},
