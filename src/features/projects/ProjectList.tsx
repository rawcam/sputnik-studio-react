import React from 'react'
import { Project } from '../../store/projectsSlice'
import { ProjectCard } from '../../components/projects/ProjectCard'

interface ProjectListProps {
  projects: Project[]
  onSelectProject: (id: string) => void
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject }) => {
  return (
    <div className="projects-list">
      {projects.length === 0 && (
        <div className="empty-state">Нет проектов. Нажмите "Новый проект".</div>
      )}
      <div className="projects-grid">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => onSelectProject(project.id)}
          />
        ))}
      </div>
    </div>
  )
}
