import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

  const getProjectIdFromHash = () => {
    const hash = window.location.hash
    const match = hash.match(/[?&]id=([^&]+)/)
    return match ? match[1] : null
  }

  useEffect(() => {
    const init = async () => {
      await initDemoData()
      await loadProjects()
    }
    init()
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const projectId = getProjectIdFromHash()
      if (projectId && projects.length > 0) {
        const project = projects.find(p => p.id === projectId)
        setSelectedProject(project || null)
      } else {
        setSelectedProject(null)
      }
    }
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [projects])

  const handleSelectProject = (project: any) => {
    navigate(`/projects?id=${project.id}`, { replace: true })
  }

  const handleBack = () => {
    navigate('/projects', { replace: true })
    setSelectedProject(null)
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
