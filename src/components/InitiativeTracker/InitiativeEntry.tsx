import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import type { Combatant } from '../../store/useStore';
import { CONDITIONS, getCondition } from '../../utils/conditions';

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
  const isAlly = combatant.type === 'ally';
  const accentColor = isAlly ? 'var(--ally-color)' : 'var(--enemy-color)';

  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const activeConditions = combatant.conditions ?? [];

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  const handleToggleCondition = useCallback((conditionId: string) => {
    const current = combatant.conditions ?? [];
    let updated: string[];
    if (current.includes(conditionId)) {
      updated = current.filter((c) => c !== conditionId);
      if (conditionId === 'exhaustion') {
        updateCombatant(combatant.id, { conditions: updated, exhaustionLevel: undefined });
        return;
      }
    } else {
      updated = [...current, conditionId];
    }
    updateCombatant(combatant.id, { conditions: updated });
  }, [combatant.id, combatant.conditions, updateCombatant]);

  const handleRemoveCondition = useCallback((conditionId: string) => {
    const current = combatant.conditions ?? [];
    const updated = current.filter((c) => c !== conditionId);
    if (conditionId === 'exhaustion') {
      updateCombatant(combatant.id, { conditions: updated, exhaustionLevel: undefined });
    } else {
      updateCombatant(combatant.id, { conditions: updated });
    }
  }, [combatant.id, combatant.conditions, updateCombatant]);

  const handleExhaustionLevel = useCallback((level: number) => {
    const current = combatant.conditions ?? [];
    if (level === 0) {
      updateCombatant(combatant.id, {
        conditions: current.filter((c) => c !== 'exhaustion'),
        exhaustionLevel: undefined,
      });
    } else {
      const withExhaustion = current.includes('exhaustion')
        ? current
        : [...current, 'exhaustion'];
      updateCombatant(combatant.id, { conditions: withExhaustion, exhaustionLevel: level });
    }
  }, [combatant.id, combatant.conditions, updateCombatant]);

  const badgeStyle = (color: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    padding: '1px 6px',
    background: color,
    color: '#fff',
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 9999,
    cursor: 'pointer',
    border: 'none',
    lineHeight: '14px',
    whiteSpace: 'nowrap',
    opacity: 0.92,
    letterSpacing: '0.2px',
  });

  const hasHpBar = typeof combatant.maxHp === 'number' && combatant.maxHp > 0;
  const isDead = typeof combatant.hp === 'number' && combatant.hp <= 0;
  const showDeathSaves = isDead && hasHpBar;

  const hp = combatant.hp ?? 0;
  const maxHp = combatant.maxHp ?? 1;
  const tempHp = combatant.tempHp ?? 0;

  const hpFraction = hasHpBar ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
  const tempFraction = hasHpBar && tempHp > 0
    ? Math.min(1 - hpFraction, tempHp / maxHp)
    : 0;
  const hpBarColor = hasHpBar ? getHpBarColor(hp, maxHp) : '#4caf7a';

  const deathSaves = combatant.deathSaves ?? { successes: 0, failures: 0 };
  const isStabilized = deathSaves.successes >= 3;
  const isDeadFromSaves = deathSaves.failures >= 3;

  const toggleSuccess = useCallback((index: number) => {
    const current = combatant.deathSaves ?? { successes: 0, failures: 0 };
    const newVal = current.successes === index + 1 ? index : index + 1;
    updateCombatant(combatant.id, {
      deathSaves: { ...current, successes: newVal },
    });
  }, [combatant.id, combatant.deathSaves, updateCombatant]);

  const toggleFailure = useCallback((index: number) => {
    const current = combatant.deathSaves ?? { successes: 0, failures: 0 };
    const newVal = current.failures === index + 1 ? index : index + 1;
    updateCombatant(combatant.id, {
      deathSaves: { ...current, failures: newVal },
    });
  }, [combatant.id, combatant.deathSaves, updateCombatant]);

  return (
    <div
      className={`initiative-entry ${isActive ? 'active' : ''}`}
      style={
        isActive
          ? {
              borderColor: 'var(--accent-gold)',
              boxShadow: `0 0 12px var(--accent-gold-glow), inset 0 0 0 1px var(--accent-gold-dim)`,
            }
          : { borderColor: 'var(--border)' }
      }
    >
      <div className="entry-strip" style={{ background: accentColor }} />
      <div
        className="entry-initiative"
        style={{ color: isActive ? 'var(--accent-gold)' : accentColor }}
      >
        {combatant.initiative}
      </div>

      <div className="entry-info" style={{ flex: 1, minWidth: 0 }}>
        <div className="entry-name">{combatant.name}</div>
        <div
          className="entry-type"
          style={{ color: isAlly ? 'var(--ally-color)' : 'var(--enemy-color)' }}
        >
          {isAlly ? 'Ally' : 'Enemy'}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            marginTop: activeConditions.length > 0 ? 4 : 2,
            alignItems: 'center',
          }}
        >
          {activeConditions.map((condId) => {
            const cond = getCondition(condId);
            if (!cond) return null;
            const label =
              condId === 'exhaustion' && combatant.exhaustionLevel
                ? `Exhausted Lv.${combatant.exhaustionLevel}`
                : cond.label;
            return (
              <button
                key={condId}
                title={`${cond.label}: ${cond.desc}\nClick to remove`}
                style={badgeStyle(cond.color)}
                onClick={() => handleRemoveCondition(condId)}
              >
                {cond.icon} {label}
              </button>
            );
          })}

          <div style={{ position: 'relative' }}>
            <button
              title="Add condition"
              onClick={() => setPickerOpen((v) => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                lineHeight: 1,
                padding: 0,
              }}
            >
              +
            </button>

            {pickerOpen && (
              <div
                ref={pickerRef}
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  zIndex: 1000,
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '4px 0',
                  boxShadow: 'var(--shadow-lg)',
                  minWidth: 180,
                  maxHeight: 260,
                  overflowY: 'auto',
                }}
              >
                <div
                  style={{
                    padding: '4px 10px',
                    fontSize: 10,
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid var(--border)',
                    marginBottom: 2,
                  }}
                >
                  CONDITIONS
                </div>
                {CONDITIONS.map((cond) => {
                  const isCondActive = activeConditions.includes(cond.id);
                  const isExhaustion = cond.id === 'exhaustion';
                  return (
                    <div key={cond.id}>
                      <label
                        title={cond.desc}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          cursor: 'pointer',
                          fontSize: 12,
                          color: isCondActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          background: isCondActive ? 'rgba(255,255,255,0.05)' : 'none',
                          userSelect: 'none',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isCondActive}
                          onChange={() => handleToggleCondition(cond.id)}
                          style={{
                            accentColor: cond.color,
                            width: 12,
                            height: 12,
                            cursor: 'pointer',
                          }}
                        />
                        <span>{cond.icon}</span>
                        <span style={{ flex: 1 }}>{cond.label}</span>
                      </label>
                      {isExhaustion && isCondActive && (
                        <div style={{ display: 'flex', gap: 3, padding: '2px 10px 4px 28px' }}>
                          {[1, 2, 3, 4, 5, 6].map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => handleExhaustionLevel(lvl)}
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 'var(--radius-sm)',
                                background:
                                  combatant.exhaustionLevel === lvl ? '#8b6914' : 'var(--bg-dark)',
                                border: `1px solid ${combatant.exhaustionLevel === lvl ? '#c9a84c' : 'var(--border-light)'}`,
                                color:
                                  combatant.exhaustionLevel === lvl
                                    ? '#c9a84c'
                                    : 'var(--text-secondary)',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: 0,
                              }}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

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
  );
}
