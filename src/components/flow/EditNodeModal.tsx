import React from 'react';
import { Node } from 'reactflow';
import { DeviceNodeData, DeviceInterface, ConnectorType, ProtocolType } from '../../types/flowTypes';

interface EditNodeModalProps {
  isOpen: boolean;
  node: Node<DeviceNodeData> | null;
  onClose: () => void;
  onSave: (updatedData: Partial<DeviceNodeData>) => void;
}

const connectorOptions: ConnectorType[] = ['HDMI', 'DVI', 'DisplayPort', 'RJ45', 'XLR', 'Phoenix3', 'Phoenix5'];
const protocolOptions: ProtocolType[] = ['HDMI', 'DVI', 'DisplayPort', 'Ethernet', 'Dante', 'AES67', 'AnalogAudio', 'Power', 'PoE'];

const EditNodeModal: React.FC<EditNodeModalProps> = ({ isOpen, node, onClose, onSave }) => {
  const [editedData, setEditedData] = React.useState<DeviceNodeData | null>(null);

  React.useEffect(() => {
    if (node) {
      setEditedData({ ...node.data });
    }
  }, [node]);

  if (!isOpen || !editedData) return null;

  const updateInterface = (type: 'inputs' | 'outputs', index: number, field: keyof DeviceInterface, value: any) => {
    const newList = [...editedData[type]];
    newList[index] = { ...newList[index], [field]: value };
    setEditedData({ ...editedData, [type]: newList });
  };

  const addInterface = (type: 'inputs' | 'outputs') => {
    const newId = `${type}-${Date.now()}-${Math.random()}`;
    const newIf: DeviceInterface = {
      id: newId,
      name: type === 'inputs' ? `Вход ${editedData.inputs.length + 1}` : `Выход ${editedData.outputs.length + 1}`,
      direction: type === 'inputs' ? 'input' : 'output',
      connector: 'HDMI',
      protocol: 'HDMI',
    };
    setEditedData({ ...editedData, [type]: [...editedData[type], newIf] });
  };

  const removeInterface = (type: 'inputs' | 'outputs', index: number) => {
    const newList = editedData[type].filter((_, i) => i !== index);
    setEditedData({ ...editedData, [type]: newList });
  };

  const handleSave = () => {
    // Пересчёт суммарных мощностей
    const totalPower = [...editedData.inputs, ...editedData.outputs].reduce((sum, iface) => sum + (iface.power || 0), 0);
    const totalPoE = [...editedData.inputs, ...editedData.outputs].reduce((sum, iface) => sum + (iface.poePower || 0), 0);
    onSave({ ...editedData, totalPowerConsumption: totalPower, totalPoEConsumption: totalPoE });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }}>
        <h3>Редактировать устройство</h3>
        <label>Название: <input value={editedData.label} onChange={e => setEditedData({ ...editedData, label: e.target.value })} /></label>
        <label>Цвет: <input type="color" value={editedData.color || '#2563eb'} onChange={e => setEditedData({ ...editedData, color: e.target.value })} /></label>

        <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
          {/* Входы */}
          <div style={{ flex: 1 }}>
            <h4>Входы <button onClick={() => addInterface('inputs')}>+</button></h4>
            {editedData.inputs.map((iface, idx) => (
              <div key={iface.id} style={{ border: '1px solid #ccc', marginBottom: '8px', padding: '8px', borderRadius: '4px' }}>
                <input value={iface.name} onChange={e => updateInterface('inputs', idx, 'name', e.target.value)} placeholder="Название" />
                <select value={iface.connector} onChange={e => updateInterface('inputs', idx, 'connector', e.target.value)}>
                  {connectorOptions.map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={iface.protocol} onChange={e => updateInterface('inputs', idx, 'protocol', e.target.value)}>
                  {protocolOptions.map(p => <option key={p}>{p}</option>)}
                </select>
                {iface.connector === 'RJ45' && (
                  <label><input type="checkbox" checked={iface.poe || false} onChange={e => updateInterface('inputs', idx, 'poe', e.target.checked)} /> PoE</label>
                )}
                {iface.poe && <input type="number" placeholder="PoE мощность (Вт)" value={iface.poePower || ''} onChange={e => updateInterface('inputs', idx, 'poePower', Number(e.target.value))} />}
                <button onClick={() => removeInterface('inputs', idx)}>Удалить</button>
              </div>
            ))}
          </div>
          {/* Выходы */}
          <div style={{ flex: 1 }}>
            <h4>Выходы <button onClick={() => addInterface('outputs')}>+</button></h4>
            {editedData.outputs.map((iface, idx) => (
              <div key={iface.id} style={{ border: '1px solid #ccc', marginBottom: '8px', padding: '8px', borderRadius: '4px' }}>
                <input value={iface.name} onChange={e => updateInterface('outputs', idx, 'name', e.target.value)} placeholder="Название" />
                <select value={iface.connector} onChange={e => updateInterface('outputs', idx, 'connector', e.target.value)}>
                  {connectorOptions.map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={iface.protocol} onChange={e => updateInterface('outputs', idx, 'protocol', e.target.value)}>
                  {protocolOptions.map(p => <option key={p}>{p}</option>)}
                </select>
                {iface.connector === 'RJ45' && (
                  <label><input type="checkbox" checked={iface.poe || false} onChange={e => updateInterface('outputs', idx, 'poe', e.target.checked)} /> PoE</label>
                )}
                {iface.poe && <input type="number" placeholder="PoE мощность (Вт)" value={iface.poePower || ''} onChange={e => updateInterface('outputs', idx, 'poePower', Number(e.target.value))} />}
                <button onClick={() => removeInterface('outputs', idx)}>Удалить</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onClose}>Отмена</button>
          <button onClick={handleSave}>Сохранить</button>
        </div>
      </div>
    </div>
  );
};

export default EditNodeModal;
