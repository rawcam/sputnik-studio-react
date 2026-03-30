import { useCallback, useEffect, useState } from 'react'
import { Project } from '../store/projectsSlice'
import { db } from '../db'

export const useProjectsDb = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadProjects = useCallback(async (): Promise<Project[]> => {
    try {
      const projects = await db.projects.toArray()
      return projects
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      return []
    }
  }, [])

  const saveProjects = useCallback(async (projects: Project[]) => {
    try {
      await db.projects.bulkPut(projects)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    }
  }, [])

  const addProject = useCallback(async (project: Project) => {
    try {
      await db.projects.add(project)
      return project
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      throw err
    }
  }, [])

  const updateProject = useCallback(async (project: Project) => {
    try {
      await db.projects.put(project)
      return project
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      throw err
    }
  }, [])

  const deleteProject = useCallback(async (id: string) => {
    try {
      await db.projects.delete(id)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      throw err
    }
  }, [])

  const initDemoData = useCallback(async () => {
    const count = await db.projects.count()
    if (count === 0) {
      const today = new Date().toISOString().slice(0,10)
      const nextWeek = new Date(Date.now() + 7*86400000).toISOString().slice(0,10)
      const demoProjects: Project[] = [
        {
          id: '1',
          shortId: '1001',
          category: 'new',
          name: 'Конференц-зал 1',
          status: 'design',
          statusStartDate: today,
          nextStatus: 'ready',
          nextStatusDate: nextWeek,
          progress: 30,
          startDate: '2026-03-01',
          engineer: 'Иванов И.И.',
          projectManager: 'Петров П.П.',
          priority: false,
          meetings: [{ date: '2026-03-10', subject: 'Согласование ТЗ' }],
          purchases: [{ name: 'LED-экран', status: 'ordered', date: '2026-03-15' }],
          contractAmount: 1250000,
          incomeSchedule: [],
          expenseSchedule: [],
          actualIncome: 0,
          actualExpenses: 0,
          serviceVisits: [],
        },
        {
          id: '2',
          shortId: '2002',
          category: 'modernization',
          name: 'Ситуационный центр',
          status: 'presale',
          statusStartDate: today,
          nextStatus: 'design',
          nextStatusDate: nextWeek,
          progress: 10,
          startDate: '2026-03-25',
          engineer: 'Сидоров С.С.',
          projectManager: 'Петров П.П.',
          priority: true,
          meetings: [],
          purchases: [],
          contractAmount: 3450000,
          incomeSchedule: [],
          expenseSchedule: [],
          actualIncome: 0,
          actualExpenses: 0,
          serviceVisits: [],
        },
        {
          id: '3',
          shortId: '4003',
          category: 'service',
          name: 'Диспетчерская',
          status: 'construction',
          statusStartDate: '2026-02-15',
          nextStatus: 'done',
          nextStatusDate: '2026-04-01',
          progress: 80,
          startDate: '2026-02-01',
          engineer: 'Кузнецов К.К.',
          projectManager: 'Иванов И.И.',
          priority: false,
          meetings: [],
          purchases: [],
          contractAmount: 890000,
          incomeSchedule: [],
          expenseSchedule: [],
          actualIncome: 0,
          actualExpenses: 0,
          serviceVisits: [],
        },
      ]
      await db.projects.bulkAdd(demoProjects)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        await initDemoData()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [initDemoData])

  return {
    loading,
    error,
    loadProjects,
    saveProjects,
    addProject,
    updateProject,
    deleteProject,
    initDemoData,
  }
}
