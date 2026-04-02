import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Project } from '../../store/projectsSlice'

interface ProjectsCarouselProps {
  projects: Project[]
  onSelectProject?: (project: Project) => void
}

export const ProjectsCarousel: React.FC<ProjectsCarouselProps> = ({ projects, onSelectProject }) => {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleProjectClick = (project: Project) => {
    if (onSelectProject) {
      onSelectProject(project)
    } else {
      navigate(`/projects?id=${project.id}`)
    }
  }

  if (projects.length === 0) {
    return <div className="dashboard-empty">Нет активных проектов</div>
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'presale': return '#d97a0c'
      case 'design': return '#2c6e9e'
      case 'ready': return '#6aa9d9'
      case 'construction': return '#2a7f49'
      case 'done': return '#6c7e9e'
      default: return 'var(--text-muted)'
    }
  }

  return (
    <div className="dashboard-scroll-container" ref={scrollRef}>
      {projects.map(project => (
        <div 
          key={project.id} 
          className="dashboard-project-card" 
          onClick={() => handleProjectClick(project)}
        >
          <div className="dashboard-project-title">
            <span>{project.name}</span>
            <span className="dashboard-project-status" style={{ background: getStatusColor(project.status), color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem' }}>
              {project.status === 'presale' ? 'пресейл' : 
               project.status === 'design' ? 'проект' :
               project.status === 'ready' ? 'готов' :
               project.status === 'construction' ? 'стройка' : 'завершён'}
            </span>
          </div>
          <div className="dashboard-project-stats">
            <span>{formatCurrency(project.contractAmount)}</span>
            <span>{project.engineer} / {project.projectManager}</span>
          </div>
          <div className="dashboard-project-progress">
            <div className="dashboard-progress-bg">
              <div className="dashboard-progress-fill normal" style={{ width: `${project.progress}%` }}></div>
            </div>
            <div style={{ fontSize: '0.65rem', marginTop: '4px', textAlign: 'right' }}>прогресс {project.progress}%</div>
          </div>
        </div>
      ))}
    </div>
  )
}
