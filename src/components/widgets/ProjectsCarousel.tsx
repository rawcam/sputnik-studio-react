import React, { useEffect, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Project } from '../../store/projectsSlice'
import { ProjectCard } from '../projects/ProjectCard'

interface ProjectsCarouselProps {
  projects: Project[]
  onSelectProject?: (project: Project) => void
}

export const ProjectsCarousel: React.FC<ProjectsCarouselProps> = ({ projects, onSelectProject }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 },
      '(min-width: 1280px)': { slidesToScroll: 4 },
    },
  })

  const prevBtnRef = useRef<HTMLButtonElement>(null)
  const nextBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!emblaApi) return
    const prev = prevBtnRef.current
    const next = nextBtnRef.current
    if (prev && next) {
      const onPrev = () => emblaApi.scrollPrev()
      const onNext = () => emblaApi.scrollNext()
      prev.addEventListener('click', onPrev)
      next.addEventListener('click', onNext)
      return () => {
        prev.removeEventListener('click', onPrev)
        next.removeEventListener('click', onNext)
      }
    }
  }, [emblaApi])

  if (projects.length === 0) {
    return <div className="empty-state">Нет активных проектов</div>
  }

  return (
    <div className="projects-carousel-wrapper">
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
        <button className="carousel-button carousel-button-prev" ref={prevBtnRef} aria-label="Назад">
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className="carousel-button carousel-button-next" ref={nextBtnRef} aria-label="Вперёд">
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  )
}
