import { useState } from 'react';
import { useStore } from '../../store/useStore';
import './Modal.css';

interface Props {
  onClose: () => void;
}

export function AddCombatantModal({ onClose }: Props) {
  const addCombatant = useStore((s) => s.addCombatant);
  const tokens = useStore((s) => s.tokens);

  const [name, setName] = useState('');
  const [type, setType] = useState<'ally' | 'enemy'>('ally');
  const [initiative, setInitiative] = useState('');
  const [linkedTokenId, setLinkedTokenId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !initiative) return;
    addCombatant({
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      initiative: Number(initiative),
      tokenId: linkedTokenId || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Add Combatant</div>
        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label className="modal-label">Name</label>
            <input
              className="modal-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Character name"
              autoFocus
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">Type</label>
            <select
              className="modal-select"
              value={type}
              onChange={(e) => setType(e.target.value as 'ally' | 'enemy')}
            >
              <option value="ally">Ally (Player / NPC)</option>
              <option value="enemy">Enemy</option>
            </select>
          </div>

          <div className="modal-field">
            <label className="modal-label">Initiative Roll</label>
            <input
              className="modal-input"
              type="number"
              value={initiative}
              onChange={(e) => setInitiative(e.target.value)}
              placeholder="e.g. 18"
              min={-10}
              max={40}
            />
          </div>

          {tokens.length > 0 && (
            <div className="modal-field">
              <label className="modal-label">Link to Token (optional)</label>
              <select
                className="modal-select"
                value={linkedTokenId}
                onChange={(e) => setLinkedTokenId(e.target.value)}
              >
                <option value="">— None —</option>
                {tokens.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-confirm" disabled={!name.trim() || !initiative}>
              Add Combatant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
