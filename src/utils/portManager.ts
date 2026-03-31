export class PortManager {
  switches: any[]

  constructor(switches: any[] = []) {
    this.switches = switches
  }

  setSwitches(switches: any[]) {
    this.switches = switches
  }

  findAvailableSwitch(requirePoE = false) {
    for (const sw of this.switches) {
      if (sw.type !== 'networkSwitch') continue
      const freePort = sw.ports.find((p: any) => p.deviceId === null)
      if (!freePort) continue
      if (requirePoE && (!sw.poeBudget || sw.poeBudget <= 0)) continue
      return { sw, portNumber: freePort.number }
    }
    return null
  }

  assign(device: any) {
    if (device.attachedSwitchId) this.release(device.id)
    if (!device.ethernet && !device.poeEnabled) return false
    const requirePoE = device.poeEnabled === true
    const result = this.findAvailableSwitch(requirePoE)
    if (!result) {
      alert(`Нет свободных портов${requirePoE ? ' и/или недостаточно PoE-бюджета' : ''} для устройства ${device.name}.`)
      return false
    }
    const { sw, portNumber } = result
    const port = sw.ports.find((p: any) => p.number === portNumber)
    if (port) port.deviceId = device.id
    device.attachedSwitchId = sw.id
    device.attachedPortNumber = portNumber
    return true
  }

  release(deviceId: string) {
    for (const sw of this.switches) {
      const port = sw.ports.find((p: any) => p.deviceId === deviceId)
      if (port) {
        port.deviceId = null
        return true
      }
    }
    return false
  }

  getStats() {
    let totalPorts = 0, usedPorts = 0
    for (const sw of this.switches) {
      if (sw.type !== 'networkSwitch') continue
      totalPorts += sw.ports.length
      usedPorts += sw.ports.filter((p: any) => p.deviceId !== null).length
    }
    return { totalPorts, usedPorts }
  }
}
