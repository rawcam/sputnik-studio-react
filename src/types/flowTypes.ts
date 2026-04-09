import { Node, Edge } from 'reactflow';

export interface DeviceNodeData {
  label: string;
  icon: string;
  latency: number;
  power: number;
  poe?: string;
  ethernet?: boolean;
  usb?: boolean;
  color?: string;
  width?: number;
  height?: number;
}

export interface SavedSchema {
  id: string;
  name: string;
  nodes: Node<DeviceNodeData>[];
  edges: Edge[];
}
