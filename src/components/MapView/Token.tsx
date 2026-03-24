import { useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import type { Token as TokenType } from '../../store/useStore';
import { useDrag } from '../../hooks/useDrag';
import { getTokenLabel } from '../../utils/flankingUtils';

const TOKEN_SIZE = 40;

interface Props {
  token: TokenType;
  isActiveTurn: boolean;
  isFlanking: boolean;  // this token is part of a flanking pair (has advantage)
  isFlanked: boolean;   // this token is being flanked (defenders have disadvantage)
}

export function Token({ token, isActiveTurn, isFlanking, isFlanked }: Props) {
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

  // Determine box-shadow based on state priority: active turn > flanking/flanked > default
  let boxShadow: string;
  let animation: string | undefined;

  if (isActiveTurn) {
    const baseGlow = isAlly ? 'var(--ally-glow)' : 'var(--enemy-glow)';
    boxShadow = `0 0 0 3px var(--accent-gold), 0 0 18px 6px var(--accent-gold-glow), 0 0 6px 2px ${baseGlow}`;
  } else if (isFlanking) {
    // Attacker with flanking advantage — cyan pulsing ring
    boxShadow = `0 0 0 3px var(--flank-color), 0 0 14px 5px var(--flank-glow)`;
    animation = 'flank-pulse 1.4s ease-in-out infinite';
  } else if (isFlanked) {
    // Being flanked — orange warning pulse
    boxShadow = `0 0 0 3px var(--flanked-color), 0 0 14px 5px var(--flanked-glow)`;
    animation = 'flanked-pulse 1s ease-in-out infinite';
  } else {
    const baseGlow = isAlly ? 'var(--ally-glow)' : 'var(--enemy-glow)';
    boxShadow = `0 0 6px 2px ${baseGlow}`;
  }

  return (
    <>
      {/* Wrapper — positioned at token coords, no overflow:hidden so the label is visible */}
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
        {/* Circle — the draggable interactive element */}
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
            animation,
            transition: isActiveTurn || isFlanking || isFlanked ? undefined : 'box-shadow 0.2s',
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

        {/* Flanking badges */}
        {isFlanking && !isActiveTurn && (
          <div
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: 'var(--flank-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 8,
              color: '#000',
              fontWeight: 900,
              pointerEvents: 'none',
              zIndex: 3,
              boxShadow: '0 0 4px var(--flank-glow)',
            }}
            title="Flanking — advantage on attacks"
          >
            ⚔
          </div>
        )}
        {isFlanked && (
          <div
            style={{
              position: 'absolute',
              top: -6,
              left: -6,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: 'var(--flanked-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 8,
              color: '#000',
              fontWeight: 900,
              pointerEvents: 'none',
              zIndex: 3,
              boxShadow: '0 0 4px var(--flanked-glow)',
            }}
            title={isAlly ? 'Flanked — enemies have advantage!' : 'Flanked by allies'}
          >
            ⚠
          </div>
        )}

        {/* Name label below the circle */}
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
