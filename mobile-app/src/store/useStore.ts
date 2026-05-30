import { create } from 'zustand';

interface User {
  id: string;
  phone: string;
  name?: string;
  partnerId?: string;
  coupleId?: string;
  relationshipMode?: 'SOLO' | 'COUPLE' | 'NONE';
  pushToken?: string;
}

interface AppState {
  user: User | null;
  partner: User | null;
  token: string | null;
  relationshipMode: 'SOLO' | 'COUPLE' | 'NONE';
  setUser: (user: User | null) => void;
  setPartner: (partner: User | null) => void;
  setToken: (token: string | null) => void;
  setRelationshipMode: (mode: 'SOLO' | 'COUPLE' | 'NONE') => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  partner: null,
  token: null,
  relationshipMode: 'NONE',
  setUser: (user) => set({ user }),
  setPartner: (partner) => set({ partner }),
  setToken: (token) => set({ token }),
  setRelationshipMode: (mode) => set({ relationshipMode: mode }),
  logout: () => set({ user: null, partner: null, token: null, relationshipMode: 'NONE' }),
}));
