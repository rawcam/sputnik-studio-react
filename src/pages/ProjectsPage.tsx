import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
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
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const init = async () => {
      await initDemoData()
      await loadProjects()
    }
    init()
  }, [])

  // Читаем id из hash при загрузке или изменении location
  useEffect(() => {
    const hash = location.hash
    const match = hash.match(/[?&]id=([^&]+)/)
    if (match) {
      const projectId = match[1]
      const project = projects.find(p => p.id === projectId)
      if (project) {
        setSelectedProject(project)
      } else {
        // Если проект ещё не загрузился, но id есть – можно подождать, но сейчас просто очистим
        setSelectedProject(null)
      }
    } else {
      setSelectedProject(null)
    }
  }, [location, projects])

  const handleSelectProject = (project: any) => {
    setSelectedProject(project)
    // Обновляем URL, добавляя параметр id
    navigate(`/projects?id=${project.id}`, { replace: true })
  }

  const handleBack = () => {
    setSelectedProject(null)
    // Очищаем параметр id в URL
    navigate('/projects', { replace: true })
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
