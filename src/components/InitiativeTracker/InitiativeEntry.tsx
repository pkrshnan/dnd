import type { Combatant } from '../../store/useStore';

interface Props {
  combatant: Combatant;
  isActive: boolean;
  onRemove: () => void;
}

export function InitiativeEntry({ combatant, isActive, onRemove }: Props) {
  const isAlly = combatant.type === 'ally';
  const accentColor = isAlly ? 'var(--ally-color)' : 'var(--enemy-color)';
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
      {/* Type strip */}
      <div
        className="entry-strip"
        style={{ background: accentColor }}
      />

      {/* Initiative badge */}
      <div
        className="entry-initiative"
        style={{ color: isActive ? 'var(--accent-gold)' : accentColor }}
      >
        {combatant.initiative}
      </div>

      {/* Name */}
      <div className="entry-info">
        <div className="entry-name">{combatant.name}</div>
        <div
          className="entry-type"
          style={{ color: isAlly ? 'var(--ally-color)' : 'var(--enemy-color)' }}
        >
          {isAlly ? 'Ally' : 'Enemy'}
        </div>
      </div>

      {/* Active turn indicator */}
      {isActive && (
        <div className="entry-active-indicator" style={{ color: 'var(--accent-gold)' }}>
          ▶
        </div>
      )}

      {/* Remove button */}
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
