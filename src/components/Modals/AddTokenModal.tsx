import { useState } from 'react';
import { useStore } from '../../store/useStore';
import './Modal.css';

const ALLY_COLORS = ['#4a9eff', '#4caf7a', '#9b59b6', '#3498db', '#1abc9c', '#f39c12'];
const ENEMY_COLORS = ['#c94c4c', '#e74c3c', '#e67e22', '#d35400', '#922b21', '#7b241c'];

interface Props {
  onClose: () => void;
}

export function AddTokenModal({ onClose }: Props) {
  const addToken = useStore((s) => s.addToken);
  const mapWidth = useStore((s) => s.mapWidth);
  const mapHeight = useStore((s) => s.mapHeight);

  const [name, setName] = useState('');
  const [type, setType] = useState<'ally' | 'enemy'>('ally');
  const [color, setColor] = useState(ALLY_COLORS[0]);

  const colors = type === 'ally' ? ALLY_COLORS : ENEMY_COLORS;

  const handleTypeChange = (newType: 'ally' | 'enemy') => {
    setType(newType);
    setColor(newType === 'ally' ? ALLY_COLORS[0] : ENEMY_COLORS[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addToken({
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      color,
      x: Math.max(0, mapWidth / 2 - 20),
      y: Math.max(0, mapHeight / 2 - 20),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Add Token</div>
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
              onChange={(e) => handleTypeChange(e.target.value as 'ally' | 'enemy')}
            >
              <option value="ally">Ally (Player / NPC)</option>
              <option value="enemy">Enemy</option>
            </select>
          </div>

          <div className="modal-field">
            <label className="modal-label">Color</label>
            <div className="color-presets">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch ${color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-confirm" disabled={!name.trim()}>
              Add Token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
