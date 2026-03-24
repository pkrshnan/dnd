import { create } from 'zustand';

export type ToolMode = 'pointer' | 'fog-reveal' | 'fog-hide';
export type CombatantType = 'ally' | 'enemy';

export interface Token {
  id: string;
  name: string;
  type: CombatantType;
  color: string;
  imageUrl?: string;
  x: number;
  y: number;
}

export interface Combatant {
  id: string;
  name: string;
  type: CombatantType;
  initiative: number;
  tokenId?: string;
}

interface StoreState {
  // Map
  mapImageUrl: string | null;
  mapWidth: number;
  mapHeight: number;
  mapZoom: number;
  mapPanX: number;
  mapPanY: number;

  // Tool
  activeTool: ToolMode;
  fogBrushSize: number;

  // Fog (for save/load serialization only — canvas is live source of truth)
  fogData: number[] | null;

  // Tokens
  tokens: Token[];

  // Initiative
  combatants: Combatant[];
  currentTurnIndex: number;
  combatActive: boolean;

  // Map actions
  setMapImage: (url: string, width: number, height: number) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;

  // Tool actions
  setActiveTool: (tool: ToolMode) => void;
  setFogBrushSize: (size: number) => void;
  setFogData: (data: number[] | null) => void;

  // Token actions
  addToken: (token: Token) => void;
  updateToken: (id: string, updates: Partial<Token>) => void;
  removeToken: (id: string) => void;

  // Combatant actions
  addCombatant: (combatant: Combatant) => void;
  updateCombatant: (id: string, updates: Partial<Combatant>) => void;
  removeCombatant: (id: string) => void;
  nextTurn: () => void;
  startCombat: () => void;
  endCombat: () => void;
}

const loadPersistedState = () => {
  try {
    const raw = localStorage.getItem('dnd-session');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
};

const persisted = loadPersistedState();

export const useStore = create<StoreState>((set, get) => ({
  mapImageUrl: persisted?.mapImageUrl ?? null,
  mapWidth: persisted?.mapWidth ?? 0,
  mapHeight: persisted?.mapHeight ?? 0,
  mapZoom: persisted?.mapZoom ?? 1,
  mapPanX: persisted?.mapPanX ?? 0,
  mapPanY: persisted?.mapPanY ?? 0,
  activeTool: 'pointer',
  fogBrushSize: persisted?.fogBrushSize ?? 40,
  fogData: persisted?.fogData ?? null,
  tokens: persisted?.tokens ?? [],
  combatants: persisted?.combatants ?? [],
  currentTurnIndex: persisted?.currentTurnIndex ?? 0,
  combatActive: persisted?.combatActive ?? false,

  setMapImage: (url, width, height) => {
    set({ mapImageUrl: url, mapWidth: width, mapHeight: height, mapZoom: 1, mapPanX: 0, mapPanY: 0 });
    persist(get());
  },
  setZoom: (zoom) => {
    set({ mapZoom: Math.min(4, Math.max(0.25, zoom)) });
    persist(get());
  },
  setPan: (x, y) => {
    set({ mapPanX: x, mapPanY: y });
    persist(get());
  },

  setActiveTool: (tool) => set({ activeTool: tool }),
  setFogBrushSize: (size) => {
    set({ fogBrushSize: size });
    persist(get());
  },
  setFogData: (data) => {
    set({ fogData: data });
    persist(get());
  },

  addToken: (token) => {
    set((s) => ({ tokens: [...s.tokens, token] }));
    persist(get());
  },
  updateToken: (id, updates) => {
    set((s) => ({ tokens: s.tokens.map((t) => (t.id === id ? { ...t, ...updates } : t)) }));
    persist(get());
  },
  removeToken: (id) => {
    set((s) => ({ tokens: s.tokens.filter((t) => t.id !== id) }));
    persist(get());
  },

  addCombatant: (combatant) => {
    set((s) => {
      const updated = [...s.combatants, combatant].sort((a, b) => b.initiative - a.initiative);
      return { combatants: updated };
    });
    persist(get());
  },
  updateCombatant: (id, updates) => {
    set((s) => ({ combatants: s.combatants.map((c) => (c.id === id ? { ...c, ...updates } : c)) }));
    persist(get());
  },
  removeCombatant: (id) => {
    set((s) => ({ combatants: s.combatants.filter((c) => c.id !== id) }));
    persist(get());
  },
  nextTurn: () => {
    set((s) => ({
      currentTurnIndex: s.combatants.length === 0 ? 0 : (s.currentTurnIndex + 1) % s.combatants.length,
    }));
    persist(get());
  },
  startCombat: () => {
    set((s) => ({
      combatActive: true,
      combatants: [...s.combatants].sort((a, b) => b.initiative - a.initiative),
      currentTurnIndex: 0,
    }));
    persist(get());
  },
  endCombat: () => {
    set({ combatActive: false, currentTurnIndex: 0 });
    persist(get());
  },
}));

function persist(state: StoreState) {
  try {
    const toSave = {
      mapImageUrl: state.mapImageUrl,
      mapWidth: state.mapWidth,
      mapHeight: state.mapHeight,
      mapZoom: state.mapZoom,
      mapPanX: state.mapPanX,
      mapPanY: state.mapPanY,
      fogBrushSize: state.fogBrushSize,
      fogData: state.fogData,
      tokens: state.tokens,
      combatants: state.combatants,
      currentTurnIndex: state.currentTurnIndex,
      combatActive: state.combatActive,
    };
    localStorage.setItem('dnd-session', JSON.stringify(toSave));
  } catch {
    // ignore quota errors
  }
}
