import React from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';

interface DeviceNodeData {
  label: string;
  icon: string;
  latency: number;
  power: number;
  poe?: string;
}

const DeviceNode = ({ data }: { data: DeviceNodeData }) => {
  return (
    <div
      style={{
        background: 'white',
        border: '2px solid #2563eb',
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
      </div>
    </div>
  );
};

const nodeTypes = { deviceNode: DeviceNode };

const initialNodes: Node<DeviceNodeData>[] = [
  {
    id: '1',
    type: 'deviceNode',
    position: { x: 100, y: 100 },
    data: { label: 'Источник', icon: '📷', latency: 5, power: 50 },
  },
  {
    id: '2',
    type: 'deviceNode',
    position: { x: 400, y: 100 },
    data: { label: 'Коммутатор', icon: '🔄', latency: 2, power: 30, poe: '802.3at' },
  },
  {
    id: '3',
    type: 'deviceNode',
    position: { x: 700, y: 100 },
    data: { label: 'Дисплей', icon: '🖥️', latency: 8, power: 120 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
];

const FlowEditor: React.FC = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = (params: Connection) => setEdges((eds) => addEdge(params, eds));

  const handleExport = async () => {
    const htmlToImage = (await import('html-to-image')).default;
    const element = document.querySelector('.react-flow');
    if (element) {
      try {
        const dataUrl = await htmlToImage.toSvg(element as HTMLElement, { backgroundColor: '#f9fafb' });
        const link = document.createElement('a');
        link.download = 'av-tract-scheme.svg';
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error(err);
        alert('Ошибка экспорта');
      }
    }
  };

  return (
    <div style={{ height: '100vh', width: '100%', background: '#f5f7fb' }}>
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 100 }}>
        <button
          onClick={handleExport}
          style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Экспорт в SVG
        </button>
      </div>
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
  );
};

export default FlowEditor;
