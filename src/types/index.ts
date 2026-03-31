export interface DeviceModel {
  name: string
  latency: number
  poe: boolean
  poePower?: number
  powerW: number
  icon: string
  hasNetwork: boolean
  shortPrefix: string
  bitrateFactor?: number
  inputs?: number
  outputs?: number
  ports?: number
  speed?: number
  backplane?: number
  switchingLatency?: number
  poeBudget?: number
}
