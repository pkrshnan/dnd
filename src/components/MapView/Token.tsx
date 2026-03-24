import { useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import type { Token as TokenType } from '../../store/useStore';
import { useDrag } from '../../hooks/useDrag';

const TOKEN_SIZE = 40;

interface Props {
  token: TokenType;
  isActiveTurn: boolean;
}

export function Token({ token, isActiveTurn }: Props) {
  const removeToken = useStore((s) => s.removeToken);
  const { onPointerDown, onPointerMove, onPointerUp } = useDrag(token.id);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleDelete = useCallback(() => {
    removeToken(token.id);
    setContextMenu(null);
  }, [token.id, removeToken]);

  const initials = token.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const glowColor = token.type === 'ally' ? 'var(--ally-glow)' : 'var(--enemy-glow)';
  const borderColor = token.type === 'ally' ? 'var(--ally-color)' : 'var(--enemy-color)';

  return (
    <>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onContextMenu={handleContextMenu}
        style={{
          position: 'absolute',
          left: token.x,
          top: token.y,
          width: TOKEN_SIZE,
          height: TOKEN_SIZE,
          borderRadius: '50%',
          background: token.color,
          border: `2px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          userSelect: 'none',
          zIndex: 2,
          pointerEvents: 'auto',
          overflow: 'hidden',
          boxShadow: isActiveTurn
            ? `0 0 0 3px var(--accent-gold), 0 0 16px 6px var(--accent-gold-glow), 0 0 6px 2px ${glowColor}`
            : `0 0 6px 2px ${glowColor}`,
          transition: 'box-shadow 0.2s',
          fontSize: 13,
          fontWeight: 700,
          color: '#fff',
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
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
          initials
        )}
      </div>

      {contextMenu && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
            }}
            onClick={() => setContextMenu(null)}
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
              minWidth: 120,
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
            <button
              onClick={handleDelete}
              style={{
                display: 'block',
                width: '100%',
                padding: '6px 12px',
                background: 'none',
                color: 'var(--enemy-color)',
                textAlign: 'left',
                fontSize: 13,
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
