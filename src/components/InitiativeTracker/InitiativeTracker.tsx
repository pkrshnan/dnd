import { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { InitiativeEntry } from './InitiativeEntry';
import './InitiativeTracker.css';

export function InitiativeTracker() {
  const combatants = useStore((s) => s.combatants);
  const combatActive = useStore((s) => s.combatActive);
  const currentTurnIndex = useStore((s) => s.currentTurnIndex);
  const nextTurn = useStore((s) => s.nextTurn);
  const startCombat = useStore((s) => s.startCombat);
  const endCombat = useStore((s) => s.endCombat);
  const removeCombatant = useStore((s) => s.removeCombatant);

  const listRef = useRef<HTMLDivElement>(null);

  // Scroll active combatant into view on turn change
  useEffect(() => {
    if (!combatActive) return;
    const active = listRef.current?.querySelector('.initiative-entry.active');
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentTurnIndex, combatActive]);

  // Keyboard shortcut: N = next turn
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.key === 'n' || e.key === 'N') {
        if (combatActive) nextTurn();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [combatActive, nextTurn]);

  const totalTurnsPlayed = combatActive ? currentTurnIndex : 0;
  const roundNum =
    combatants.length > 0 ? Math.floor(totalTurnsPlayed / combatants.length) + 1 : 1;

  return (
    <div className="initiative-tracker">
      <div className="initiative-header">
        <span className="initiative-title">INITIATIVE</span>
        {combatActive && (
          <span className="initiative-round">Round {roundNum}</span>
        )}
      </div>

      {combatants.length === 0 ? (
        <div className="initiative-empty">
          <p>No combatants</p>
          <p className="initiative-empty-hint">
            Click "+ Combatant" in the toolbar to add characters to the initiative order
          </p>
        </div>
      ) : (
        <div className="initiative-list" ref={listRef}>
          {combatants.map((combatant, index) => (
            <InitiativeEntry
              key={combatant.id}
              combatant={combatant}
              isActive={combatActive && index === currentTurnIndex % combatants.length}
              onRemove={() => removeCombatant(combatant.id)}
            />
          ))}
        </div>
      )}

      <div className="initiative-controls">
        {!combatActive ? (
          <button
            className="btn-start-combat"
            onClick={startCombat}
            disabled={combatants.length === 0}
          >
            ⚔ Start Combat
          </button>
        ) : (
          <>
            <button className="btn-next-turn" onClick={nextTurn}>
              Next Turn →
            </button>
            <button className="btn-end-combat" onClick={endCombat}>
              End Combat
            </button>
          </>
        )}
      </div>
    </div>
  );
}
