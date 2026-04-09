import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, NodeResizeControl } from 'reactflow';
import { DeviceNodeData } from '../../types/flowTypes';

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
      {/* Хендлы со всех сторон */}
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

export default DeviceNode;
