// src/hooks/useProjectsDb.ts
import { useEffect, useState } from 'react';
import { db } from '../db';

export const useProjectsDb = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.projects.toArray().then((p: any) => {
      setProjects(p);
      setLoading(false);
    });
  }, []);

  const addProject = async (project: any) => {
    await db.projects.add(project);
    setProjects((prev: any) => [...prev, project]);
  };

  const updateProject = async (id: string, updates: any) => {
    await db.projects.update(id, updates);
    setProjects((prev: any) => prev.map((p: any) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProject = async (id: string) => {
    await db.projects.delete(id);
    setProjects((prev: any) => prev.filter((p: any) => p.id !== id));
  };

  return { projects, loading, addProject, updateProject, deleteProject };
};
