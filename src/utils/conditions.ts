export const CONDITIONS = [
  { id: 'blinded',       label: 'Blinded',       icon: '👁️‍🗨️', color: '#666',    desc: 'Cannot see. Attacks against have advantage, own attacks have disadvantage.' },
  { id: 'charmed',       label: 'Charmed',        icon: '💕',   color: '#ff69b4', desc: 'Cannot attack charmer. Charmer has advantage on social checks.' },
  { id: 'deafened',      label: 'Deafened',       icon: '🔇',   color: '#888',    desc: 'Cannot hear. Fails hearing-based ability checks.' },
  { id: 'exhaustion',    label: 'Exhaustion',     icon: '😴',   color: '#8b6914', desc: 'Levels 1-6: disadvantage on checks, speed halved, attacks/saves disadvantage, HP max halved, death.' },
  { id: 'frightened',    label: 'Frightened',     icon: '😱',   color: '#9b30ff', desc: 'Disadvantage on checks/attacks while source is in sight. Cannot move closer.' },
  { id: 'grappled',      label: 'Grappled',       icon: '🤼',   color: '#c87137', desc: 'Speed becomes 0. Ends if grappler is incapacitated or moved out of reach.' },
  { id: 'incapacitated', label: 'Incapacitated',  icon: '🚫',   color: '#cc3333', desc: 'Cannot take actions or reactions.' },
  { id: 'invisible',     label: 'Invisible',      icon: '🌫️',   color: '#aaa',    desc: 'Impossible to see. Attacks against have disadvantage. Own attacks have advantage.' },
  { id: 'paralyzed',     label: 'Paralyzed',      icon: '⚡',   color: '#e5c000', desc: 'Incapacitated, cannot move or speak. Attacks against auto-crit on hit. Fails Str/Dex saves.' },
  { id: 'petrified',     label: 'Petrified',      icon: '🪨',   color: '#a0a0a0', desc: 'Transformed to stone. Incapacitated, resistant to all damage.' },
  { id: 'poisoned',      label: 'Poisoned',       icon: '🤢',   color: '#66aa44', desc: 'Disadvantage on attack rolls and ability checks.' },
  { id: 'prone',         label: 'Prone',          icon: '⬇️',   color: '#bb8800', desc: 'Disadvantage on attacks. Melee attacks against have advantage; ranged attacks have disadvantage.' },
  { id: 'restrained',    label: 'Restrained',     icon: '🕸️',   color: '#884400', desc: 'Speed 0. Attacks against have advantage. Own attacks have disadvantage.' },
  { id: 'stunned',       label: 'Stunned',        icon: '💫',   color: '#4488ff', desc: 'Incapacitated, cannot move. Fails Str/Dex saves. Attacks against have advantage.' },
  { id: 'unconscious',   label: 'Unconscious',    icon: '💤',   color: '#555',    desc: 'Incapacitated, cannot move/speak. Drops items. Attacks against have advantage and auto-crit.' },
  { id: 'concentration', label: 'Concentration',  icon: '🎯',   color: '#c9a84c', desc: 'Maintaining concentration on a spell. Broken by damage, another concentration spell, or death.' },
] as const;

export type ConditionId = typeof CONDITIONS[number]['id'];

export function getCondition(id: string) {
  return CONDITIONS.find((c) => c.id === id);
}
