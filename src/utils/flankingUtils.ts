import type { Token } from '../store/useStore';

const TOKEN_HALF = 20; // TOKEN_SIZE / 2

function center(token: Token) {
  return { x: token.x + TOKEN_HALF, y: token.y + TOKEN_HALF };
}

/**
 * Returns true if attacker1 and attacker2 are flanking the target.
 * Flanking: the two attackers are on opposite sides of the target —
 * i.e. the angle at the target between the two attacker vectors is >= 120°.
 */
function areFlanking(attacker1: Token, target: Token, attacker2: Token): boolean {
  const tc = center(target);
  const a1 = center(attacker1);
  const a2 = center(attacker2);

  const v1 = { x: a1.x - tc.x, y: a1.y - tc.y };
  const v2 = { x: a2.x - tc.x, y: a2.y - tc.y };

  const len1 = Math.hypot(v1.x, v1.y);
  const len2 = Math.hypot(v2.x, v2.y);

  // Ignore tokens that are on top of each other or the target
  if (len1 < 10 || len2 < 10) return false;

  const cosAngle = (v1.x * v2.x + v1.y * v2.y) / (len1 * len2);

  // cos <= -0.5 means angle >= 120°
  return cosAngle <= -0.5;
}

export interface FlankingResult {
  /** IDs of tokens being flanked (defenders — attackers have advantage vs these) */
  flankedIds: Set<string>;
  /** IDs of tokens that are part of a flanking pair (attackers with advantage) */
  flankingIds: Set<string>;
}

export function detectFlanking(tokens: Token[]): FlankingResult {
  const flankedIds = new Set<string>();
  const flankingIds = new Set<string>();

  const allies = tokens.filter((t) => t.type === 'ally');
  const enemies = tokens.filter((t) => t.type === 'enemy');

  // Allies flanking enemies (players have advantage)
  for (const enemy of enemies) {
    for (let i = 0; i < allies.length; i++) {
      for (let j = i + 1; j < allies.length; j++) {
        if (areFlanking(allies[i], enemy, allies[j])) {
          flankedIds.add(enemy.id);
          flankingIds.add(allies[i].id);
          flankingIds.add(allies[j].id);
        }
      }
    }
  }

  // Enemies flanking allies (danger warning for players)
  for (const ally of allies) {
    for (let i = 0; i < enemies.length; i++) {
      for (let j = i + 1; j < enemies.length; j++) {
        if (areFlanking(enemies[i], ally, enemies[j])) {
          flankedIds.add(ally.id);
          flankingIds.add(enemies[i].id);
          flankingIds.add(enemies[j].id);
        }
      }
    }
  }

  return { flankedIds, flankingIds };
}

/**
 * Get a compact label for display inside a token circle.
 * Handles numbered names well: "Zombie 23" → "Z23", "Goblin 1" → "G1"
 */
export function getTokenLabel(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const firstChar = parts[0][0].toUpperCase();
  const lastPart = parts[parts.length - 1];
  // If last word is a number, include the full number (up to 3 digits total with prefix)
  if (/^\d+$/.test(lastPart)) {
    return (firstChar + lastPart).slice(0, 3);
  }
  return (firstChar + lastPart[0]).toUpperCase();
}
