// src/store/specificationsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Row } from '../pages/SpecificationPage';

export interface Specification {
  id: string;
  name: string;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
  rows: Row[];
}

interface SpecificationsState {
  list: Specification[];
}

// Загрузка из localStorage при инициализации
const loadInitialState = (): SpecificationsState => {
  const saved = localStorage.getItem('specifications_redax');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { list: parsed.list || [] };
    } catch (e) {}
  }
  // Перенос старой спецификации из старого ключа
  const oldData = localStorage.getItem('specification_data_v17');
  if (oldData) {
    try {
      const parsed = JSON.parse(oldData);
      const rows = parsed.rows || [];
      if (rows.length > 0) {
        const now = new Date().toISOString();
        const legacySpec: Specification = {
          id: 'legacy',
          name: 'Старая спецификация',
          projectId: null,
          createdAt: now,
          updatedAt: now,
          rows: rows,
        };
        return { list: [legacySpec] };
      }
    } catch (e) {}
  }
  return { list: [] };
};

const initialState: SpecificationsState = loadInitialState();

const specificationsSlice = createSlice({
  name: 'specifications',
  initialState,
  reducers: {
    setSpecifications: (state, action: PayloadAction<Specification[]>) => {
      state.list = action.payload;
      localStorage.setItem('specifications_redax', JSON.stringify({ list: state.list }));
    },
    addSpecification: (state, action: PayloadAction<Omit<Specification, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newId = Date.now().toString();
      const now = new Date().toISOString();
      const newSpec: Specification = {
        ...action.payload,
        id: newId,
        createdAt: now,
        updatedAt: now,
        rows: action.payload.rows || [],
      };
      state.list.push(newSpec);
      localStorage.setItem('specifications_redax', JSON.stringify({ list: state.list }));
    },
    updateSpecification: (state, action: PayloadAction<{ id: string; updates: Partial<Omit<Specification, 'id' | 'createdAt'>> }>) => {
      const { id, updates } = action.payload;
      const index = state.list.findIndex(s => s.id === id);
      if (index !== -1) {
        state.list[index] = {
          ...state.list[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('specifications_redax', JSON.stringify({ list: state.list }));
      }
    },
    deleteSpecification: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(s => s.id !== action.payload);
      localStorage.setItem('specifications_redax', JSON.stringify({ list: state.list }));
    },
    updateSpecificationRows: (state, action: PayloadAction<{ id: string; rows: Row[] }>) => {
      const { id, rows } = action.payload;
      const index = state.list.findIndex(s => s.id === id);
      if (index !== -1) {
        state.list[index].rows = rows;
        state.list[index].updatedAt = new Date().toISOString();
        localStorage.setItem('specifications_redax', JSON.stringify({ list: state.list }));
      }
    },
  },
});

export const {
  setSpecifications,
  addSpecification,
  updateSpecification,
  deleteSpecification,
  updateSpecificationRows,
} = specificationsSlice.actions;

export default specificationsSlice.reducer;
