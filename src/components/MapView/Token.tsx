import { useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import type { Token as TokenType } from '../../store/useStore';
import { useDrag } from '../../hooks/useDrag';
import { CONDITIONS, getCondition } from '../../utils/conditions';

const TOKEN_SIZE = 40;

function getTokenLabel(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const firstChar = parts[0][0].toUpperCase();
  const lastPart = parts[parts.length - 1];
  if (/^\d+$/.test(lastPart)) {
    return (firstChar + lastPart).slice(0, 3);
  }
  return (firstChar + lastPart[0]).toUpperCase();
}

function getHpBarColor(hp: number, maxHp: number): string {
  const pct = maxHp > 0 ? hp / maxHp : 0;
  if (pct > 0.5) return '#4caf7a';
  if (pct > 0.25) return '#c9a84c';
  return '#c94c4c';
}

interface Props {
  token: TokenType;
  isActiveTurn: boolean;
}

type MenuAction = null | 'setHp' | 'damage' | 'heal' | 'tempHp';

export function Token({ token, isActiveTurn }: Props) {
  const removeToken = useStore((s) => s.removeToken);
  const updateToken = useStore((s) => s.updateToken);
  const { onPointerDown, onPointerMove, onPointerUp } = useDrag(token.id);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [activeAction, setActiveAction] = useState<MenuAction>(null);
  const [inputVal, setInputVal] = useState('');
  const [maxInputVal, setMaxInputVal] = useState('');
  const [showConditionPicker, setShowConditionPicker] = useState(false);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
    setActiveAction(null);
    setInputVal('');
    setMaxInputVal('');
    setShowConditionPicker(false);
  }, []);

  const handleToggleCondition = useCallback((conditionId: string) => {
    const current = token.conditions ?? [];
    let updated: string[];
    if (current.includes(conditionId)) {
      updated = current.filter((c) => c !== conditionId);
      if (conditionId === 'exhaustion') {
        updateToken(token.id, { conditions: updated, exhaustionLevel: undefined });
        return;
      }
    } else {
      updated = [...current, conditionId];
    }
    updateToken(token.id, { conditions: updated });
  }, [token.id, token.conditions, updateToken]);

  const handleExhaustionLevel = useCallback((level: number) => {
    const current = token.conditions ?? [];
    if (level === 0) {
      updateToken(token.id, {
        conditions: current.filter((c) => c !== 'exhaustion'),
        exhaustionLevel: undefined,
      });
    } else {
      const withExhaustion = current.includes('exhaustion')
        ? current
        : [...current, 'exhaustion'];
      updateToken(token.id, { conditions: withExhaustion, exhaustionLevel: level });
    }
  }, [token.id, token.conditions, updateToken]);

  const handleDelete = useCallback(() => {
    removeToken(token.id);
    setContextMenu(null);
  }, [token.id, removeToken]);

  const closeMenu = useCallback(() => {
    setContextMenu(null);
    setActiveAction(null);
    setInputVal('');
    setMaxInputVal('');
    setShowConditionPicker(false);
  }, []);

  const handleSetHpConfirm = useCallback(() => {
    const newHp = parseInt(inputVal, 10);
    const newMaxHp = parseInt(maxInputVal, 10);
    if (!isNaN(newMaxHp) && newMaxHp > 0) {
      const clampedHp = isNaN(newHp) ? newMaxHp : Math.max(0, Math.min(newHp, newMaxHp));
      updateToken(token.id, { hp: clampedHp, maxHp: newMaxHp });
    }
    closeMenu();
  }, [inputVal, maxInputVal, token.id, updateToken, closeMenu]);

  const handleDamageConfirm = useCallback(() => {
    const dmg = parseInt(inputVal, 10);
    if (!isNaN(dmg) && dmg > 0) {
      const currentHp = token.hp ?? token.maxHp ?? 0;
      const tempHp = token.tempHp ?? 0;
      let remaining = dmg;
      let newTempHp = tempHp;
      if (remaining <= newTempHp) {
        newTempHp -= remaining;
        remaining = 0;
      } else {
        remaining -= newTempHp;
        newTempHp = 0;
      }
      const newHp = Math.max(0, currentHp - remaining);
      updateToken(token.id, { hp: newHp, tempHp: newTempHp });
    }
    closeMenu();
  }, [inputVal, token, updateToken, closeMenu]);

  const handleHealConfirm = useCallback(() => {
    const amount = parseInt(inputVal, 10);
    if (!isNaN(amount) && amount > 0) {
      const currentHp = token.hp ?? 0;
      const maxHp = token.maxHp ?? 0;
      const newHp = maxHp > 0 ? Math.min(maxHp, currentHp + amount) : currentHp + amount;
      updateToken(token.id, { hp: newHp });
    }
    closeMenu();
  }, [inputVal, token, updateToken, closeMenu]);

  const handleTempHpConfirm = useCallback(() => {
    const amount = parseInt(inputVal, 10);
    if (!isNaN(amount) && amount >= 0) {
      updateToken(token.id, { tempHp: amount });
    }
    closeMenu();
  }, [inputVal, token.id, updateToken, closeMenu]);

  const label = getTokenLabel(token.name);
  const isAlly = token.type === 'ally';
  const borderColor = isAlly ? 'var(--ally-color)' : 'var(--enemy-color)';
  const glowColor = isAlly ? 'var(--ally-glow)' : 'var(--enemy-glow)';

  const boxShadow = isActiveTurn
    ? `0 0 0 3px var(--accent-gold), 0 0 18px 6px var(--accent-gold-glow), 0 0 6px 2px ${glowColor}`
    : `0 0 6px 2px ${glowColor}`;

  const isDead = typeof token.hp === 'number' && token.hp <= 0;
  const hasHpBar = typeof token.maxHp === 'number' && token.maxHp > 0;

  const hpBarColor = hasHpBar
    ? getHpBarColor(token.hp ?? token.maxHp ?? 0, token.maxHp ?? 1)
    : '#4caf7a';

  const hpFraction = hasHpBar
    ? Math.max(0, Math.min(1, (token.hp ?? 0) / (token.maxHp ?? 1)))
    : 0;

  const tempFraction = hasHpBar && (token.tempHp ?? 0) > 0
    ? Math.min(1 - hpFraction, (token.tempHp ?? 0) / (token.maxHp ?? 1))
    : 0;

  const hpTooltip = hasHpBar
    ? `HP: ${token.hp ?? 0} / ${token.maxHp}${(token.tempHp ?? 0) > 0 ? ` (+${token.tempHp} temp)` : ''}`
    : undefined;

  // Condition display data
  const activeConditions = token.conditions ?? [];
  const displayConditions = activeConditions.filter((id) => id !== 'concentration');
  const hasConcentration = activeConditions.includes('concentration');
  const iconRows: string[][] = [];
  for (let i = 0; i < displayConditions.length; i += 4) {
    iconRows.push(displayConditions.slice(i, i + 4));
  }

  const conditionIconsTopOffset = hasHpBar ? TOKEN_SIZE + 24 : TOKEN_SIZE + 14;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '4px 6px',
    background: 'var(--bg-dark)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: 12,
    outline: 'none',
    marginTop: 4,
  };

  const confirmBtnStyle: React.CSSProperties = {
    marginTop: 6,
    width: '100%',
    padding: '4px 8px',
    background: 'var(--accent-gold-dim)',
    color: 'var(--accent-gold)',
    border: '1px solid var(--accent-gold-dim)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  };

  const menuItemStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '6px 12px',
    background: 'none',
    color: 'var(--text-primary)',
    textAlign: 'left',
    fontSize: 13,
    cursor: 'pointer',
  };

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: token.x,
          top: token.y,
          width: TOKEN_SIZE,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        {/* Circle */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onContextMenu={handleContextMenu}
          style={{
            width: TOKEN_SIZE,
            height: TOKEN_SIZE,
            borderRadius: '50%',
            background: isDead ? '#3a3a3a' : token.color,
            border: `2px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            userSelect: 'none',
            pointerEvents: 'auto',
            overflow: 'hidden',
            boxShadow,
            transition: 'box-shadow 0.2s',
            fontSize: label.length > 2 ? 10 : 13,
            fontWeight: 700,
            color: '#fff',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            opacity: isDead ? 0.6 : 1,
            position: 'relative',
          }}
          title={token.name}
        >
          {token.imageUrl ? (
            <img
              src={token.imageUrl}
              alt={token.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
              draggable={false}
            />
          ) : (
            label
          )}
          {isDead && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                background: 'rgba(0,0,0,0.45)',
                borderRadius: '50%',
              }}
            >
              💀
            </div>
          )}
          {/* Concentration dot */}
          {hasConcentration && (
            <div
              title="Concentration: Maintaining concentration on a spell."
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#c9a84c',
                border: '1px solid rgba(0,0,0,0.5)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
          )}
        </div>

        {/* Name label below */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: TOKEN_SIZE + 3,
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            fontSize: 10,
            fontWeight: 600,
            color: '#fff',
            textShadow: '0 1px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.9)',
            pointerEvents: 'none',
            letterSpacing: '0.2px',
          }}
        >
          {token.name}
        </div>

        {/* HP Bar */}
        {hasHpBar && (
          <div
            title={hpTooltip}
            style={{
              position: 'absolute',
              left: '50%',
              top: TOKEN_SIZE + 16,
              transform: 'translateX(-50%)',
              width: 40,
              height: 5,
              borderRadius: 3,
              background: 'rgba(0,0,0,0.6)',
              overflow: 'hidden',
              pointerEvents: 'auto',
            }}
          >
            {/* HP fill */}
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
            {/* Temp HP fill */}
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
        )}

        {/* Condition icons */}
        {iconRows.length > 0 && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: conditionIconsTopOffset,
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              pointerEvents: 'none',
            }}
          >
            {iconRows.map((row, rowIdx) => (
              <div key={rowIdx} style={{ display: 'flex', gap: 1 }}>
                {row.map((condId) => {
                  const cond = getCondition(condId);
                  if (!cond) return null;
                  const tooltipText = condId === 'exhaustion' && token.exhaustionLevel
                    ? `${cond.label} (Lv.${token.exhaustionLevel}): ${cond.desc}`
                    : `${cond.label}: ${cond.desc}`;
                  return (
                    <span
                      key={condId}
                      title={tooltipText}
                      style={{
                        fontSize: 10,
                        lineHeight: '12px',
                        display: 'inline-block',
                        textShadow: '0 1px 3px rgba(0,0,0,1)',
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))',
                      }}
                    >
                      {cond.icon}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {contextMenu && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            onClick={closeMenu}
          />
          <div
            style={{
              position: 'fixed',
              left: contextMenu.x,
              top: contextMenu.y,
              zIndex: 9999,
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '4px 0',
              boxShadow: 'var(--shadow-lg)',
              minWidth: 160,
            }}
          >
            <div
              style={{
                padding: '6px 12px',
                color: 'var(--text-secondary)',
                fontSize: 12,
                borderBottom: '1px solid var(--border)',
                marginBottom: 4,
              }}
            >
              {token.name}
            </div>

            {/* Set HP */}
            {activeAction === 'setHp' ? (
              <div style={{ padding: '6px 12px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Current HP</div>
                <input
                  autoFocus
                  type="number"
                  min={0}
                  placeholder={`Current (${token.hp ?? token.maxHp ?? 0})`}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSetHpConfirm(); if (e.key === 'Escape') closeMenu(); }}
                  style={inputStyle}
                />
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2, marginTop: 6 }}>Max HP</div>
                <input
                  type="number"
                  min={1}
                  placeholder={`Max (${token.maxHp ?? ''})`}
                  value={maxInputVal}
                  onChange={(e) => setMaxInputVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSetHpConfirm(); if (e.key === 'Escape') closeMenu(); }}
                  style={inputStyle}
                />
                <button onClick={handleSetHpConfirm} style={confirmBtnStyle}>Confirm</button>
              </div>
            ) : (
              <button
                style={menuItemStyle}
                onClick={() => { setActiveAction('setHp'); setInputVal(String(token.hp ?? token.maxHp ?? '')); setMaxInputVal(String(token.maxHp ?? '')); }}
              >
                Set HP...
              </button>
            )}

            {/* Damage */}
            {activeAction === 'damage' ? (
              <div style={{ padding: '6px 12px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Damage amount</div>
                <input
                  autoFocus
                  type="number"
                  min={0}
                  placeholder="Amount"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleDamageConfirm(); if (e.key === 'Escape') closeMenu(); }}
                  style={inputStyle}
                />
                <button onClick={handleDamageConfirm} style={{ ...confirmBtnStyle, background: 'var(--enemy-dim)', color: 'var(--enemy-color)', borderColor: 'var(--enemy-dim)' }}>Apply Damage</button>
              </div>
            ) : (
              <button
                style={menuItemStyle}
                onClick={() => { setActiveAction('damage'); setInputVal(''); }}
              >
                Damage...
              </button>
            )}

            {/* Heal */}
            {activeAction === 'heal' ? (
              <div style={{ padding: '6px 12px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Heal amount</div>
                <input
                  autoFocus
                  type="number"
                  min={0}
                  placeholder="Amount"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleHealConfirm(); if (e.key === 'Escape') closeMenu(); }}
                  style={inputStyle}
                />
                <button onClick={handleHealConfirm} style={{ ...confirmBtnStyle, background: 'var(--ally-dim)', color: 'var(--ally-color)', borderColor: 'var(--ally-dim)' }}>Apply Heal</button>
              </div>
            ) : (
              <button
                style={menuItemStyle}
                onClick={() => { setActiveAction('heal'); setInputVal(''); }}
              >
                Heal...
              </button>
            )}

            {/* Temp HP */}
            {activeAction === 'tempHp' ? (
              <div style={{ padding: '6px 12px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Temp HP amount</div>
                <input
                  autoFocus
                  type="number"
                  min={0}
                  placeholder={`Current (${token.tempHp ?? 0})`}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTempHpConfirm(); if (e.key === 'Escape') closeMenu(); }}
                  style={inputStyle}
                />
                <button onClick={handleTempHpConfirm} style={{ ...confirmBtnStyle, background: '#1a3a5a', color: '#5b9bd5', borderColor: '#1a3a5a' }}>Set Temp HP</button>
              </div>
            ) : (
              <button
                style={menuItemStyle}
                onClick={() => { setActiveAction('tempHp'); setInputVal(String(token.tempHp ?? '')); }}
              >
                Temp HP...
              </button>
            )}

            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

            {/* Conditions section */}
            {showConditionPicker ? (
              <div style={{ padding: '4px 0' }}>
                <div style={{ padding: '4px 12px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px' }}>
                  CONDITIONS
                </div>
                <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                  {CONDITIONS.map((cond) => {
                    const isActive = activeConditions.includes(cond.id);
                    const isExhaustion = cond.id === 'exhaustion';
                    return (
                      <div key={cond.id}>
                        <button
                          title={cond.desc}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            width: '100%',
                            padding: '5px 12px',
                            background: isActive ? 'rgba(255,255,255,0.06)' : 'none',
                            border: 'none',
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            textAlign: 'left',
                            fontSize: 12,
                            cursor: 'pointer',
                          }}
                          onClick={() => handleToggleCondition(cond.id)}
                        >
                          <span style={{ fontSize: 14 }}>{cond.icon}</span>
                          <span style={{ flex: 1 }}>{cond.label}</span>
                          {isActive && <span style={{ color: 'var(--accent-gold)', fontSize: 12 }}>✓</span>}
                        </button>
                        {isExhaustion && isActive && (
                          <div style={{ display: 'flex', gap: 3, padding: '2px 12px 4px 32px' }}>
                            {[1, 2, 3, 4, 5, 6].map((lvl) => (
                              <button
                                key={lvl}
                                onClick={() => handleExhaustionLevel(lvl)}
                                style={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: 'var(--radius-sm)',
                                  background: token.exhaustionLevel === lvl ? '#8b6914' : 'var(--bg-dark)',
                                  border: `1px solid ${token.exhaustionLevel === lvl ? '#c9a84c' : 'var(--border-light)'}`,
                                  color: token.exhaustionLevel === lvl ? '#c9a84c' : 'var(--text-secondary)',
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
              </div>
            ) : (
              <button
                style={menuItemStyle}
                onClick={() => { setShowConditionPicker(true); setActiveAction(null); }}
              >
                Conditions...{activeConditions.length > 0 ? ` (${activeConditions.length})` : ''}
              </button>
            )}

            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

            <button
              onClick={handleDelete}
              style={{
                ...menuItemStyle,
                color: 'var(--enemy-color)',
              }}
            >
              Remove token
            </button>
          </div>
        </>
      )}
    </>
  );
}
