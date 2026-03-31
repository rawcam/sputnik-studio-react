import { db } from '../db'
import { store } from '../store'
import { setProjects } from '../store/projectsSlice'
import { setTracts } from '../store/tractsSlice'
import { setCompanyExpenses } from '../store/companyExpensesSlice'
import { setServiceVisits } from '../store/serviceVisitsSlice'

export const exportToJson = async () => {
  const projects = await db.projects.toArray()
  const tracts = store.getState().tracts.tracts
  const companyExpenses = await db.companyExpenses.toArray()
  const serviceVisits = await db.serviceVisits.toArray()
  const data = { projects, tracts, companyExpenses, serviceVisits, version: '8.0' }
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sputnik-backup-${new Date().toISOString().slice(0,19)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export const importFromJson = async (file: File) => {
  const text = await file.text()
  const data = JSON.parse(text)
  if (data.projects) {
    await db.projects.clear()
    await db.projects.bulkAdd(data.projects)
    store.dispatch(setProjects(data.projects))
  }
  if (data.tracts) store.dispatch(setTracts(data.tracts))
  if (data.companyExpenses) {
    await db.companyExpenses.clear()
    await db.companyExpenses.bulkAdd(data.companyExpenses)
    store.dispatch(setCompanyExpenses(data.companyExpenses))
  }
  if (data.serviceVisits) {
    await db.serviceVisits.clear()
    await db.serviceVisits.bulkAdd(data.serviceVisits)
    store.dispatch(setServiceVisits(data.serviceVisits))
  }
  alert('Импорт выполнен')
}
