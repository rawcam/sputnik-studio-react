import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, NodeResizeControl, useReactFlow } from 'reactflow';
import { DeviceNodeData, ConnectorType, ProtocolType } from '../../types/flowTypes';

// Вспомогательная функция: цвет хендла по типу разъёма и протоколу
const getConnectorColor = (connector: ConnectorType, protocol: ProtocolType): string => {
  if (connector === 'HDMI') return '#f97316';       // оранжевый
  if (connector === 'DisplayPort') return '#1e293b'; // тёмно-синий
  if (connector === 'DVI') return '#94a3b8';
  if (connector === 'RJ45') {
    if (protocol === 'Dante' || protocol === 'AES67') return '#10b981'; // зелёный
    return '#3b82f6'; // синий для Ethernet
  }
  if (connector === 'XLR' || connector === 'TRS' || connector === 'Phoenix3' || connector === 'Phoenix5')
    return '#64748b'; // серый для аудио
  if (connector === 'PowerCON' || connector === 'IEC') return '#ef4444'; // красный для питания
  return '#2563eb'; // по умолчанию
};

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

  // Вычисляем максимальное количество строк для высоты
  const maxRows = Math.max(data.inputs.length, data.outputs.length);

  return (
    <div
      style={{
        background: 'white',
        border: `2px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '8px 12px',
        minWidth: '180px',
        boxShadow: selected
          ? '0 0 0 2px #2563eb, 0 4px 12px rgba(0,0,0,0.15)'
          : '0 4px 6px rgba(0,0,0,0.1)',
        cursor: 'grab',
        position: 'relative',
        width: data.width || 'auto',
        height: data.height || 'auto',
      }}
    >
      {/* Заголовок ноды */}
      <div
        style={{
          fontWeight: 'bold',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '4px',
        }}
      >
        <i className={data.icon} style={{ fontSize: '14px', width: '16px' }}></i>
        <span style={{ cursor: 'pointer' }} onClick={() => setIsEditing(true)}>
          {data.label}
        </span>
      </div>

      {/* Таблица входов и выходов */}
      <div style={{ fontSize: '10px', lineHeight: '1.4', color: '#334155' }}>
        {Array.from({ length: maxRows }).map((_, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
            {/* Левая сторона — входы */}
            <div style={{ flex: 1, textAlign: 'left', paddingRight: '8px' }}>
              {data.inputs[rowIndex] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {data.inputs[rowIndex].name}
                  </span>
                  {/* Хендл для входа */}
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={data.inputs[rowIndex].id}
                    style={{
                      background: getConnectorColor(data.inputs[rowIndex].connector, data.inputs[rowIndex].protocol),
                      width: '10px',
                      height: '10px',
                      border: '1px solid white',
                      position: 'relative',
                      left: '-8px',
                      top: 'auto',
                      transform: 'none',
                    }}
                  />
                </div>
              )}
            </div>
            {/* Правая сторона — выходы */}
            <div style={{ flex: 1, textAlign: 'right', paddingLeft: '8px' }}>
              {data.outputs[rowIndex] && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  {/* Хендл для выхода */}
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={data.outputs[rowIndex].id}
                    style={{
                      background: getConnectorColor(data.outputs[rowIndex].connector, data.outputs[rowIndex].protocol),
                      width: '10px',
                      height: '10px',
                      border: '1px solid white',
                      position: 'relative',
                      right: '-8px',
                      top: 'auto',
                      transform: 'none',
                    }}
                  />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {data.outputs[rowIndex].name}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Дополнительная информация (мощность, PoE) */}
      {(data.totalPowerConsumption || data.totalPoEConsumption) && (
        <div style={{ marginTop: '6px', fontSize: '9px', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '4px' }}>
          {data.totalPowerConsumption && <span>⚡ {data.totalPowerConsumption} Вт </span>}
          {data.totalPoEConsumption && <span>🔌 PoE: {data.totalPoEConsumption} Вт</span>}
        </div>
      )}

      <NodeResizeControl
        nodeId={id}
        minWidth={180}
        minHeight={80}
        keepAspectRatio={false}
        onResize={handleResize}
        color={borderColor}
        style={{ background: 'transparent', border: 'none' }}
      />

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
