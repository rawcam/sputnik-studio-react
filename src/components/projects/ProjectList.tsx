import React from 'react'
import { Project } from '../../store/projectsSlice'
import { ProjectCard } from './ProjectCard'

interface ProjectListProps {
  projects: Project[]
  onSelectProject: (project: Project) => void
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject }) => {
  if (projects.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-folder-open"></i>
        <h3>Нет проектов</h3>
        <p>Нажмите «Новый проект», чтобы создать первый.</p>
      </div>
    )
  }

  return (
    <div className="projects-list">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} onClick={onSelectProject} />
      ))}
    </div>
  )
}
