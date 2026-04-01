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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Получаем id из хеша
  const getProjectIdFromHash = () => {
    const hash = location.hash
    const queryStart = hash.indexOf('?')
    if (queryStart === -1) return null
    const query = hash.slice(queryStart + 1)
    const params = new URLSearchParams(query)
    return params.get('id')
  }

  const projectId = getProjectIdFromHash()

  // Загружаем демо-данные и проекты при монтировании
  useEffect(() => {
    const init = async () => {
      await initDemoData()
      await loadProjects()
    }
    init()
  }, [])

  // Следим за projectId и проектами, чтобы открыть детали
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        setSelectedProject(project)
      }
    } else if (!projectId) {
      setSelectedProject(null)
    }
  }, [projectId, projects])

  const handleSelectProject = (project: any) => {
    navigate(`/projects?id=${project.id}`, { replace: true })
    // Не нужно сразу устанавливать selectedProject, так как это сделает useEffect
  }

  const handleBack = () => {
    navigate('/projects', { replace: true })
    // selectedProject очистится через useEffect
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
