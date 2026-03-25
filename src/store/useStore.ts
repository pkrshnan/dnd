import { create } from 'zustand';

export type ToolMode = 'pointer' | 'fog-reveal' | 'fog-hide' | 'aoe-place';
export type CombatantType = 'ally' | 'enemy';
export type AoeShape = 'circle' | 'cone' | 'line' | 'cube';
export type NoteSection = 'session' | 'npcs' | 'lore' | 'quests';

export interface AoeTemplate {
  id: string;
  shape: AoeShape;
  x: number;       // position on map (center), in map pixels
  y: number;
  size: number;    // feet (radius for circle, length for cone/line, side for cube)
  angle: number;   // rotation in degrees (0 = pointing right)
  color: string;   // hex color
  label?: string;  // optional spell name label
}

export interface Token {
  id: string;
  name: string;
  type: CombatantType;
  color: string;
  imageUrl?: string;
  x: number;
  y: number;
  hp?: number;
  maxHp?: number;
  tempHp?: number;
  conditions?: string[];
  exhaustionLevel?: number;
}

export interface SpellSlot {
  max: number;
  used: number;
}

export interface Combatant {
  id: string;
  name: string;
  type: CombatantType;
  initiative: number;
  tokenId?: string;
  hp?: number;
  maxHp?: number;
  tempHp?: number;
  deathSaves?: { successes: number; failures: number };
  conditions?: string[];
  exhaustionLevel?: number;
  // Spell slots
  spellSlots?: Record<string, SpellSlot>; // key: "1"-"9" or "pact"
  isSpellcaster?: boolean;
  pactSlotLevel?: number; // Warlock pact magic slot level
  // Concentration
  concentrating?: boolean;
  concentrationSpell?: string;
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
  // Incremented after each brush stroke so components can react to fog changes
  fogRevision: number;

  // AoE Templates
  aoeTemplates: AoeTemplate[];

  // Tokens
  tokens: Token[];

  // Initiative
  combatants: Combatant[];
  currentTurnIndex: number;
  combatActive: boolean;

  // Notes
  notes: {
    session: string;
    npcs: string;
    lore: string;
    quests: string;
  };

  // Map actions
  setMapImage: (url: string, width: number, height: number) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;

  // Tool actions
  setActiveTool: (tool: ToolMode) => void;
  setFogBrushSize: (size: number) => void;
  setFogData: (data: number[] | null) => void;
  incrementFogRevision: () => void;

  // AoE Template actions
  addAoeTemplate: (template: AoeTemplate) => void;
  updateAoeTemplate: (id: string, updates: Partial<AoeTemplate>) => void;
  removeAoeTemplate: (id: string) => void;

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

  // Notes actions
  updateNote: (section: NoteSection, content: string) => void;

  // Spell slot actions
  setSpellSlots: (combatantId: string, slots: Record<string, SpellSlot>) => void;
  useSpellSlot: (combatantId: string, level: string) => void;
  recoverSpellSlot: (combatantId: string, level: string) => void;
  recoverSpellSlots: (combatantId: string, type: 'long-rest' | 'short-rest') => void;

  // Concentration actions
  setConcentration: (combatantId: string, concentrating: boolean, spell?: string) => void;
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

const defaultNotes = { session: '', npcs: '', lore: '', quests: '' };

export const useStore = create<StoreState>((set, get) => ({
  mapImageUrl: persisted?.mapImageUrl ?? null,
  mapWidth: persisted?.mapWidth ?? 0,
  mapHeight: persisted?.mapHeight ?? 0,
  mapZoom: persisted?.mapZoom ?? 1,
  mapPanX: persisted?.mapPanX ?? 0,
  mapPanY: persisted?.mapPanY ?? 0,
  aoeTemplates: persisted?.aoeTemplates ?? [],
  activeTool: 'pointer',
  fogBrushSize: persisted?.fogBrushSize ?? 40,
  fogData: persisted?.fogData ?? null,
  fogRevision: 0,
  tokens: persisted?.tokens ?? [],
  combatants: persisted?.combatants ?? [],
  currentTurnIndex: persisted?.currentTurnIndex ?? 0,
  combatActive: persisted?.combatActive ?? false,
  notes: persisted?.notes ?? defaultNotes,

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
  incrementFogRevision: () => set((s) => ({ fogRevision: s.fogRevision + 1 })),

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

  addAoeTemplate: (template) => {
    set((s) => ({ aoeTemplates: [...s.aoeTemplates, template] }));
    persist(get());
  },
  updateAoeTemplate: (id, updates) => {
    set((s) => ({ aoeTemplates: s.aoeTemplates.map((t) => (t.id === id ? { ...t, ...updates } : t)) }));
    persist(get());
  },
  removeAoeTemplate: (id) => {
    set((s) => ({ aoeTemplates: s.aoeTemplates.filter((t) => t.id !== id) }));
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

  updateNote: (section, content) => {
    set((s) => ({ notes: { ...s.notes, [section]: content } }));
    persist(get());
  },

  setSpellSlots: (combatantId, slots) => {
    set((s) => ({
      combatants: s.combatants.map((c) =>
        c.id === combatantId ? { ...c, spellSlots: slots, isSpellcaster: true } : c
      ),
    }));
    persist(get());
  },

  useSpellSlot: (combatantId, level) => {
    set((s) => ({
      combatants: s.combatants.map((c) => {
        if (c.id !== combatantId || !c.spellSlots) return c;
        const slot = c.spellSlots[level];
        if (!slot || slot.used >= slot.max) return c;
        return {
          ...c,
          spellSlots: {
            ...c.spellSlots,
            [level]: { ...slot, used: slot.used + 1 },
          },
        };
      }),
    }));
    persist(get());
  },

  recoverSpellSlot: (combatantId, level) => {
    set((s) => ({
      combatants: s.combatants.map((c) => {
        if (c.id !== combatantId || !c.spellSlots) return c;
        const slot = c.spellSlots[level];
        if (!slot || slot.used <= 0) return c;
        return {
          ...c,
          spellSlots: {
            ...c.spellSlots,
            [level]: { ...slot, used: slot.used - 1 },
          },
        };
      }),
    }));
    persist(get());
  },

  recoverSpellSlots: (combatantId, type) => {
    set((s) => ({
      combatants: s.combatants.map((c) => {
        if (c.id !== combatantId || !c.spellSlots) return c;
        const newSlots: Record<string, SpellSlot> = {};
        for (const [level, slot] of Object.entries(c.spellSlots)) {
          if (type === 'long-rest') {
            // Long rest: recover all slots
            newSlots[level] = { ...slot, used: 0 };
          } else {
            // Short rest: only recover pact slots
            if (level === 'pact') {
              newSlots[level] = { ...slot, used: 0 };
            } else {
              newSlots[level] = slot;
            }
          }
        }
        return { ...c, spellSlots: newSlots };
      }),
    }));
    persist(get());
  },

  setConcentration: (combatantId, concentrating, spell) => {
    set((s) => ({
      combatants: s.combatants.map((c) =>
        c.id === combatantId
          ? { ...c, concentrating, concentrationSpell: concentrating ? (spell ?? c.concentrationSpell) : undefined }
          : c
      ),
    }));
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
      aoeTemplates: state.aoeTemplates,
      notes: state.notes,
    };
    localStorage.setItem('dnd-session', JSON.stringify(toSave));
  } catch {
    // ignore quota errors
  }
}
