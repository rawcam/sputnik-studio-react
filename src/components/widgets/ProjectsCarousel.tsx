import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Project } from '../../store/projectsSlice'

interface ProjectsCarouselProps {
  projects: Project[]
  onSelectProject?: (project: Project) => void
}

export const ProjectsCarousel: React.FC<ProjectsCarouselProps> = ({ projects, onSelectProject }) => {
  const navigate = useNavigate()
  const carouselRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<'carousel' | 'list'>(() => {
    const saved = localStorage.getItem('projectsViewMode')
    return saved === 'list' ? 'list' : 'carousel'
  })

  useEffect(() => {
    localStorage.setItem('projectsViewMode', viewMode)
  }, [viewMode])

  const sortedProjects = [...projects].sort((a, b) => {
    if (a.priority === b.priority) return 0
    return a.priority ? -1 : 1
  })

  const handleProjectClick = (project: Project) => {
    if (onSelectProject) onSelectProject(project)
    else navigate(`/projects?id=${project.id}`)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 360
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
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

  if (projects.length === 0) {
    return <div className="dashboard-empty">Нет активных проектов</div>
  }

  return (
    <div>
      {/* Заголовок по центру, кнопки справа (сетка 3 колонки) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: '20px' }}>
        <div></div> {/* левая пустая колонка для баланса */}
        <h3 style={{ margin: 0, textAlign: 'center' }}>Активные проекты</h3>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div className="projects-view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'carousel' ? 'active' : ''}`}
              onClick={() => setViewMode('carousel')}
            >
              <i className="fas fa-images"></i> Карусель
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <i className="fas fa-list"></i> Список
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'carousel' && (
        <div className="carousel-wrapper">
          <button className="carousel-arrow prev" onClick={() => scroll('left')}>‹</button>
          <div className="carousel-container" ref={carouselRef}>
            <div className="carousel-track">
              {sortedProjects.map(project => (
                <div 
                  key={project.id} 
                  className={`carousel-card ${project.priority ? 'priority-card' : ''}`} 
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="carousel-card-title">
                    <span>
                      {project.priority && <i className="fas fa-star" style={{ color: '#f5b042', marginRight: '6px' }}></i>}
                      {project.name}
                    </span>
                    <span className="carousel-card-status" style={{ background: getStatusColor(project.status) }}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                  <div className="carousel-card-stats">
                    <span>{formatCurrency(project.contractAmount)}</span>
                    <span>{project.engineer} / {project.projectManager}</span>
                  </div>
                  <div className="carousel-card-progress">
                    <div className="dashboard-progress-bg">
                      <div className="dashboard-progress-fill normal" style={{ width: `${project.progress}%` }}></div>
                    </div>
                    <div className="carousel-card-percent">{project.progress}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="carousel-arrow next" onClick={() => scroll('right')}>›</button>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="projects-list-vertical">
          {sortedProjects.map(project => (
            <div 
              key={project.id} 
              className={`list-row ${project.priority ? 'priority-list-row' : ''}`} 
              onClick={() => handleProjectClick(project)}
            >
              <div className="list-info">
                <div className="list-name">
                  {project.priority && <i className="fas fa-star" style={{ color: '#f5b042', marginRight: '8px' }}></i>}
                  {project.name}
                  <span className="list-status" style={{ background: getStatusColor(project.status), marginLeft: '10px' }}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
                <div className="list-stats">
                  <span>{formatCurrency(project.contractAmount)}</span>
                  <span>{project.engineer} / {project.projectManager}</span>
                </div>
                <div className="list-progress">
                  <div className="dashboard-progress-bg">
                    <div className="dashboard-progress-fill normal" style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>
                <span className="list-percent">{project.progress}%</span>
              </div>
              <button 
                className="list-detail-btn" 
                onClick={(e) => { e.stopPropagation(); handleProjectClick(project); }}
              >
                Подробнее →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
