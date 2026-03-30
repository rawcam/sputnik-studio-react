import React from 'react'
import { Project } from '../../store/projectsSlice'

interface ProjectCardProps {
  project: Project
  onClick?: (project: Project) => void
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const statusColors: Record<string, string> = {
    presale: '#f59e0b',
    design: '#3b82f6',
    ready: '#10b981',
    construction: '#8b5cf6',
    done: '#6b7280',
  }

  const categoryLabels: Record<string, string> = {
    new: 'Новый',
    modernization: 'Модернизация',
    service: 'Сервис',
    standard: 'Типовой',
    pilot: 'Пилот',
  }

  const handleClick = () => {
    onClick?.(project)
  }

  return (
    <div className="project-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="project-header">
        <div className="project-name">
          <span className="project-shortid">[{project.shortId}]</span> {project.name}
        </div>
        <div className="project-status" style={{ background: statusColors[project.status] || '#ccc' }}>
          {project.status}
        </div>
      </div>
      <div className="project-meta">
        <div><i className="fas fa-tag"></i> {categoryLabels[project.category]}</div>
        <div><i className="fas fa-ruble-sign"></i> {project.contractAmount.toLocaleString()} ₽</div>
        <div><i className="fas fa-user"></i> {project.engineer}</div>
        <div><i className="fas fa-user-tie"></i> {project.projectManager}</div>
      </div>
      <div className="project-progress-bar">
        <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
      </div>
    </div>
  )
}
