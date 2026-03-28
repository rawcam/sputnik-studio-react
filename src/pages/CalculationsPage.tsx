import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { ActiveTract } from '../features/tracts/ActiveTract'
import { AllTractsView } from '../features/tracts/AllTractsView'
import './CalculationsPage.css'

export const CalculationsPage = () => {
  const viewMode = useSelector((state: RootState) => state.tracts.viewMode)

  return (
    <div className="calculations-page">
      {viewMode === 'single' ? <ActiveTract /> : <AllTractsView />}
    </div>
  )
}
