import { create } from 'zustand';
import type { PermitApplication } from '../types/permit.types';

interface PermitsState {
  permitList: PermitApplication[];
  nextCursor: string | null;
  totalCount: number;
  selectedPermit: PermitApplication | null;
  isLoading: boolean;
  setPermitList: (list: PermitApplication[], nextCursor: string | null, total: number) => void;
  setSelectedPermit: (permit: PermitApplication | null) => void;
  setLoading: (loading: boolean) => void;
  upsertPermit: (permit: PermitApplication) => void;
}

export const usePermitsStore = create<PermitsState>()((set) => ({
  permitList: [],
  nextCursor: null,
  totalCount: 0,
  selectedPermit: null,
  isLoading: false,

  setPermitList: (list, nextCursor, total) =>
    set({ permitList: list, nextCursor, totalCount: total }),

  setSelectedPermit: (permit) =>
    set({ selectedPermit: permit }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  upsertPermit: (permit) =>
    set((state) => {
      const existingIndex = state.permitList.findIndex((p) => p.id === permit.id);
      if (existingIndex >= 0) {
        const updated = [...state.permitList];
        updated[existingIndex] = permit;
        return { permitList: updated };
      }
      return { permitList: [permit, ...state.permitList] };
    }),
}));
