export interface DeviceModel {
  name: string
  latency: number
  poe: boolean
  poePower?: number
  powerW: number
  icon: string
  hasNetwork: boolean
  shortPrefix: string
}
