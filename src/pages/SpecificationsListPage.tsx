import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { addSpecification, deleteSpecification, updateSpecification } from '../store/specificationsSlice';
import { getSpecTotalRub } from '../utils/specificationUtils';

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'project' | 'sum' | 'date' | 'items';

export const SpecificationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const specifications = useSelector((state: RootState) => state.specifications.list);
  const projects = useSelector((state: RootState) => state.projects.list);
  const { usdRate, eurRate } = useSelector((state: RootState) => state.currency);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortField>('date');

  // Модальное окно для новой спецификации
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newProjectId, setNewProjectId] = useState('');

  // Получить имя проекта по ID
  const getProjectName = (projectId: string | null) => {
    if (!projectId) return '— не привязан —';
    const project = projects.find(p => p.id === projectId);
    return project ? `${project.shortId} ${project.name}` : '— не привязан —';
  };

  // Подготовка данных с суммой и количеством позиций
  const specsWithMeta = useMemo(() => {
    return specifications.map(spec => ({
      ...spec,
      totalSum: getSpecTotalRub(spec.rows, usdRate, eurRate),
      itemsCount: spec.rows.filter(r => r.type === 'data').length,
    }));
  }, [specifications, usdRate, eurRate]);

  // Фильтрация
  const filteredSpecs = useMemo(() => {
    let filtered = specsWithMeta;
    // Поиск по названию
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(q));
    }
    // Фильтр по проекту
    if (filterProject !== 'all') {
      if (filterProject === 'null') {
        filtered = filtered.filter(s => s.projectId === null);
      } else {
        filtered = filtered.filter(s => s.projectId === filterProject);
      }
    }
    return filtered;
  }, [specsWithMeta, searchQuery, filterProject]);

  // Сортировка
  const sortedSpecs = useMemo(() => {
    const sorted = [...filteredSpecs];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'project':
        sorted.sort((a, b) => {
          const nameA = getProjectName(a.projectId);
          const nameB = getProjectName(b.projectId);
          return nameA.localeCompare(nameB);
        });
        break;
      case 'sum':
        sorted.sort((a, b) => b.totalSum - a.totalSum);
        break;
      case 'items':
        sorted.sort((a, b) => b.itemsCount - a.itemsCount);
        break;
      case 'date':
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    return sorted;
  }, [filteredSpecs, sortBy]);

  // Действия
  const handleOpen = (id: string) => {
    navigate(`/specification/${id}`);
  };

  const handleDuplicate = (spec: any) => {
    const newId = Date.now().toString();
    const now = new Date().toISOString();
    dispatch(addSpecification({
      ...spec,
      id: newId,
      name: `${spec.name} (копия)`,
      projectId: null,
      createdAt: now,
      updatedAt: now,
    }));
    navigate(`/specification/${newId}`);
  };

  const handleUnlink = (id: string) => {
    if (confirm('Открепить спецификацию от проекта? Она останется в списке без привязки.')) {
      dispatch(updateSpecification({ id, updates: { projectId: null } }));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить спецификацию? Это действие необратимо.')) {
      dispatch(deleteSpecification(id));
    }
  };

  const handleCreate = () => {
    if (!newName.trim()) {
      alert('Введите название спецификации');
      return;
    }
    const now = new Date().toISOString();
    dispatch(addSpecification({
      id: Date.now().toString(),
      name: newName.trim(),
      projectId: newProjectId || null,
      createdAt: now,
      updatedAt: now,
      rows: [],
    }));
    setShowModal(false);
    setNewName('');
    setNewProjectId('');
  };

  // Рендер карточки (сетка)
  const renderGrid = () => (
    <div className="specs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
      {sortedSpecs.map(spec => (
        <div
          key={spec.id}
          className="spec-card"
          onClick={() => handleOpen(spec.id)}
          style={{ background: 'var(--spec-bg-solid)', borderRadius: '20px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--spec-border-light)' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{spec.name}</span>
            <span style={{ background: '#eef2ff', padding: '2px 10px', borderRadius: '40px', fontSize: '0.7rem', color: '#2563eb' }}>{spec.itemsCount} поз.</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--spec-text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fas fa-folder"></i> {getProjectName(spec.projectId)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--spec-text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fas fa-ruble-sign"></i> {Math.round(spec.totalSum).toLocaleString()} ₽
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--spec-text-muted)', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--spec-border-light)' }}>
            <span><i className="far fa-calendar-alt"></i> {new Date(spec.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
            <button className="spec-button" onClick={(e) => { e.stopPropagation(); handleOpen(spec.id); }} title="Открыть">
              <i className="fas fa-eye"></i>
            </button>
            <button className="spec-button" onClick={(e) => { e.stopPropagation(); handleDuplicate(spec); }} title="Дублировать">
              <i className="fas fa-copy"></i>
            </button>
            {spec.projectId && (
              <button className="spec-button" onClick={(e) => { e.stopPropagation(); handleUnlink(spec.id); }} title="Открепить от проекта">
                <i className="fas fa-unlink"></i>
              </button>
            )}
            <button className="spec-button spec-button-danger" onClick={(e) => { e.stopPropagation(); handleDelete(spec.id); }} title="Удалить">
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      ))}
      {sortedSpecs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--spec-text-secondary)' }}>
          <i className="fas fa-file-alt" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
          <p>Нет спецификаций. Создайте первую!</p>
        </div>
      )}
    </div>
  );

  // Рендер таблицы (список)
  const renderList = () => (
    <div className="spec-table-container" style={{ overflowX: 'auto' }}>
      <table className="spec-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '12px' }}>Название</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Проект</th>
            <th style={{ textAlign: 'right', padding: '12px' }}>Сумма (руб)</th>
            <th style={{ textAlign: 'center', padding: '12px' }}>Позиций</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Дата создания</th>
            <th style={{ textAlign: 'center', padding: '12px', width: '120px' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {sortedSpecs.map(spec => (
            <tr key={spec.id} style={{ cursor: 'pointer' }} onClick={() => handleOpen(spec.id)}>
              <td style={{ padding: '12px', fontWeight: 500 }}>{spec.name}</td>
              <td style={{ padding: '12px', fontSize: '0.8rem' }}>{getProjectName(spec.projectId)}</td>
              <td style={{ padding: '12px', textAlign: 'right', fontSize: '0.8rem' }}>{Math.round(spec.totalSum).toLocaleString()} ₽</td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.8rem' }}>{spec.itemsCount}</td>
              <td style={{ padding: '12px', fontSize: '0.8rem' }}>{new Date(spec.createdAt).toLocaleDateString('ru-RU')}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button className="spec-button" onClick={(e) => { e.stopPropagation(); handleOpen(spec.id); }} title="Открыть">
                    <i className="fas fa-eye"></i>
                  </button>
                  <button className="spec-button" onClick={(e) => { e.stopPropagation(); handleDuplicate(spec); }} title="Дублировать">
                    <i className="fas fa-copy"></i>
                  </button>
                  {spec.projectId && (
                    <button className="spec-button" onClick={(e) => { e.stopPropagation(); handleUnlink(spec.id); }} title="Открепить">
                      <i className="fas fa-unlink"></i>
                    </button>
                  )}
                  <button className="spec-button spec-button-danger" onClick={(e) => { e.stopPropagation(); handleDelete(spec.id); }} title="Удалить">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
               </td>
             </tr>
          ))}
          {sortedSpecs.length === 0 && (
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
  );

  return (
    <div className="spec-page">
      <div className="spec-toolbar">
        <div className="spec-toolbar-row">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Спецификации</h1>
          <button className="spec-button spec-button-primary" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus"></i> Новая спецификация
          </button>
        </div>
        <div className="spec-toolbar-row">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--spec-border-light)', fontSize: '0.8rem', width: '200px', background: 'var(--spec-bg-solid)', color: 'var(--spec-text-primary)' }}
            />
            <select
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--spec-border-light)', fontSize: '0.8rem', background: 'var(--spec-bg-solid)', color: 'var(--spec-text-primary)' }}
            >
              <option value="all">Все проекты</option>
              <option value="null">Без проекта</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.shortId} {p.name}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortField)}
              style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--spec-border-light)', fontSize: '0.8rem', background: 'var(--spec-bg-solid)', color: 'var(--spec-text-primary)' }}
            >
              <option value="date">По дате (новые)</option>
              <option value="name">По названию</option>
              <option value="project">По проекту</option>
              <option value="sum">По сумме (убыв.)</option>
              <option value="items">По количеству позиций</option>
            </select>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? renderGrid() : renderList()}

      {/* Модальное окно создания спецификации */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal" style={{ background: 'var(--spec-bg-solid)', borderRadius: '24px', width: '90%', maxWidth: '500px', padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>Новая спецификация</h3>
            <div className="modal-field" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--spec-text-secondary)', marginBottom: '4px' }}>Название</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Например: Основное оборудование"
                autoFocus
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--spec-border-light)', borderRadius: '12px', fontSize: '0.85rem', background: 'var(--spec-bg-solid)', color: 'var(--spec-text-primary)' }}
              />
            </div>
            <div className="modal-field" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--spec-text-secondary)', marginBottom: '4px' }}>Привязать к проекту (необязательно)</label>
              <select
                value={newProjectId}
                onChange={e => setNewProjectId(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--spec-border-light)', borderRadius: '12px', fontSize: '0.85rem', background: 'var(--spec-bg-solid)', color: 'var(--spec-text-primary)' }}
              >
                <option value="">— Не привязывать —</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.shortId} {project.name}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button className="spec-button" onClick={() => setShowModal(false)}>Отмена</button>
              <button className="spec-button spec-button-primary" onClick={handleCreate}>Создать</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
