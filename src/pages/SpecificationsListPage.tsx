import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { 
  addSpecification, 
  deleteSpecification, 
  setCurrentSpecId,
  migrateFromOldStorage,
  Specification 
} from '../store/specificationsSlice';

export const SpecificationsListPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const specifications = useSelector((state: RootState) => state.specifications.list);
  const projects = useSelector((state: RootState) => state.projects.list);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSpecName, setNewSpecName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Миграция старых данных из localStorage при первом запуске
  useEffect(() => {
    dispatch(migrateFromOldStorage());
  }, [dispatch]);

  const getProjectDisplay = (projectId: string | null) => {
    if (!projectId) return '—';
    const project = projects.find(p => p.id === projectId);
    if (!project) return '—';
    return `${project.shortId} ${project.name}`;
  };

  const handleCreateSpec = () => {
    if (!newSpecName.trim()) {
      alert('Введите название спецификации');
      return;
    }
    if (!selectedProjectId) {
      alert('Выберите проект');
      return;
    }
    dispatch(addSpecification({
      name: newSpecName,
      projectId: selectedProjectId,
      rows: [],
    }));
    setShowCreateModal(false);
    setNewSpecName('');
    setSelectedProjectId('');
  };

  const handleOpenSpec = (id: string) => {
    dispatch(setCurrentSpecId(id));
    navigate(`/specification/${id}`);
  };

  const handleDeleteSpec = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Удалить спецификацию?')) {
      dispatch(deleteSpecification(id));
    }
  };

  const getItemsCount = (spec: Specification) => {
    return spec.rows.filter(row => row.type === 'data').length;
  };

  const getTotalSum = (spec: Specification) => {
    // Простой подсчёт суммы (цена * количество) для демо
    // В реальности нужно пересчитывать с учётом валют и скидок
    let sum = 0;
    for (const row of spec.rows) {
      if (row.type === 'data') {
        sum += (row.priceAfter || 0) * row.quantity;
      }
    }
    return sum.toLocaleString('ru-RU');
  };

  return (
    <div className="spec-page">
      <div className="spec-toolbar">
        <div className="spec-toolbar-row">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Спецификации</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="view-toggle" style={{ display: 'flex', gap: '8px', background: 'var(--spec-card-bg)', padding: '4px', borderRadius: '40px' }}>
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                style={{ padding: '6px 16px', borderRadius: '40px', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? '#2563eb' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--spec-text-primary)' }}
              >
                <i className="fas fa-th"></i> Сетка
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                style={{ padding: '6px 16px', borderRadius: '40px', border: 'none', cursor: 'pointer', background: viewMode === 'list' ? '#2563eb' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--spec-text-primary)' }}
              >
                <i className="fas fa-list"></i> Список
              </button>
            </div>
            <button className="spec-button spec-button-primary" onClick={() => setShowCreateModal(true)}>
              <i className="fas fa-plus"></i> Новая спецификация
            </button>
          </div>
        </div>
      </div>

      {/* Режим сетки */}
      {viewMode === 'grid' && (
        <div className="specs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {specifications.map(spec => (
            <div 
              key={spec.id} 
              className="spec-card" 
              onClick={() => handleOpenSpec(spec.id)}
              style={{ background: 'var(--spec-bg-solid)', borderRadius: '20px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--spec-border-light)' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{spec.name}</span>
                <span style={{ background: '#eef2ff', padding: '2px 10px', borderRadius: '40px', fontSize: '0.7rem', color: '#2563eb' }}>{getItemsCount(spec)} поз.</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--spec-text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fas fa-folder"></i> {getProjectDisplay(spec.projectId)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--spec-text-muted)', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--spec-border-light)' }}>
                <span><i className="far fa-calendar-alt"></i> {new Date(spec.createdAt).toLocaleDateString('ru-RU')}</span>
                <span><i className="fas fa-ruble-sign"></i> {getTotalSum(spec)} ₽</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
                <button className="spec-button spec-button-danger" onClick={(e) => handleDeleteSpec(spec.id, e)} style={{ padding: '4px 10px' }}>
                  <i className="fas fa-trash-alt"></i> Удалить
                </button>
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
      )}

      {/* Режим списка */}
      {viewMode === 'list' && (
        <div className="spec-table-container" style={{ overflowX: 'auto' }}>
          <table className="spec-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px' }}>Название</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Проект</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Дата создания</th>
                <th style={{ textAlign: 'right', padding: '12px' }}>Позиций</th>
                <th style={{ textAlign: 'right', padding: '12px' }}>Сумма (руб)</th>
                <th style={{ textAlign: 'center', padding: '12px', width: '80px' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {specifications.map(spec => (
                <tr key={spec.id} style={{ cursor: 'pointer' }} onClick={() => handleOpenSpec(spec.id)}>
                  <td style={{ padding: '12px', fontWeight: 500 }}>{spec.name}</td>
                  <td style={{ padding: '12px', fontSize: '0.8rem' }}>{getProjectDisplay(spec.projectId)}</td>
                  <td style={{ padding: '12px', fontSize: '0.8rem' }}>{new Date(spec.createdAt).toLocaleDateString('ru-RU')}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '0.8rem' }}>{getItemsCount(spec)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '0.8rem' }}>{getTotalSum(spec)} ₽</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button className="spec-button spec-button-danger" onClick={(e) => handleDeleteSpec(spec.id, e)} style={{ padding: '4px 10px' }}>
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {specifications.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--spec-text-secondary)' }}>
                    <i className="fas fa-file-alt" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                    <p>Нет спецификаций. Создайте первую!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Модальное окно создания спецификации */}
      {showCreateModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal" style={{ background: 'var(--spec-bg-solid)', borderRadius: '24px', width: '90%', maxWidth: '500px', padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>Новая спецификация</h3>
            <div className="modal-field" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--spec-text-secondary)', marginBottom: '4px' }}>Название спецификации</label>
              <input
                type="text"
                value={newSpecName}
                onChange={e => setNewSpecName(e.target.value)}
                placeholder="Например: Основное оборудование"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--spec-border-light)', borderRadius: '12px', fontSize: '0.85rem', background: 'var(--spec-bg-solid)', color: 'var(--spec-text-primary)' }}
              />
            </div>
            <div className="modal-field" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--spec-text-secondary)', marginBottom: '4px' }}>Привязать к проекту</label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--spec-border-light)', borderRadius: '12px', fontSize: '0.85rem', background: 'var(--spec-bg-solid)', color: 'var(--spec-text-primary)' }}
              >
                <option value="">— Выберите проект —</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.shortId} {project.name}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button className="spec-button" onClick={() => setShowCreateModal(false)}>Отмена</button>
              <button className="spec-button spec-button-primary" onClick={handleCreateSpec}>Создать</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
