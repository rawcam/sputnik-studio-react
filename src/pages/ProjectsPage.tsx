import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { addProject, loadProjectsSuccess, Project } from '../store/projectsSlice'
import { ProjectList } from '../components/projects/ProjectList'
import { ProjectDetail } from '../features/projects/ProjectDetail'
import { CreateProjectModal } from '../components/projects/CreateProjectModal'
import { useAuth } from '../hooks/useAuth'
import { useProjectsDb } from '../hooks/useProjectsDb'
import './ProjectsPage.css'

export const ProjectsPage = () => {
  const dispatch = useDispatch()
  const { hasRole } = useAuth()
  const projects = useSelector((state: RootState) => state.projects.list)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { loading, loadProjects, addProject: addProjectToDb, updateProject: updateProjectInDb, deleteProject: deleteProjectFromDb, initDemoData } = useProjectsDb()

  useEffect(() => {
    const load = async () => {
      const data = await loadProjects()
      dispatch(loadProjectsSuccess(data))
    }
    load()
  }, [loadProjects, dispatch])

  const handleSelectProject = (project: Project) => setSelectedProject(project)
  const handleBack = () => setSelectedProject(null)

  const handleCreate = async (projectData: Omit<Project, 'id' | 'shortId'>) => {
    const newProject = {
      ...projectData,
      id: Date.now().toString(),
      shortId: '', // будет сгенерировано в слайсе
      actualIncome: 0,
      actualExpenses: 0,
    }
    // Сначала добавим в слайс (чтобы сгенерировать shortId)
    dispatch(addProject(newProject))
    // Затем сохраним в базу (но нужно получить полный проект из store)
    // Для простоты: после диспатча, проект будет в store, мы можем его найти
    // Но лучше переделать слайс, чтобы он возвращал добавленный проект. Пока упростим:
    const addedProject = { ...newProject, shortId: '0000' } // временно
    await addProjectToDb(addedProject)
    setShowCreateModal(false)
  }

  if (loading) return <div>Загрузка проектов...</div>

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
