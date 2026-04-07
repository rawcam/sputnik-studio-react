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
  currentSpecId: string | null;
}

const loadInitialState = (): SpecificationsState => {
  const saved = localStorage.getItem('specifications_data');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        list: parsed.list || [],
        currentSpecId: parsed.currentSpecId || null,
      };
    } catch (e) {}
  }
  return { list: [], currentSpecId: null };
};

const initialState: SpecificationsState = loadInitialState();

const specificationsSlice = createSlice({
  name: 'specifications',
  initialState,
  reducers: {
    setSpecifications: (state, action: PayloadAction<Specification[]>) => {
      state.list = action.payload;
    },
    addSpecification: (state, action: PayloadAction<Specification>) => {
      state.list.push(action.payload);
      localStorage.setItem('specifications_data', JSON.stringify({ list: state.list, currentSpecId: state.currentSpecId }));
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
        localStorage.setItem('specifications_data', JSON.stringify({ list: state.list, currentSpecId: state.currentSpecId }));
      }
    },
    deleteSpecification: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(s => s.id !== action.payload);
      if (state.currentSpecId === action.payload) {
        state.currentSpecId = null;
      }
      localStorage.setItem('specifications_data', JSON.stringify({ list: state.list, currentSpecId: state.currentSpecId }));
    },
    setCurrentSpecId: (state, action: PayloadAction<string | null>) => {
      state.currentSpecId = action.payload;
      localStorage.setItem('specifications_data', JSON.stringify({ list: state.list, currentSpecId: state.currentSpecId }));
    },
    updateSpecificationRows: (state, action: PayloadAction<{ id: string; rows: Row[] }>) => {
      const { id, rows } = action.payload;
      const index = state.list.findIndex(s => s.id === id);
      if (index !== -1) {
        state.list[index].rows = rows;
        state.list[index].updatedAt = new Date().toISOString();
        localStorage.setItem('specifications_data', JSON.stringify({ list: state.list, currentSpecId: state.currentSpecId }));
      }
    },
    migrateFromOldStorage: (state) => {
      const oldData = localStorage.getItem('specification_data_v17');
      if (oldData && state.list.length === 0) {
        try {
          const parsed = JSON.parse(oldData);
          const rows = parsed.rows || [];
          if (rows.length > 0) {
            const now = new Date().toISOString();
            const migratedSpec: Specification = {
              id: 'legacy',
              name: 'Старая спецификация',
              projectId: null,
              createdAt: now,
              updatedAt: now,
              rows: rows,
            };
            state.list.push(migratedSpec);
            localStorage.setItem('specifications_data', JSON.stringify({ list: state.list, currentSpecId: state.currentSpecId }));
          }
        } catch (e) {}
      }
    },
  },
});

export const {
  setSpecifications,
  addSpecification,
  updateSpecification,
  deleteSpecification,
  setCurrentSpecId,
  updateSpecificationRows,
  migrateFromOldStorage,
} = specificationsSlice.actions;

export default specificationsSlice.reducer;
