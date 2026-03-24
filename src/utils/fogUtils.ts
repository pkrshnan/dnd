import type { Token } from '../store/useStore';

const TOKEN_HALF = 20; // TOKEN_SIZE / 2

/**
 * Returns true if the enemy token's center position is revealed (fog cleared).
 * Reads directly from the fog canvas pixel data — no fog canvas means all revealed.
 * Allies should never be passed here; they are always visible.
 */
export function isEnemyRevealed(token: Token, canvas: HTMLCanvasElement | null): boolean {
  if (!canvas) return true;
  const ctx = canvas.getContext('2d');
  if (!ctx) return true;

  const cx = Math.round(token.x + TOKEN_HALF);
  const cy = Math.round(token.y + TOKEN_HALF);

  // Out of bounds = treat as revealed
  if (cx < 0 || cy < 0 || cx >= canvas.width || cy >= canvas.height) return true;

  // Alpha > 50 means fog is present at this pixel (destination-out sets alpha to 0)
  const alpha = ctx.getImageData(cx, cy, 1, 1).data[3];
  return alpha < 50;
}
