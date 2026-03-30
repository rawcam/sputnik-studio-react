import { VideoSection } from '../features/video/VideoSection'
import { NetworkSection } from '../features/network/NetworkSection'
import { LedSection } from '../features/led/LedSection'
import { SoundSection } from '../features/sound/SoundSection'
import { VcSection } from '../features/vc/VcSection'
import { ErgoSection } from '../features/ergo/ErgoSection'
import { PowerSection } from '../features/power/PowerSection'
import { TractsSection } from '../features/tracts/TractsSection'
import { NetworkStatsSection } from '../features/network/NetworkStatsSection'
import { PowerStatsSection } from '../features/power/PowerStatsSection'
import { ManageSection } from '../features/manage/ManageSection'

export interface SidebarModule {
  id: string
  title: string
  icon: string
  component: React.ComponentType
}

export const sidebarModules: SidebarModule[] = [
  { id: 'video', title: 'VIDEO', icon: 'fa-video', component: VideoSection },
  { id: 'network', title: 'NETWORK', icon: 'fa-network-wired', component: NetworkSection },
  { id: 'led', title: 'LED', icon: 'fa-border-all', component: LedSection },
  { id: 'sound', title: 'SOUND', icon: 'fa-headphones', component: SoundSection },
  { id: 'vc', title: 'VC (ВКС)', icon: 'fa-chalkboard', component: VcSection },
  { id: 'ergo', title: 'Эргономика ЭКП', icon: 'fa-chalkboard-user', component: ErgoSection },
  { id: 'tracts', title: 'TRACTS', icon: 'fa-road', component: TractsSection },
  { id: 'networkStats', title: 'СЕТЬ', icon: 'fa-chart-line', component: NetworkStatsSection },
  { id: 'powerStats', title: 'ПИТАНИЕ', icon: 'fa-bolt', component: PowerStatsSection },
  { id: 'power', title: 'ЭНЕРГИЯ', icon: 'fa-bolt', component: PowerSection },
  { id: 'manage', title: 'УПРАВЛЕНИЕ', icon: 'fa-cog', component: ManageSection },
]
