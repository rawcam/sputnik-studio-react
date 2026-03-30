import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

export const useServiceVisits = () => {
  const visits = useSelector((state: RootState) => state.serviceVisits.list)
  const projects = useSelector((state: RootState) => state.projects.list)
  const user = useSelector((state: RootState) => state.auth.user)

  // Ближайшие выезды (отсортированные по дате)
  const upcomingVisits = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return visits
      .filter(v => v.status === 'planned' && v.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [visits])

  // Фильтрация по роли
  const filteredVisits = useMemo(() => {
    if (!user) return []
    if (user.role === 'director' || user.role === 'pm') {
      // Директор и ГИП видят все выезды (ГИП – только свои проекты? пока все)
      return upcomingVisits
    }
    if (user.role === 'engineer') {
      // Инженер видит выезды, где он ответственный (поле responsible)
      return upcomingVisits.filter(v => v.responsible === user.name)
    }
    if (user.role === 'logist') {
      // Логист видит все выезды (для планирования)
      return upcomingVisits
    }
    return []
  }, [upcomingVisits, user])

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project ? `${project.name} (${project.shortId})` : 'Неизвестный проект'
  }

  return {
    visits: filteredVisits,
    upcomingVisits: filteredVisits,
    getProjectName,
  }
}
