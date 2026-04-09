import { Node, Edge } from 'reactflow';

// --- Справочники ---
export type ConnectorType =
  | 'HDMI' | 'DVI' | 'DisplayPort' | 'VGA'
  | 'RJ45' | 'XLR' | 'TRS' | 'RCA'
  | 'USB-C' | 'USB-A' | 'USB-B'
  | 'Phoenix3' | 'Phoenix5'
  | 'PowerCON' | 'IEC'
  | 'Optical' | 'BNC';

export type ProtocolType =
  | 'HDMI' | 'DVI' | 'DisplayPort' | 'VGA'
  | 'Ethernet' | 'Dante' | 'AES67' | 'AVB'
  | 'AnalogAudio' | 'AES3'
  | 'USB2' | 'USB3' | 'USB-C-AltDP'
  | 'Power' | 'PoE';

export interface DeviceInterface {
  id: string;
  name: string;                   // например "HDMI IN 1"
  direction: 'input' | 'output' | 'bidirectional';
  connector: ConnectorType;
  protocol: ProtocolType;
  poe?: boolean;                  // поддерживает ли PoE (только для RJ45)
  poePower?: number;              // потребляемая мощность по PoE (Вт)
  power?: number;                 // потребляемая мощность от сети (Вт)
  voltage?: 'AC' | 'DC';
  pins?: number;                  // для Phoenix разъёмов
}

export interface DeviceNodeData {
  label: string;
  manufacturer?: string;
  model?: string;
  icon: string;
  inputs: DeviceInterface[];
  outputs: DeviceInterface[];
  color?: string;
  width?: number;
  height?: number;
  // общая мощность устройства (сумма по всем входам/выходам)
  totalPowerConsumption?: number;
  totalPoEConsumption?: number;
}

// Данные, которые хранятся в ребре (кабеле)
export interface CableEdgeData {
  cableType: string;              // например "HDMI High Speed" или "Cat6"
  sourceLabel: string;
  targetLabel: string;
  adapter?: string;               // если используется переходник
  length?: number;
  // дополнительные поля при необходимости
}

export interface SavedSchema {
  id: string;
  name: string;
  nodes: Node<DeviceNodeData>[];
  edges: Edge<CableEdgeData>[];
}
