import React, { useCallback } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import DeviceNode from '../components/flow/DeviceNode';
import { useFlowSchemas } from '../hooks/useFlowSchemas';
import { DeviceNodeData, SavedSchema } from '../types/flowTypes';
import { NodeTypes } from 'reactflow';

const nodeTypes: NodeTypes = { deviceNode: DeviceNode };

const FlowEditor: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<DeviceNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const {
    schemas,
    currentSchemaId,
    schemaName,
    setSchemaName,
    saveCurrentSchema,
    loadSchema,
    newSchema: newEmptySchema,
  } = useFlowSchemas();

  // Загрузка схемы при выборе
  const handleLoadSchema = (id: string) => {
    const data = loadSchema(id);
    if (data) {
      setNodes(data.nodes);
      setEdges(data.edges);
    }
  };

  // Новая схема
  const handleNewSchema = () => {
    const { nodes: emptyNodes, edges: emptyEdges } = newEmptySchema();
    setNodes(emptyNodes);
    setEdges(emptyEdges);
  };

  // Сохранение
  const handleSave = () => {
    saveCurrentSchema(nodes, edges);
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

  // Создание ребра
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

  // Экспорт SVG
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
        alert('Ошибка экспорта: ' + (err as Error).message);
      }
    }
  };

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', background: '#f5f7fb' }}>
      <div style={{ padding: '8px 16px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={currentSchemaId || ''}
            onChange={(e) => handleLoadSchema(e.target.value)}
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
          <button onClick={handleSave} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>💾 Сохранить</button>
          <button onClick={handleNewSchema} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>📄 Новая</button>
          <button onClick={exportSVG} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>📷 Экспорт SVG</button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => addNode('Источник', 'fa-camera')} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>➕ Источник</button>
          <button onClick={() => addNode('Коммутатор', 'fa-network-wired')} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>➕ Коммутатор</button>
          <button onClick={() => addNode('Дисплей', 'fa-tv')} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>➕ Дисплей</button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            <Controls position="bottom-right" />
            <MiniMap position="bottom-left" />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default FlowEditor;
