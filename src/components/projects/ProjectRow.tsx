import React from 'react'
import { Project } from '../../store/projectsSlice'

interface ProjectRowProps {
  project: Project
  onClick?: (project: Project) => void
}

export const ProjectRow: React.FC<ProjectRowProps> = ({ project, onClick }) => {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'presale': return 'пресейл'
      case 'design': return 'проект'
      case 'ready': return 'готов'
      case 'construction': return 'стройка'
      case 'done': return 'завершён'
      default: return status
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
  }

  const handleClick = () => {
    onClick?.(project)
  }

  return (
    <div className={`project-row ${project.priority ? 'priority-row' : ''}`} onClick={handleClick}>
      <div className="project-row-info">
        <div className="project-row-name">
          {project.priority && <i className="fas fa-star" style={{ color: '#f5b042', marginRight: '8px' }}></i>}
          <span className="project-shortid">{project.shortId}</span> {project.name}
          <span className="project-row-status" style={{ background: getStatusColor(project.status) }}>
            {getStatusLabel(project.status)}
          </span>
        </div>
        <div className="project-row-stats">
          <span>{formatCurrency(project.contractAmount)}</span>
          <span>{project.engineer} / {project.projectManager}</span>
        </div>
        <div className="project-row-progress">
          <div className="dashboard-progress-bg">
            <div className="dashboard-progress-fill normal" style={{ width: `${project.progress}%` }}></div>
          </div>
          <span className="project-row-percent">{project.progress}%</span>
        </div>
      </div>
    </div>
  )
}
