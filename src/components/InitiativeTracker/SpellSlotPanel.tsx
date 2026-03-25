import { useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import type { SpellSlot } from '../../store/useStore';
import { SPELL_SLOT_PRESETS, LEVEL_LABELS } from '../../utils/spellSlotPresets';

interface Props {
  combatantId: string;
  isAlly: boolean;
  spellSlots: Record<string, SpellSlot>;
  pactSlotLevel?: number;
}

const SPELL_LEVELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function SpellSlotPanel({ combatantId, isAlly, spellSlots, pactSlotLevel }: Props) {
  const [showConfigure, setShowConfigure] = useState(false);
  const [configValues, setConfigValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    SPELL_LEVELS.forEach((lvl) => {
      init[lvl] = String(spellSlots[lvl]?.max ?? 0);
    });
    init['pact'] = String(spellSlots['pact']?.max ?? 0);
    return init;
  });
  const [pactLevelInput, setPactLevelInput] = useState(String(pactSlotLevel ?? 1));

  const useSpellSlot = useStore((s) => s.useSpellSlot);
  const recoverSpellSlot = useStore((s) => s.recoverSpellSlot);
  const recoverSpellSlots = useStore((s) => s.recoverSpellSlots);
  const setSpellSlots = useStore((s) => s.setSpellSlots);
  const updateCombatant = useStore((s) => s.updateCombatant);

  const dotColor = isAlly ? 'var(--ally-color)' : 'var(--enemy-color)';
  const dotGlow = isAlly ? 'var(--ally-glow)' : 'var(--enemy-glow)';

  const handleDotClick = useCallback(
    (level: string, dotIndex: number) => {
      const slot = spellSlots[level];
      if (!slot) return;
      // dotIndex 0..(max-1): if index < (max - used) => it's available (clicking uses it)
      // available dots are first, used dots are last
      const availableCount = slot.max - slot.used;
      if (dotIndex < availableCount) {
        useSpellSlot(combatantId, level);
      } else {
        recoverSpellSlot(combatantId, level);
      }
    },
    [combatantId, spellSlots, useSpellSlot, recoverSpellSlot]
  );

  const applyConfig = useCallback(() => {
    const newSlots: Record<string, SpellSlot> = {};
    SPELL_LEVELS.forEach((lvl) => {
      const max = parseInt(configValues[lvl] ?? '0', 10) || 0;
      if (max > 0) {
        const existing = spellSlots[lvl];
        newSlots[lvl] = { max, used: Math.min(existing?.used ?? 0, max) };
      }
    });
    const pactMax = parseInt(configValues['pact'] ?? '0', 10) || 0;
    if (pactMax > 0) {
      const existing = spellSlots['pact'];
      newSlots['pact'] = { max: pactMax, used: Math.min(existing?.used ?? 0, pactMax) };
    }
    setSpellSlots(combatantId, newSlots);
    const pactLvl = parseInt(pactLevelInput, 10) || 1;
    updateCombatant(combatantId, { pactSlotLevel: pactLvl });
    setShowConfigure(false);
  }, [combatantId, configValues, pactLevelInput, spellSlots, setSpellSlots, updateCombatant]);

  const applyPreset = useCallback(
    (presetLabel: string) => {
      const preset = SPELL_SLOT_PRESETS.find((p) => p.label === presetLabel);
      if (!preset) return;
      const newConfig: Record<string, string> = {};
      SPELL_LEVELS.forEach((lvl) => {
        newConfig[lvl] = String(preset.slots[lvl] ?? 0);
      });
      newConfig['pact'] = String(preset.slots['pact'] ?? 0);
      setConfigValues(newConfig);
      if (preset.pactLevel) {
        setPactLevelInput(String(preset.pactLevel));
      }
    },
    []
  );

  const activeSlotLevels = [...SPELL_LEVELS, 'pact'].filter(
    (lvl) => spellSlots[lvl] && spellSlots[lvl].max > 0
  );

  return (
    <div className="spell-slot-panel">
      {/* Slot rows */}
      {!showConfigure && (
        <div className="spell-slot-rows">
          {activeSlotLevels.length === 0 && (
            <div className="spell-slot-empty-hint">
              No slots configured. Click Configure to set up spell slots.
            </div>
          )}
          {activeSlotLevels.map((level) => {
            const slot = spellSlots[level];
            if (!slot || slot.max === 0) return null;
            const available = slot.max - slot.used;
            const isPact = level === 'pact';
            const pactLvl = isPact ? (pactSlotLevel ?? 1) : null;

            return (
              <div key={level} className="spell-level-row">
                <div className="spell-level-label">
                  {isPact ? `Pact${pactLvl ? ` (L${pactLvl})` : ''}` : LEVEL_LABELS[level]}
                </div>
                <div className="spell-dots">
                  {Array.from({ length: slot.max }).map((_, i) => {
                    const isAvailable = i < available;
                    return (
                      <button
                        key={i}
                        className={`spell-dot ${isAvailable ? 'available' : 'used'}`}
                        title={isAvailable ? 'Click to use slot' : 'Click to recover slot'}
                        onClick={() => handleDotClick(level, i)}
                        style={
                          isAvailable
                            ? {
                                background: dotColor,
                                boxShadow: `0 0 5px ${dotGlow}`,
                                border: `1px solid ${dotColor}`,
                              }
                            : {
                                background: 'transparent',
                                border: '1px solid var(--border-light)',
                              }
                        }
                      />
                    );
                  })}
                </div>
                <div className="spell-slot-count">
                  {available}/{slot.max}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Configure form */}
      {showConfigure && (
        <div className="spell-configure-form">
          <div className="spell-configure-preset-row">
            <label className="spell-configure-label">Import preset:</label>
            <select
              className="spell-configure-select"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) applyPreset(e.target.value);
              }}
            >
              <option value="">— choose —</option>
              {SPELL_SLOT_PRESETS.map((p) => (
                <option key={p.label} value={p.label}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="spell-configure-grid">
            {SPELL_LEVELS.map((lvl) => (
              <div key={lvl} className="spell-configure-row">
                <label className="spell-configure-slot-label">{LEVEL_LABELS[lvl]}</label>
                <input
                  type="number"
                  min={0}
                  max={9}
                  className="spell-configure-input"
                  value={configValues[lvl] ?? '0'}
                  onChange={(e) =>
                    setConfigValues((prev) => ({ ...prev, [lvl]: e.target.value }))
                  }
                />
              </div>
            ))}
            <div className="spell-configure-row">
              <label className="spell-configure-slot-label">Pact</label>
              <input
                type="number"
                min={0}
                max={4}
                className="spell-configure-input"
                value={configValues['pact'] ?? '0'}
                onChange={(e) =>
                  setConfigValues((prev) => ({ ...prev, pact: e.target.value }))
                }
              />
            </div>
            {parseInt(configValues['pact'] ?? '0') > 0 && (
              <div className="spell-configure-row">
                <label className="spell-configure-slot-label">Pact Lvl</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  className="spell-configure-input"
                  value={pactLevelInput}
                  onChange={(e) => setPactLevelInput(e.target.value)}
                />
              </div>
            )}
          </div>

          <button className="spell-btn spell-btn-done" onClick={applyConfig}>
            ✓ Done
          </button>
        </div>
      )}

      {/* Bottom action buttons */}
      {!showConfigure && (
        <div className="spell-slot-actions">
          <button
            className="spell-btn spell-btn-configure"
            onClick={() => {
              // Sync config values with current slots
              const newConfig: Record<string, string> = {};
              SPELL_LEVELS.forEach((lvl) => {
                newConfig[lvl] = String(spellSlots[lvl]?.max ?? 0);
              });
              newConfig['pact'] = String(spellSlots['pact']?.max ?? 0);
              setConfigValues(newConfig);
              setPactLevelInput(String(pactSlotLevel ?? 1));
              setShowConfigure(true);
            }}
          >
            ⚙ Configure
          </button>
          <button
            className="spell-btn spell-btn-rest"
            title="Long Rest: recover all spell slots"
            onClick={() => recoverSpellSlots(combatantId, 'long-rest')}
          >
            Long Rest
          </button>
          <button
            className="spell-btn spell-btn-rest"
            title="Short Rest: recover pact magic slots only"
            onClick={() => recoverSpellSlots(combatantId, 'short-rest')}
          >
            Short Rest
          </button>
        </div>
      )}
    </div>
  );
}
