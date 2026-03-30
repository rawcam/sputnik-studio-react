import { useDispatch } from 'react-redux'
import { setProjects, addProject, updateProject, deleteProject, Project, seedDemoProjects } from '../store/projectsSlice'
import { db } from '../db'
import { useState } from 'react'

export const useProjectsDb = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadProjects = async () => {
    setLoading(true)
    try {
      const projects = await db.projects.toArray()
      dispatch(setProjects(projects))
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const addProjectToDb = async (project: Omit<Project, 'id' | 'shortId'>) => {
    setLoading(true)
    try {
      const existing = await db.projects.toArray()
      const existingShortIds = existing.map(p => p.shortId)
      let shortId: string
      do {
        shortId = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      } while (existingShortIds.includes(shortId))
      const newId = Date.now().toString()
      const newProject: Project = {
        ...project,
        id: newId,
        shortId,
        actualIncome: project.actualIncome ?? 0,
        actualExpenses: project.actualExpenses ?? 0,
      }
      await db.projects.add(newProject)
      dispatch(addProject(newProject))
      return newProject
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProjectInDb = async (project: Project) => {
    setLoading(true)
    try {
      await db.projects.update(project.id, project)
      dispatch(updateProject(project))
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProjectFromDb = async (id: string) => {
    setLoading(true)
    try {
      await db.projects.delete(id)
      dispatch(deleteProject(id))
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const initDemoData = async () => {
    const count = await db.projects.count()
    if (count === 0) {
      const demos = seedDemoProjects()
      for (const demo of demos) {
        await addProjectToDb(demo)
      }
      await loadProjects()
    }
  }

  return {
    loading,
    error,
    loadProjects,
    addProject: addProjectToDb,
    updateProject: updateProjectInDb,   // переименовано в updateProject
    deleteProject: deleteProjectFromDb,
    initDemoData,
  }
}
