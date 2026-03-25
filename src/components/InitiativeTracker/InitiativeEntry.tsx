import { useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import type { Combatant } from '../../store/useStore';
import { SpellSlotPanel } from './SpellSlotPanel';

interface Props {
  combatant: Combatant;
  isActive: boolean;
  onRemove: () => void;
}

function getHpBarColor(hp: number, maxHp: number): string {
  const pct = maxHp > 0 ? hp / maxHp : 0;
  if (pct > 0.5) return '#4caf7a';
  if (pct > 0.25) return '#c9a84c';
  return '#c94c4c';
}

export function InitiativeEntry({ combatant, isActive, onRemove }: Props) {
  const updateCombatant = useStore((s) => s.updateCombatant);
  const setConcentration = useStore((s) => s.setConcentration);
  const isAlly = combatant.type === 'ally';
  const accentColor = isAlly ? 'var(--ally-color)' : 'var(--enemy-color)';

  const [spellSlotsExpanded, setSpellSlotsExpanded] = useState(false);
  const [editingConcentration, setEditingConcentration] = useState(false);
  const [concentrationInput, setConcentrationInput] = useState(combatant.concentrationSpell ?? '');

  const hasHpBar = typeof combatant.maxHp === 'number' && combatant.maxHp > 0;
  const isDead = typeof combatant.hp === 'number' && combatant.hp <= 0;
  const showDeathSaves = isDead && hasHpBar;

  const hp = combatant.hp ?? 0;
  const maxHp = combatant.maxHp ?? 1;
  const tempHp = combatant.tempHp ?? 0;

  const hpFraction = hasHpBar ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
  const tempFraction =
    hasHpBar && tempHp > 0 ? Math.min(1 - hpFraction, tempHp / maxHp) : 0;
  const hpBarColor = hasHpBar ? getHpBarColor(hp, maxHp) : '#4caf7a';

  const deathSaves = combatant.deathSaves ?? { successes: 0, failures: 0 };
  const isStabilized = deathSaves.successes >= 3;
  const isDeadFromSaves = deathSaves.failures >= 3;

  const toggleSuccess = useCallback(
    (index: number) => {
      const current = combatant.deathSaves ?? { successes: 0, failures: 0 };
      const newVal = current.successes === index + 1 ? index : index + 1;
      updateCombatant(combatant.id, {
        deathSaves: { ...current, successes: newVal },
      });
    },
    [combatant.id, combatant.deathSaves, updateCombatant]
  );

  const toggleFailure = useCallback(
    (index: number) => {
      const current = combatant.deathSaves ?? { successes: 0, failures: 0 };
      const newVal = current.failures === index + 1 ? index : index + 1;
      updateCombatant(combatant.id, {
        deathSaves: { ...current, failures: newVal },
      });
    },
    [combatant.id, combatant.deathSaves, updateCombatant]
  );

  const handleConcentrationToggle = useCallback(() => {
    if (combatant.concentrating) {
      setConcentration(combatant.id, false);
      setEditingConcentration(false);
    } else {
      setEditingConcentration(true);
      setConcentrationInput('');
    }
  }, [combatant.id, combatant.concentrating, setConcentration]);

  const handleConcentrationConfirm = useCallback(() => {
    setConcentration(combatant.id, true, concentrationInput || undefined);
    setEditingConcentration(false);
  }, [combatant.id, concentrationInput, setConcentration]);

  const hasSpellSlots =
    combatant.isSpellcaster ||
    (combatant.spellSlots && Object.keys(combatant.spellSlots).length > 0);

  return (
    <div
      className={`initiative-entry ${isActive ? 'active' : ''} ${spellSlotsExpanded ? 'spell-expanded' : ''}`}
      style={
        isActive
          ? {
              borderColor: 'var(--accent-gold)',
              boxShadow: `0 0 12px var(--accent-gold-glow), inset 0 0 0 1px var(--accent-gold-dim)`,
            }
          : { borderColor: 'var(--border)' }
      }
    >
      {/* Main row */}
      <div className="initiative-entry-main">
        {/* Type strip */}
        <div className="entry-strip" style={{ background: accentColor }} />

        {/* Initiative badge */}
        <div
          className="entry-initiative"
          style={{ color: isActive ? 'var(--accent-gold)' : accentColor }}
        >
          {combatant.initiative}
        </div>

        {/* Name + HP area */}
        <div className="entry-info" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <div className="entry-name">{combatant.name}</div>
            {combatant.concentrating && (
              <button
                className="concentration-badge"
                title={
                  combatant.concentrationSpell
                    ? `Concentrating: ${combatant.concentrationSpell} — click to clear`
                    : 'Concentrating — click to clear'
                }
                onClick={handleConcentrationToggle}
              >
                ⊙ CON
              </button>
            )}
          </div>
          <div
            className="entry-type"
            style={{ color: isAlly ? 'var(--ally-color)' : 'var(--enemy-color)' }}
          >
            {isAlly ? 'Ally' : 'Enemy'}
          </div>

          {editingConcentration && (
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              <input
                autoFocus
                type="text"
                placeholder="Spell name (optional)"
                value={concentrationInput}
                onChange={(e) => setConcentrationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConcentrationConfirm();
                  if (e.key === 'Escape') setEditingConcentration(false);
                }}
                style={{
                  flex: 1,
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--accent-gold-dim)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  padding: '2px 6px',
                  fontSize: 11,
                }}
              />
              <button
                onClick={handleConcentrationConfirm}
                style={{
                  background: 'var(--accent-gold-dim)',
                  color: 'var(--accent-gold)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px 6px',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                ✓
              </button>
              <button
                onClick={() => setEditingConcentration(false)}
                style={{
                  background: 'transparent',
                  color: 'var(--text-dim)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px 6px',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          )}

          {hasHpBar && !showDeathSaves && (
            <div style={{ marginTop: 5 }}>
              <div
                title={`HP: ${hp} / ${maxHp}${tempHp > 0 ? ` (+${tempHp} temp)` : ''}`}
                style={{
                  width: '100%',
                  height: 5,
                  borderRadius: 3,
                  background: 'rgba(0,0,0,0.4)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${hpFraction * 100}%`,
                    background: hpBarColor,
                    borderRadius: 3,
                    transition: 'width 0.2s',
                  }}
                />
                {tempFraction > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${hpFraction * 100}%`,
                      top: 0,
                      height: '100%',
                      width: `${tempFraction * 100}%`,
                      background: '#5b9bd5',
                      borderRadius: 3,
                    }}
                  />
                )}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>
                {hp} / {maxHp} HP{tempHp > 0 ? ` (+${tempHp} temp)` : ''}
              </div>
            </div>
          )}

          {showDeathSaves && (
            <div style={{ marginTop: 5 }}>
              {isDeadFromSaves ? (
                <span style={{ fontSize: 11, color: 'var(--enemy-color)', fontWeight: 700 }}>
                  💀 Dead
                </span>
              ) : isStabilized ? (
                <span style={{ fontSize: 11, color: 'var(--ally-color)', fontWeight: 700 }}>
                  ✓ Stable
                </span>
              ) : (
                <>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>
                    Unconscious — Death Saves
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, color: '#4caf7a', width: 16 }}>✓</span>
                    {[0, 1, 2].map((i) => (
                      <button
                        key={i}
                        onClick={() => toggleSuccess(i)}
                        title={`Success ${i + 1}`}
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 3,
                          border: '1px solid #4caf7a',
                          background: deathSaves.successes > i ? '#4caf7a' : 'transparent',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          color: deathSaves.successes > i ? '#fff' : 'transparent',
                        }}
                      >
                        ✓
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ fontSize: 10, color: 'var(--enemy-color)', width: 16 }}>✗</span>
                    {[0, 1, 2].map((i) => (
                      <button
                        key={i}
                        onClick={() => toggleFailure(i)}
                        title={`Failure ${i + 1}`}
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 3,
                          border: '1px solid var(--enemy-color)',
                          background: deathSaves.failures > i ? 'var(--enemy-color)' : 'transparent',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          color: deathSaves.failures > i ? '#fff' : 'transparent',
                        }}
                      >
                        ✗
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right side button group */}
        <div className="entry-right-buttons">
          {!combatant.concentrating && !editingConcentration && (
            <button
              className="entry-action-btn"
              title="Start concentrating on a spell"
              onClick={handleConcentrationToggle}
            >
              ⊙
            </button>
          )}

          <button
            className={`entry-action-btn spell-toggle-btn ${spellSlotsExpanded ? 'expanded' : ''} ${hasSpellSlots ? 'has-slots' : ''}`}
            title={spellSlotsExpanded ? 'Hide spell slots' : 'Show spell slots'}
            onClick={() => setSpellSlotsExpanded((v) => !v)}
          >
            🔮
          </button>

          {isActive && (
            <div className="entry-active-indicator" style={{ color: 'var(--accent-gold)' }}>
              ▶
            </div>
          )}

          <button
            className="entry-remove"
            onClick={onRemove}
            title="Remove from initiative"
          >
            ✕
          </button>
        </div>
      </div>

      {spellSlotsExpanded && (
        <SpellSlotPanel
          combatantId={combatant.id}
          isAlly={isAlly}
          spellSlots={combatant.spellSlots ?? {}}
          pactSlotLevel={combatant.pactSlotLevel}
        />
      )}
    </div>
  );
}
