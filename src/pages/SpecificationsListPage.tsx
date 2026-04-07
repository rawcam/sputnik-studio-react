import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';

export const SpecificationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const specifications = useSelector((state: RootState) => state.specifications.list);
  const projects = useSelector((state: RootState) => state.projects.list);

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return '—';
    const project = projects.find(p => p.id === projectId);
    return project ? `${project.shortId} ${project.name}` : '—';
  };

  return (
    <div className="spec-page">
      <div className="spec-toolbar">
        <div className="spec-toolbar-row">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Спецификации</h1>
          <button className="spec-button spec-button-primary" onClick={() => navigate('/specification')}>
            <i className="fas fa-plus"></i> Новая спецификация
          </button>
        </div>
      </div>

      <div className="specs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {specifications.map(spec => (
          <div
            key={spec.id}
            className="spec-card"
            onClick={() => navigate(`/specification/${spec.id}`)}
            style={{ background: 'var(--spec-bg-solid)', borderRadius: '20px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--spec-border-light)' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{spec.name}</span>
              <span style={{ background: '#eef2ff', padding: '2px 10px', borderRadius: '40px', fontSize: '0.7rem', color: '#2563eb' }}>{spec.rows.filter(r => r.type === 'data').length} поз.</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--spec-text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-folder"></i> {getProjectName(spec.projectId)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--spec-text-muted)', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--spec-border-light)' }}>
              <span><i className="far fa-calendar-alt"></i> {new Date(spec.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        ))}
        {specifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--spec-text-secondary)' }}>
            <i className="fas fa-file-alt" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
            <p>Нет спецификаций. Создайте первую!</p>
          </div>
        )}
      </div>
    </div>
  );
};
