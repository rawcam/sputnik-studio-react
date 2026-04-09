import React from 'react';
import { Node } from 'reactflow';
import { DeviceNodeData } from '../../types/flowTypes';

interface EditNodeModalProps {
  isOpen: boolean;
  node: Node<DeviceNodeData> | null;
  onClose: () => void;
  onSave: (updatedData: Partial<DeviceNodeData>) => void;
}

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

const EditNodeModal: React.FC<EditNodeModalProps> = ({ isOpen, node, onClose, onSave }) => {
  const [editedNode, setEditedNode] = React.useState<Node<DeviceNodeData> | null>(null);

  React.useEffect(() => {
    if (node) {
      setEditedNode({ ...node, data: { ...node.data } });
    }
  }, [node]);

  if (!isOpen || !editedNode) return null;

  const handleChange = (field: keyof DeviceNodeData, value: any) => {
    setEditedNode({
      ...editedNode,
      data: { ...editedNode.data, [field]: value },
    });
  };

  const handleSave = () => {
    onSave(editedNode.data);
    onClose();
  };

  return (
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
      onClick={onClose}
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
            value={editedNode.data.label}
            onChange={e => handleChange('label', e.target.value)}
            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '12px' }}>
          <span style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Иконка:</span>
          <select
            value={editedNode.data.icon}
            onChange={e => handleChange('icon', e.target.value)}
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
            value={editedNode.data.latency}
            onChange={e => handleChange('latency', Number(e.target.value))}
            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '12px' }}>
          <span style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Мощность (Вт):</span>
          <input
            type="number"
            value={editedNode.data.power}
            onChange={e => handleChange('power', Number(e.target.value))}
            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '12px' }}>
          <span style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>PoE:</span>
          <input
            type="text"
            value={editedNode.data.poe || ''}
            onChange={e => handleChange('poe', e.target.value)}
            placeholder="802.3af/at/bt"
            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '12px' }}>
          <span style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Ethernet:</span>
          <input
            type="checkbox"
            checked={editedNode.data.ethernet || false}
            onChange={e => handleChange('ethernet', e.target.checked)}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '12px' }}>
          <span style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>USB:</span>
          <input
            type="checkbox"
            checked={editedNode.data.usb || false}
            onChange={e => handleChange('usb', e.target.checked)}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '12px' }}>
          <span style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Цвет обводки:</span>
          <input
            type="color"
            value={editedNode.data.color || '#2563eb'}
            onChange={e => handleChange('color', e.target.value)}
            style={{ width: '100%', padding: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </label>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Отмена</button>
          <button onClick={handleSave} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Сохранить</button>
        </div>
      </div>
    </div>
  );
};

export default EditNodeModal;
