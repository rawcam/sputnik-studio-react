import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { addProject, Project } from '../store/projectsSlice'
import { ProjectList } from '../components/projects/ProjectList'
import { ProjectDetail } from '../features/projects/ProjectDetail'
import { CreateProjectModal } from '../components/projects/CreateProjectModal'
import { useAuth } from '../hooks/useAuth'
import './ProjectsPage.css'

export const ProjectsPage = () => {
  const dispatch = useDispatch()
  const { hasRole } = useAuth()
  const projects = useSelector((state: RootState) => state.projects.list)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleSelectProject = (project: Project) => setSelectedProject(project)
  const handleBack = () => setSelectedProject(null)
  const handleCreate = (projectData: Omit<Project, 'id' | 'shortId'>) => {
    dispatch(addProject(projectData))
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
