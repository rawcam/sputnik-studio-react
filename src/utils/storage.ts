// src/utils/storage.ts
import { db } from '../db';

export const saveProjectToDb = async (project: any) => {
  await db.projects.put(project);
};

export const loadProjectFromDb = async (id: string) => {
  return await db.projects.get(id);
};

export const getAllProjectsFromDb = async () => {
  return await db.projects.toArray();
};

export const deleteProjectFromDb = async (id: string) => {
  await db.projects.delete(id);
};

// Исправлены неявные any в колбэках
export const migrateLocalStorageToDb = async () => {
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith('flow_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        await db.projects.put({ id: key, ...data });
      } catch (e) {
        console.warn('Migration failed for', key);
      }
    }
  }
};
