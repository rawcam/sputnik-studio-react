import { db } from '../db'
import { store } from '../store'
import { setProjects, seedDemoProjects } from '../store/projectsSlice'
import { setTracts } from '../store/tractsSlice'
import { setCompanyExpenses } from '../store/companyExpensesSlice'
import { setServiceVisits } from '../store/serviceVisitsSlice'

// Экспорт всех данных в JSON-файл
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

// Импорт из JSON-файла
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

// Сохранение в localStorage (сохраняем все данные, кроме auth/theme/ui)
export const saveToLocalStorage = async () => {
  const projects = await db.projects.toArray()
  const tracts = store.getState().tracts.tracts
  const companyExpenses = await db.companyExpenses.toArray()
  const serviceVisits = await db.serviceVisits.toArray()
  const data = { projects, tracts, companyExpenses, serviceVisits }
  localStorage.setItem('sputnik_backup', JSON.stringify(data))
  alert('Сохранено в браузере')
}

// Загрузка из localStorage (восстановление)
export const loadFromLocalStorage = async () => {
  const raw = localStorage.getItem('sputnik_backup')
  if (!raw) {
    alert('Нет сохранённых данных')
    return
  }
  const data = JSON.parse(raw)
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
  alert('Данные восстановлены')
}

// Сброс проекта (очистка всех данных, демо-проекты)
export const resetProject = async () => {
  if (!confirm('Сбросить проект? Все данные будут удалены.') ) return
  // Очищаем IndexedDB
  await db.projects.clear()
  await db.companyExpenses.clear()
  await db.serviceVisits.clear()
  // Очищаем localStorage (кроме темы и настроек сайдбара)
  localStorage.removeItem('sputnik_backup')
  // Создаём демо-проекты
  const demos = seedDemoProjects()
  for (const demo of demos) {
    const existingIds = (await db.projects.toArray()).map(p => p.shortId)
    const shortId = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const newId = Date.now().toString()
    const newProject = {
      ...demo,
      id: newId,
      shortId,
      actualIncome: demo.actualIncome ?? 0,
      actualExpenses: demo.actualExpenses ?? 0,
      roadmapPlanned: demo.roadmapPlanned ?? [],
      roadmapActual: demo.roadmapActual ?? [],
    }
    await db.projects.add(newProject)
  }
  // Обновляем Redux
  const projects = await db.projects.toArray()
  store.dispatch(setProjects(projects))
  store.dispatch(setTracts([])) // тракты сбрасываем
  store.dispatch(setCompanyExpenses([]))
  store.dispatch(setServiceVisits([]))
  alert('Проект сброшен, загружены демо-данные')
}
