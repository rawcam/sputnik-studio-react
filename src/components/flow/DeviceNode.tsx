import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, NodeResizeControl, useReactFlow } from 'reactflow';
import { DeviceNodeData } from '../../types/flowTypes';

const DeviceNode = ({ id, data, selected }: NodeProps<DeviceNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);
  const borderColor = data.color || '#2563eb';
  const { setNodes } = useReactFlow();

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

  const handleResize = (_event: any, params: { width: number; height: number }) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, width: params.width, height: params.height } }
          : n
      )
    );
  };

  // Рендерим хендлы на основе inputs и outputs
  const renderHandles = () => {
    const handles: JSX.Element[] = [];

    // Входы (target) слева
    data.inputs.forEach((input, index) => {
      const top = `${((index + 1) / (data.inputs.length + 1)) * 100}%`;
      handles.push(
        <Handle
          key={`input-${input.id}`}
          type="target"
          position={Position.Left}
          id={input.id}
          style={{ top, background: borderColor }}
        />
      );
      // Если двунаправленный, добавляем source хендл на той же позиции
      if (input.direction === 'bidirectional') {
        handles.push(
          <Handle
            key={`input-source-${input.id}`}
            type="source"
            position={Position.Left}
            id={`source-${input.id}`}
            style={{ top, background: borderColor }}
          />
        );
      }
    });

    // Выходы (source) справа
    data.outputs.forEach((output, index) => {
      const top = `${((index + 1) / (data.outputs.length + 1)) * 100}%`;
      handles.push(
        <Handle
          key={`output-${output.id}`}
          type="source"
          position={Position.Right}
          id={output.id}
          style={{ top, background: borderColor }}
        />
      );
      if (output.direction === 'bidirectional') {
        handles.push(
          <Handle
            key={`output-target-${output.id}`}
            type="target"
            position={Position.Right}
            id={`target-${output.id}`}
            style={{ top, background: borderColor }}
          />
        );
      }
    });

    return handles;
  };

  return (
    <div
      style={{
        background: 'white',
        border: `2px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '8px 12px',
        minWidth: '160px',
        minHeight: '80px',
        boxShadow: selected
          ? '0 0 0 2px #2563eb, 0 4px 12px rgba(0,0,0,0.15)'
          : '0 4px 6px rgba(0,0,0,0.1)',
        cursor: 'grab',
        position: 'relative',
        width: data.width || 'auto',
        height: data.height || 'auto',
      }}
    >
      {renderHandles()}

      <NodeResizeControl
        nodeId={id}
        minWidth={120}
        minHeight={80}
        keepAspectRatio={false}
        onResize={handleResize}
        color={borderColor}
        style={{ background: 'transparent', border: 'none' }}
      />

      <div
        style={{
          fontWeight: 'bold',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <i className={data.icon} style={{ fontSize: '14px', width: '16px' }}></i>
        <span style={{ cursor: 'pointer' }} onClick={() => setIsEditing(true)}>
          {data.label}
        </span>
      </div>
      <div style={{ fontSize: '11px', color: '#4b6a8a' }}>
        <div>Входов: {data.inputs.length}</div>
        <div>Выходов: {data.outputs.length}</div>
        {data.totalPowerConsumption && (
          <div>⚡ {data.totalPowerConsumption} Вт</div>
        )}
        {data.totalPoEConsumption && (
          <div>🔌 PoE: {data.totalPoEConsumption} Вт</div>
        )}
      </div>
      {isEditing && (
        <input
          ref={inputRef}
          type="text"
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          onBlur={handleLabelSubmit}
          onKeyDown={handleKeyDown}
          style={{
            position: 'absolute',
            top: '10px',
            left: '32px',
            width: 'calc(100% - 60px)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '2px 4px',
            fontSize: 'inherit',
            zIndex: 10,
          }}
          className="nodrag"
        />
      )}
    </div>
  );
};

export default DeviceNode;
