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
} from 'reactflow';
import 'reactflow/dist/style.css';
import DeviceNode from '../components/flow/DeviceNode';
import EditNodeModal from '../components/flow/EditNodeModal';
import { useFlowSchemas } from '../hooks/useFlowSchemas';
import { DeviceNodeData, SavedSchema } from '../types/flowTypes';

const nodeTypes = { deviceNode: DeviceNode };

const FlowEditor: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<DeviceNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [editingNode, setEditingNode] = useState<Node<DeviceNodeData> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; nodeId: string | null }>({
    visible: false,
    x: 0,
    y: 0,
    nodeId: null,
  });

  const { schemas, currentSchemaId, schemaName, setSchemaName, saveCurrentSchema, loadSchema, newSchema } =
    useFlowSchemas();

  // Загрузка начальной демо-схемы (если нет сохранённых)
  useEffect(() => {
    if (schemas.length === 0 && nodes.length === 0) {
      const demoNodes: Node<DeviceNodeData>[] = [
        {
          id: '1',
          type: 'deviceNode',
          position: { x: 100, y: 100 },
          data: { label: 'Источник', icon: 'fa-camera', latency: 5, power: 50 },
        },
        {
          id: '2',
          type: 'deviceNode',
          position: { x: 400, y: 100 },
          data: { label: 'Коммутатор', icon: 'fa-network-wired', latency: 2, power: 30, poe: '802.3at' },
        },
        {
          id: '3',
          type: 'deviceNode',
          position: { x: 700, y: 100 },
          data: { label: 'Дисплей', icon: 'fa-tv', latency: 8, power: 120 },
        },
      ];
      setNodes(demoNodes);
      setEdges([]);
    }
  }, [schemas]);

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

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node<DeviceNodeData>) => {
    setEditingNode(node);
    setShowModal(true);
  }, []);

  const handleNodeUpdate = (updatedData: Partial<DeviceNodeData>) => {
    if (editingNode) {
      setNodes((nds) =>
        nds.map((n) => (n.id === editingNode.id ? { ...n, data: { ...n.data, ...updatedData } } : n))
      );
      setShowModal(false);
      setEditingNode(null);
    }
  };

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
        setNodes((nds) => nds.filter((n) => n.id !== contextMenu.nodeId));
        setEdges((eds) => eds.filter((e) => e.source !== contextMenu.nodeId && e.target !== contextMenu.nodeId));
      } else if (action === 'duplicate') {
        const nodeToDuplicate = nodes.find((n) => n.id === contextMenu.nodeId);
        if (nodeToDuplicate) {
          const newNode = {
            ...nodeToDuplicate,
            id: Date.now().toString(),
            position: { x: nodeToDuplicate.position.x + 50, y: nodeToDuplicate.position.y + 50 },
          };
          setNodes((nds) => nds.concat(newNode));
        }
      } else if (action === 'edit') {
        const node = nodes.find((n) => n.id === contextMenu.nodeId);
        if (node) {
          setEditingNode(node);
          setShowModal(true);
        }
      }
    }
    closeContextMenu();
  };

  const onKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete') {
      setNodes((nds) => nds.filter((n) => !n.selected));
      setEdges((eds) => eds.filter((e) => !e.selected));
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', closeContextMenu);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', closeContextMenu);
    };
  }, [onKeyDown]);

  const onConnect = useCallback(
    (params: Connection) => {
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
    },
    [setEdges]
  );

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

  const handleLoadSchema = (id: string) => {
    const schema = loadSchema(id);
    if (schema) {
      setNodes(schema.nodes);
      setEdges(schema.edges);
    }
  };

  const handleNewSchema = () => {
    const { nodes: emptyNodes, edges: emptyEdges } = newSchema();
    setNodes(emptyNodes);
    setEdges(emptyEdges);
  };

  const handleSaveSchema = () => {
    saveCurrentSchema(nodes, edges);
  };

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', background: '#f5f7fb' }}>
      <div
        style={{
          padding: '8px 16px',
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={currentSchemaId || ''}
            onChange={(e) => handleLoadSchema(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', fontSize: '14px' }}
          >
            <option value="">-- Выберите схему --</option>
            {schemas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            placeholder="Название схемы"
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', width: '200px' }}
          />
          <button
            onClick={handleSaveSchema}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            💾 Сохранить
          </button>
          <button
            onClick={handleNewSchema}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            📄 Новая
          </button>
          <button
            onClick={exportSVG}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            📷 Экспорт SVG
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => addNode('Источник', 'fa-camera')}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ➕ Источник
          </button>
          <button
            onClick={() => addNode('Коммутатор', 'fa-network-wired')}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ➕ Коммутатор
          </button>
          <button
            onClick={() => addNode('Дисплей', 'fa-tv')}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ➕ Дисплей
          </button>
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
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeContextMenu={onNodeContextMenu}
            fitView
            attributionPosition="bottom-left"
            snapToGrid={true}
            snapGrid={[15, 15]}
            connectionLineStyle={{ stroke: '#2563eb', strokeWidth: 2 }}
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            <Controls position="bottom-right" />
            <MiniMap position="bottom-left" />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

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
            style={{ padding: '6px 16px', cursor: 'pointer', fontSize: '14px' }}
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

      <EditNodeModal
        isOpen={showModal}
        node={editingNode}
        onClose={() => setShowModal(false)}
        onSave={handleNodeUpdate}
      />
    </div>
  );
};

export default FlowEditor;
