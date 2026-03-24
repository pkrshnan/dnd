import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Token } from './Token';
import { detectFlanking } from '../../utils/flankingUtils';

export function TokenLayer() {
  const tokens = useStore((s) => s.tokens);
  const combatants = useStore((s) => s.combatants);
  const currentTurnIndex = useStore((s) => s.currentTurnIndex);
  const combatActive = useStore((s) => s.combatActive);
  const mapWidth = useStore((s) => s.mapWidth);
  const mapHeight = useStore((s) => s.mapHeight);

  const activeTokenId =
    combatActive && combatants.length > 0
      ? combatants[currentTurnIndex % combatants.length]?.tokenId
      : undefined;

  // Recompute flanking whenever token positions change
  const { flankedIds, flankingIds } = useMemo(() => detectFlanking(tokens), [tokens]);

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
      {tokens.map((token) => (
        <Token
          key={token.id}
          token={token}
          isActiveTurn={combatActive && activeTokenId === token.id}
          isFlanking={flankingIds.has(token.id)}
          isFlanked={flankedIds.has(token.id)}
        />
      ))}
    </div>
  );
}
