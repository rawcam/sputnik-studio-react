import React from 'react'
import { Project } from '../../store/projectsSlice'

interface ProjectDetailProps {
  project: Project
  onBack: () => void
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  return (
    <div className="project-detail-card">
      <button className="btn-secondary" onClick={onBack}>
        <i className="fas fa-arrow-left"></i> Назад
      </button>
      <h2>{project.name}</h2>
      <p>Бюджет: {project.budget} руб.</p>
      <p>Инженер: {project.engineer}</p>
      <p>РП: {project.projectManager}</p>
      <p>Статус: {project.status}</p>
      <p>Прогресс: {project.progress}%</p>
    </div>
  )
}
