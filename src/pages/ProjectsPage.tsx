import { useEffect } from 'react'
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
  const location = useLocation()
  const navigate = useNavigate()

  // Парсим id из хеша
  const hash = location.hash
  const match = hash.match(/[?&]id=([^&]+)/)
  const projectId = match ? match[1] : null
  const selectedProject = projectId ? projects.find(p => p.id === projectId) : null

  useEffect(() => {
    const init = async () => {
      await initDemoData()
      await loadProjects()
    }
    init()
  }, [])

  const handleSelectProject = (project: any) => {
    navigate(`/projects?id=${project.id}`, { replace: true })
  }

  const handleBack = () => {
    navigate('/projects', { replace: true })
  }

  const handleCreate = async (projectData: any) => {
    await addProject(projectData)
    // после создания не переходим в детали, остаёмся в списке
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
            <button className="btn-primary" onClick={() => {
              // Показываем модалку создания проекта
              // нужно будет добавить состояние для модалки
              const modal = document.querySelector('#createProjectModal') as any;
              if (modal) modal.style.display = 'flex';
            }}>
              <i className="fas fa-plus"></i> Новый проект
            </button>
          )}
        </div>
        <ProjectList projects={projects} onSelectProject={handleSelectProject} />
      </div>
      <CreateProjectModal
        isOpen={false}
        onClose={() => {}}
        onCreate={handleCreate}
      />
    </div>
  )
}
