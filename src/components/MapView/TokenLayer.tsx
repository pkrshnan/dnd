import { useStore } from '../../store/useStore';
import { Token } from './Token';
import { fogCanvasRef } from '../../hooks/useFogPainter';
import { isEnemyRevealed } from '../../utils/fogUtils';

export function TokenLayer() {
  const tokens = useStore((s) => s.tokens);
  const combatants = useStore((s) => s.combatants);
  const currentTurnIndex = useStore((s) => s.currentTurnIndex);
  const combatActive = useStore((s) => s.combatActive);
  const mapWidth = useStore((s) => s.mapWidth);
  const mapHeight = useStore((s) => s.mapHeight);
  // Subscribe to fogRevision so we re-render whenever fog is painted
  useStore((s) => s.fogRevision);

  const activeTokenId =
    combatActive && combatants.length > 0
      ? combatants[currentTurnIndex % combatants.length]?.tokenId
      : undefined;

  const visibleTokens = tokens.filter(
    (t) => t.type === 'ally' || isEnemyRevealed(t, fogCanvasRef.current)
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: mapWidth,
        height: mapHeight,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      {visibleTokens.map((token) => (
        <Token
          key={token.id}
          token={token}
          isActiveTurn={combatActive && activeTokenId === token.id}
        />
      ))}
    </div>
  );
}
