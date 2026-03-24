import { useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import type { Token as TokenType } from '../../store/useStore';
import { useDrag } from '../../hooks/useDrag';

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
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleDelete = useCallback(() => {
    removeToken(token.id);
    setContextMenu(null);
  }, [token.id, removeToken]);

  const label = getTokenLabel(token.name);
  const isAlly = token.type === 'ally';
  const borderColor = isAlly ? 'var(--ally-color)' : 'var(--enemy-color)';
  const glowColor = isAlly ? 'var(--ally-glow)' : 'var(--enemy-glow)';

  const boxShadow = isActiveTurn
    ? `0 0 0 3px var(--accent-gold), 0 0 18px 6px var(--accent-gold-glow), 0 0 6px 2px ${glowColor}`
    : `0 0 6px 2px ${glowColor}`;

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
            background: token.color,
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
      </div>

      {contextMenu && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
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
              minWidth: 130,
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
