import React, { useState, useCallback, useEffect } from 'react';
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
}

interface SavedSchema {
  id: string;
  name: string;
  nodes: Node<DeviceNodeData>[];
  edges: Edge[];
}

// ========== КАСТОМНАЯ НОДА ==========
const DeviceNode = ({ data }: NodeProps<DeviceNodeData>) => {
  const borderColor = data.color || '#2563eb';
  return (
    <div
      style={{
        background: 'white',
        border: `2px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '8px 12px',
        minWidth: '160px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        cursor: 'grab',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>{data.icon}</span>
        <span>{data.label}</span>
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
      // Новая схема
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
      // Обновление существующей
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
  const addNode = (type: string) => {
    const newNode: Node<DeviceNodeData> = {
      id: Date.now().toString(),
      type: 'deviceNode',
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: type,
        icon: type === 'Источник' ? '📷' : type === 'Коммутатор' ? '🔄' : '🖥️',
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

  const onConnect = useCallback((params: Connection) => {
    if (params.source && params.target) {
      const newEdge: Edge = {
        id: `e-${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
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
        alert('Ошибка экспорта');
      }
    }
  };

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', background: '#f5f7fb' }}>
      {/* Панель инструментов */}
      <div style={{ padding: '8px 16px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={currentSchemaId || ''}
          onChange={(e) => loadSchema(e.target.value)}
          style={{ padding: '4px 8px', borderRadius: '6px' }}
        >
          <option value="">-- Выберите схему --</option>
          {schemas.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input
          type="text"
          value={schemaName}
          onChange={(e) => setSchemaName(e.target.value)}
          placeholder="Название схемы"
          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button onClick={saveCurrentSchema} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px' }}>💾 Сохранить</button>
        <button onClick={newSchema} style={{ background: '#6c7e97', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px' }}>📄 Новая</button>
        <button onClick={exportSVG} style={{ background: '#10b981', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px' }}>📷 Экспорт SVG</button>
        <div style={{ width: '1px', height: '24px', background: '#ccc' }}></div>
        <button onClick={() => addNode('Источник')} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px' }}>➕ Источник</button>
        <button onClick={() => addNode('Коммутатор')} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px' }}>➕ Коммутатор</button>
        <button onClick={() => addNode('Дисплей')} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px' }}>➕ Дисплей</button>
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
            fitView
            attributionPosition="bottom-left"
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            <Controls position="bottom-right" />
            <MiniMap position="bottom-left" />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* Модальное окно редактирования ноды */}
      {showModal && editingNode && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', minWidth: '320px' }} onClick={e => e.stopPropagation()}>
            <h3>Редактировать устройство</h3>
            <label>Название: <input type="text" value={editingNode.data.label} onChange={e => setEditingNode({ ...editingNode, data: { ...editingNode.data, label: e.target.value } })} style={{ width: '100%', marginBottom: '8px' }} /></label>
            <label>Иконка: <input type="text" value={editingNode.data.icon} onChange={e => setEditingNode({ ...editingNode, data: { ...editingNode.data, icon: e.target.value } })} style={{ width: '100%', marginBottom: '8px' }} /></label>
            <label>Задержка (мс): <input type="number" value={editingNode.data.latency} onChange={e => setEditingNode({ ...editingNode, data: { ...editingNode.data, latency: Number(e.target.value) } })} style={{ width: '100%', marginBottom: '8px' }} /></label>
            <label>Мощность (Вт): <input type="number" value={editingNode.data.power} onChange={e => setEditingNode({ ...editingNode, data: { ...editingNode.data, power: Number(e.target.value) } })} style={{ width: '100%', marginBottom: '8px' }} /></label>
            <label>PoE: <input type="text" value={editingNode.data.poe || ''} onChange={e => setEditingNode({ ...editingNode, data: { ...editingNode.data, poe: e.target.value } })} placeholder="802.3af/at/bt" style={{ width: '100%', marginBottom: '8px' }} /></label>
            <label>Ethernet: <input type="checkbox" checked={editingNode.data.ethernet || false} onChange={e => setEditingNode({ ...editingNode, data: { ...editingNode.data, ethernet: e.target.checked } })} /></label>
            <label>USB: <input type="checkbox" checked={editingNode.data.usb || false} onChange={e => setEditingNode({ ...editingNode, data: { ...editingNode.data, usb: e.target.checked } })} /></label>
            <label>Цвет обводки: <input type="color" value={editingNode.data.color || '#2563eb'} onChange={e => setEditingNode({ ...editingNode, data: { ...editingNode.data, color: e.target.value } })} /></label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => setShowModal(false)}>Отмена</button>
              <button onClick={() => handleNodeUpdate(editingNode.data)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px' }}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowEditor;
