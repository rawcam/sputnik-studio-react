import React, { useState, useRef, useEffect } from 'react';
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

  // Вспомогательная функция для создания хендлов на стороне
  const renderHandles = (side: Position, count: number, offset: number[]) => {
    const handles = [];
    for (let i = 0; i < count; i++) {
      const positionPercent = offset[i];
      const idSuffix = `${side}-${i}`;
      // Определяем стиль позиционирования в зависимости от стороны
      let style: React.CSSProperties = { background: borderColor, width: 6, height: 6 };
      if (side === Position.Left || side === Position.Right) {
        style.top = `${positionPercent * 100}%`;
        style.transform = 'translateY(-50%)';
      } else {
        style.left = `${positionPercent * 100}%`;
        style.transform = 'translateX(-50%)';
      }
      style.position = 'absolute';
      // Добавляем source и target хендлы для каждой точки
      handles.push(
        <Handle
          key={`source-${idSuffix}`}
          type="source"
          position={side}
          id={`source-${idSuffix}`}
          style={style}
        />,
        <Handle
          key={`target-${idSuffix}`}
          type="target"
          position={side}
          id={`target-${idSuffix}`}
          style={style}
        />
      );
    }
    return handles;
  };

  // Левая сторона: 3 точки (25%, 50%, 75%)
  const leftHandles = renderHandles(Position.Left, 3, [0.25, 0.5, 0.75]);
  // Правая сторона: 3 точки
  const rightHandles = renderHandles(Position.Right, 3, [0.25, 0.5, 0.75]);
  // Верхняя сторона: 2 точки (33%, 66%)
  const topHandles = renderHandles(Position.Top, 2, [0.33, 0.66]);
  // Нижняя сторона: 2 точки
  const bottomHandles = renderHandles(Position.Bottom, 2, [0.33, 0.66]);

  return (
    <div
      style={{
        background: 'white',
        border: `2px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '8px 12px',
        minWidth: '160px',
        minHeight: '80px',
        boxShadow: selected ? '0 0 0 2px #2563eb, 0 4px 12px rgba(0,0,0,0.15)' : '0 4px 6px rgba(0,0,0,0.1)',
        cursor: 'grab',
        position: 'relative',
        width: data.width || 'auto',
        height: data.height || 'auto',
        resize: 'both',
        overflow: 'auto',
      }}
    >
      {leftHandles}
      {rightHandles}
      {topHandles}
      {bottomHandles}

      <NodeResizeControl
        nodeId={id}
        minWidth={120}
        minHeight={80}
        color={borderColor}
        style={{ background: 'transparent', border: 'none' }}
      />
      <div style={{ fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <i className={data.icon} style={{ fontSize: '14px', width: '16px' }}></i>
        <span style={{ cursor: 'pointer' }} onClick={() => setIsEditing(true)}>
          {data.label}
        </span>
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
