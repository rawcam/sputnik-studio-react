import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { RootState } from '../store'
import { ProjectList } from '../components/projects/ProjectList'
import { ProjectDetail } from '../features/projects/ProjectDetail'
import { CreateProjectModal } from '../components/projects/CreateProjectModal'
import { useAuth } from '../hooks/useAuth'
import { useProjectsDb } from '../hooks/useProjectsDb'
import './ProjectsPage.css'

export const ProjectsPage = () => {
  const { hasRole } = useAuth()
  const { loadProjects, addProject, initDemoData } = useProjectsDb()
  const projects = useSelector((state: RootState) => state.projects.list)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const init = async () => {
      await initDemoData()
      await loadProjects()
    }
    init()
  }, [])

  // Проверяем параметр id в URL и открываем детали, если он есть
  useEffect(() => {
    const projectId = searchParams.get('id')
    if (projectId) {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        setSelectedProject(project)
      } else {
        // Если проект не найден (например, ещё не загрузился), можно очистить параметр
        // но здесь мы оставим как есть
      }
    }
  }, [searchParams, projects])

  const handleSelectProject = (project: any) => setSelectedProject(project)
  const handleBack = () => {
    setSelectedProject(null)
    // Очищаем параметр id в URL, чтобы вернуться к списку
    window.history.replaceState({}, '', '/projects')
  }
  const handleCreate = async (projectData: any) => {
    await addProject(projectData)
    setShowCreateModal(false)
  }

  if (selectedProject) {
    return <ProjectDetail project={selectedProject} onBack={handleBack} />
  }

  return (
    <div className="projects-page">
      <div className="dashboard-wrapper">
        <div className="projects-header">
          <h2>УПРАВЛЕНИЕ ПРОЕКТАМИ</h2>
          {(hasRole('director') || hasRole('pm')) && (
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <i className="fas fa-plus"></i> Новый проект
            </button>
          )}
        </div>
        <ProjectList projects={projects} onSelectProject={handleSelectProject} />
      </div>
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}
