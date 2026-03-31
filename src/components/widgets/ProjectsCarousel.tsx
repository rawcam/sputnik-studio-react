import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Project } from '../../store/projectsSlice'
import { ProjectCard } from '../projects/ProjectCard'

interface ProjectsCarouselProps {
  projects: Project[]
  onSelectProject?: (project: Project) => void
}

export const ProjectsCarousel: React.FC<ProjectsCarouselProps> = ({ projects, onSelectProject }) => {
  const [emblaRef] = useEmblaCarousel({ loop: false, align: 'start', slidesToScroll: 1, breakpoints: { '(min-width: 768px)': { slidesToScroll: 2 } } })

  if (projects.length === 0) {
    return <div className="empty-state">Нет активных проектов</div>
  }

  return (
    <div className="projects-carousel">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {projects.map(project => (
            <div key={project.id} className="embla__slide">
              <ProjectCard project={project} onClick={onSelectProject} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
