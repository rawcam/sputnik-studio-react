// src/db/index.ts
import Dexie, { Table } from 'dexie';

export interface Project {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
  createdAt: number;
  updatedAt: number;
}

export class SputnikDB extends Dexie {
  projects!: Table<Project>;

  constructor() {
    super('SputnikDB');
    this.version(1).stores({
      projects: 'id, name, updatedAt',
    });
  }
}

export const db = new SputnikDB();
