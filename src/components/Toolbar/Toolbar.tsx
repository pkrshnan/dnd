import { useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import type { ToolMode } from '../../store/useStore';
import { AddTokenModal } from '../Modals/AddTokenModal';
import { AddCombatantModal } from '../Modals/AddCombatantModal';
import './Toolbar.css';

export function Toolbar() {
  const activeTool = useStore((s) => s.activeTool);
  const fogBrushSize = useStore((s) => s.fogBrushSize);
  const setActiveTool = useStore((s) => s.setActiveTool);
  const setFogBrushSize = useStore((s) => s.setFogBrushSize);
  const setMapImage = useStore((s) => s.setMapImage);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddToken, setShowAddToken] = useState(false);
  const [showAddCombatant, setShowAddCombatant] = useState(false);

  const handleMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setMapImage(url, img.naturalWidth, img.naturalHeight);
    img.src = url;
    // Reset input so the same file can be re-uploaded
    e.target.value = '';
  };

  const tools: { id: ToolMode; label: string; title: string }[] = [
    { id: 'pointer', label: '↖', title: 'Pointer (P)' },
    { id: 'fog-reveal', label: '◎', title: 'Reveal Fog (R)' },
    { id: 'fog-hide', label: '●', title: 'Hide Fog (H)' },
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <span className="toolbar-title">⚔ DM Screen</span>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
            title={tool.title}
            onClick={() => setActiveTool(tool.id)}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {(activeTool === 'fog-reveal' || activeTool === 'fog-hide') && (
        <>
          <div className="toolbar-divider" />
          <div className="toolbar-section brush-section">
            <label className="brush-label" title="Brush size">⬤</label>
            <input
              type="range"
              min={10}
              max={150}
              value={fogBrushSize}
              onChange={(e) => setFogBrushSize(Number(e.target.value))}
              className="brush-slider"
              title={`Brush size: ${fogBrushSize}px`}
            />
            <span className="brush-value">{fogBrushSize}</span>
          </div>
        </>
      )}

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <button className="toolbar-btn" onClick={() => fileInputRef.current?.click()}>
          Upload Map
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleMapUpload}
        />
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <button className="toolbar-btn" onClick={() => setShowAddToken(true)}>
          + Token
        </button>
        <button className="toolbar-btn" onClick={() => setShowAddCombatant(true)}>
          + Combatant
        </button>
      </div>

      {showAddToken && <AddTokenModal onClose={() => setShowAddToken(false)} />}
      {showAddCombatant && <AddCombatantModal onClose={() => setShowAddCombatant(false)} />}
    </div>
  );
}
