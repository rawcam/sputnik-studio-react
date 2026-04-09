import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  NodeTypes,
  NodeProps,
  NodeResizeControl,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

// ========== ТИПЫ ==========
interface DeviceNodeData {
  label: string;
  icon: string;
  latency: number;
  power: number;
  poe?: string;
  ethernet?: boolean;
  usb?: boolean;
  color?: string;
  width?: number;
  height?: number;
}

interface SavedSchema {
  id: string;
  name: string;
  nodes: Node<DeviceNodeData>[];
  edges: Edge[];
}

// ========== КАСТОМНАЯ НОДА ==========
const DeviceNode = ({ id, data, selected }: NodeProps<DeviceNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);
  const borderColor = data.color || '#2563eb';

  const handleLabelSubmit = () => {
    if (editLabel.trim()) {
      data.label = editLabel;
    } else {
      setEditLabel(data.label);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelSubmit();
    } else if (e.key === 'Escape') {
      setEditLabel(data.label);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      style={{
        background: 'white',
        border: `2px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '8px 12px',
        minWidth: '160px',
        boxShadow: selected ? '0 0 0 2px #2563eb, 0 4px 12px rgba(0,0,0,0.15)' : '0 4px 6px rgba(0,0,0,0.1)',
        cursor: 'grab',
        position: 'relative',
        width: data.width || 'auto',
        height: data.height || 'auto',
      }}
    >
      {/* Точки соединения (хендлы) со всех четырёх сторон */}
      <Handle type="source" position={Position.Top} id="top" style={{ background: '#2563eb', width: 10, height: 10 }} />
      <Handle type="target" position={Position.Top} id="top" style={{ background: '#2563eb', width: 10, height: 10 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#2563eb', width: 10, height: 10 }} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={{ background: '#2563eb', width: 10, height: 10 }} />
      <Handle type="source" position={Position.Left} id="left" style={{ background: '#2563eb', width: 10, height: 10 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ background: '#2563eb', width: 10, height: 10 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: '#2563eb', width: 10, height: 10 }} />
      <Handle type="target" position={Position.Right} id="right" style={{ background: '#2563eb', width: 10, height: 10 }} />

      <NodeResizeControl
        nodeId={id}
        minWidth={120}
        minHeight={80}
        color={borderColor}
        style={{ background: 'transparent', border: 'none' }}
      />
      <div style={{ fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <i className={data.icon} style={{ fontSize: '14px', width: '16px' }}></i>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onBlur={handleLabelSubmit}
            onKeyDown={handleKeyDown}
            style={{ flex: 1, border: '1px solid #ccc', borderRadius: '4px', padding: '2px 4px', fontSize: 'inherit' }}
            className="nodrag"
          />
        ) : (
          <span
            onDoubleClick={() => setIsEditing(true)}
            style={{ cursor: 'text' }}
          >
            {data.label}
          </span>
        )}
      </div>
      <div style={{ fontSize: '11px', color: '#4b6a8a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>⏱️ Задержка:</span>
          <span>{data.latency} мс</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>⚡ Мощность:</span>
          <span>{data.power} Вт</span>
        </div>
        {data.poe && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>🔌 PoE:</span>
            <span>{data.poe}</span>
          </div>
        )}
        {data.ethernet && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>🌐 Ethernet:</span>
            <span>Да</span>
          </div>
        )}
        {data.usb && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>🔌 USB:</span>
            <span>Да</span>
          </div>
        )}
      </div>
    </div>
  );
};

const nodeTypes: NodeTypes = { deviceNode: DeviceNode };

// ========== КОМПОНЕНТ РЕДАКТОРА ==========
const FlowEditor: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<DeviceNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [schemas, setSchemas] = useState<SavedSchema[]>([]);
  const [currentSchemaId, setCurrentSchemaId] = useState<string | null>(null);
  const [schemaName, setSchemaName] = useState('Новая схема');
  const [editingNode, setEditingNode] = useState<Node<DeviceNodeData> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; nodeId: string | null }>({ visible: false, x: 0, y: 0, nodeId: null });

  // Загрузка списка схем из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flow_schemas');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSchemas(parsed);
      } catch (e) {}
    }
  }, []);

  // Сохранение списка схем
  const saveSchemasList = (list: SavedSchema[]) => {
    setSchemas(list);
    localStorage.setItem('flow_schemas', JSON.stringify(list));
  };

  // Сохранение текущей схемы
  const saveCurrentSchema = () => {
    if (!currentSchemaId) {
      const newId = Date.now().toString();
      const newSchema: SavedSchema = {
        id: newId,
        name: schemaName,
        nodes,
        edges,
      };
      saveSchemasList([...schemas, newSchema]);
      setCurrentSchemaId(newId);
    } else {
      const updated = schemas.map(s => s.id === currentSchemaId ? { ...s, name: schemaName, nodes, edges } : s);
      saveSchemasList(updated);
    }
    alert('Схема сохранена');
  };

  // Загрузка схемы по id
  const loadSchema = (id: string) => {
    const schema = schemas.find(s => s.id === id);
    if (schema) {
      setNodes(schema.nodes);
      setEdges(schema.edges);
      setCurrentSchemaId(schema.id);
      setSchemaName(schema.name);
    }
  };

  // Новая пустая схема
  const newSchema = () => {
    setNodes([]);
    setEdges([]);
    setCurrentSchemaId(null);
    setSchemaName('Новая схема');
  };

  // Добавление ноды
  const addNode = (type: string, icon: string) => {
    const newNode: Node<DeviceNodeData> = {
      id: Date.now().toString(),
      type: 'deviceNode',
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: type,
        icon,
        latency: 0,
        power: 0,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  // Редактирование ноды (двойной клик)
  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node<DeviceNodeData>) => {
    setEditingNode(node);
    setShowModal(true);
  }, []);

  const handleNodeUpdate = (updatedData: Partial<DeviceNodeData>) => {
    if (editingNode) {
      setNodes(nds => nds.map(n => n.id === editingNode.id ? { ...n, data: { ...n.data, ...updatedData } } : n));
      setShowModal(false);
      setEditingNode(null);
    }
  };

  // Контекстное меню
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node<DeviceNodeData>) => {
    event.preventDefault();
    setContextMenu({ visible: true, x: event.clientX, y: event.clientY, nodeId: node.id });
  }, []);

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
  };

  const handleContextMenuAction = (action: string) => {
    if (contextMenu.nodeId) {
      if (action === 'delete') {
        setNodes(nds => nds.filter(n => n.id !== contextMenu.nodeId));
      } else if (action === 'duplicate') {
        const nodeToDuplicate = nodes.find(n => n.id === contextMenu.nodeId);
        if (nodeToDuplicate) {
          const newNode = { ...nodeToDuplicate, id: Date.now().toString(), position: { x: nodeToDuplicate.position.x + 50, y: nodeToDuplicate.position.y + 50 } };
          setNodes(nds => nds.concat(newNode));
        }
      } else if (action === 'edit') {
        const node = nodes.find(n => n.id === contextMenu.nodeId);
        if (node) {
          setEditingNode(node);
          setShowModal(true);
        }
      }
    }
    closeContextMenu();
  };

  // Удаление выделенных элементов (Delete)
  const onKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete') {
      setNodes((nds) => nds.filter(n => !n.selected));
      setEdges((eds) => eds.filter(e => !e.selected));
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  useEffect(() => {
    document.addEventListener('click', closeContextMenu);
    return () => document.removeEventListener('click', closeContextMenu);
  }, []);

  // Создание рёбер (линий)
  const onConnect = useCallback((params: Connection) => {
    if (params.source && params.target) {
      const newEdge: Edge = {
        id: `e-${params.source}-${params.target}-${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        label: '🔌',
        labelStyle: { fill: '#2563eb', fontWeight: 500 },
        style: { stroke: '#2563eb', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    }
  }, [setEdges]);

  // Экспорт в SVG
  const exportSVG = async () => {
    const element = document.querySelector('.react-flow');
    if (element) {
      const htmlToImage = (await import('html-to-image')).default;
      try {
        const dataUrl = await htmlToImage.toSvg(element as HTMLElement, { backgroundColor: '#f9fafb' });
        const link = document.createElement('a');
        link.download = `flow-${schemaName}.svg`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error(err);
        alert('Ошибка экспорта: ' + err.message);
      }
    }
  };

  // Предопределённые иконки для выпадающего списка
  const iconOptions = [
    { value: 'fa-camera', label: 'Камера' },
    { value: 'fa-desktop', label: 'Компьютер' },
    { value: 'fa-tv', label: 'Дисплей' },
    { value: 'fa-network-wired', label: 'Коммутатор' },
    { value: 'fa-microphone', label: 'Микрофон' },
    { value: 'fa-headphones', label: 'Наушники' },
    { value: 'fa-projector', label: 'Проектор' },
    { value: 'fa-microchip', label: 'Микросхема' },
  ];

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', background: '#f5f7fb' }}>
      {/* Панель инструментов в стиле проекта */}
      <div style={{ padding: '8px 16px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={currentSchemaId || ''}
            onChange={(e) => loadSchema(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', fontSize: '14px' }}
          >
            <option value="">-- Выберите схему --</option>
            {schemas.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input
            type="text"
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            placeholder="Название схемы"
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', width: '200px' }}
          />
          <button onClick={saveCurrentSchema} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>💾 Сохранить</button>
          <button onClick={newSchema} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>📄 Новая</button>
          <button onClick={exportSVG} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>📷 Экспорт SVG</button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => addNode('Источник', 'fa-camera')} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>➕ Источник</button>
          <button onClick={() => addNode('Коммутатор', 'fa-network-wired')} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>➕ Коммутатор</button>
          <button onClick={() => addNode('Дисплей', 'fa-tv')} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>➕ Дисплей</button>
        </div>
      </div>

      {/* Холст React Flow */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeContextMenu={onNodeContextMenu}
            fitView
            attributionPosition="bottom-left"
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            <Controls position="bottom-right" />
            <MiniMap position="bottom-left" />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* Контекстное меню */}
      {contextMenu.visible && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'white',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '4px 0',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <div
            onClick={() => handleContextMenuAction('edit')}
            style={{ padding: '6px 16px', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
          >
            ✏️ Редактировать
          </div>
          <div
            onClick={() => handleContextMenuAction('duplicate')}
            style={{ padding: '6px 16px', cursor: 'pointer', fontSize: '14px' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
          >
            📋 Дублировать
          </div>
          <div
            onClick={() => handleContextMenuAction('delete')}
            style={{ padding: '6px 16px', cursor: 'pointer', fontSize: '14px' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
          >
            🗑️ Удалить
          </div>
        </div>
      )}

      {/* Модальное окно редактирования ноды */}
      {showModal && editingNode && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: 'white', borderRadius: '16px', padding: '20px', minWidth: '300px', maxWidth: '400px' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Редактировать устройство</h3>
            <label style={{ display: 'block', marginBottom: '12px' }}>
              <span style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Название:</span>
              <input
                type="text"
                value={editingNode.data.label}
                onChange={e => setEditingNode({ ...editingNode, data: { ...editingNode.data, label: e.target.value } })}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '12px' }}>
              <span style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Иконка:</span>
              <select
                value={editingNode.data.icon}
                onChange={e => setEditingNode({ ...editingNode, data: { ...editingNode.data, icon: e.target.value } })}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                {iconOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            <label style={{ display: 'block', marginBottom: '12px' }}>
              <span style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Задержка (мс):</span>
              <input
                type="number"
                value={editingNode.data.latency}
                onChange={e => setEditingNode({ ...editingNode, data: { ...editingNode.data, latency: Number(e.target.value) } })}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '12px' }}>
              <span style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Мощность (Вт):</span>
              <input
                type="number"
                value={editingNode.data.power}
                onChange={e => setEditingNode({ ...editingNode, data: { ...editingNode.data, power: Number(e.target.value) } })}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '12px' }}>
              <span style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>PoE:</span>
              <input
                type="text"
                value={editingNode.data.poe || ''}
                onChange={e => setEditingNode({ ...editingNode, data: { ...editingNode.data, poe: e.target.value } })}
                placeholder="802.3af/at/bt"
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '12px' }}>
              <span style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Ethernet:</span>
              <input
                type="checkbox"
                checked={editingNode.data.ethernet || false}
                onChange={e => setEditingNode({ ...editingNode, data: { ...editingNode.data, ethernet: e.target.checked } })}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '12px' }}>
              <span style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>USB:</span>
              <input
                type="checkbox"
                checked={editingNode.data.usb || false}
                onChange={e => setEditingNode({ ...editingNode, data: { ...editingNode.data, usb: e.target.checked } })}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '12px' }}>
              <span style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Цвет обводки:</span>
              <input
                type="color"
                value={editingNode.data.color || '#2563eb'}
                onChange={e => setEditingNode({ ...editingNode, data: { ...editingNode.data, color: e.target.value } })}
                style={{ width: '100%', padding: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Отмена</button>
              <button onClick={() => handleNodeUpdate(editingNode.data)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowEditor;
