# Status Conditions

D&D 5e status conditions are implemented throughout the DM screen app, displaying on tokens on the map and as badges in the initiative tracker.

## All 16 Conditions

| Icon | Condition | Description |
|------|-----------|-------------|
| 👁️‍🗨️ | **Blinded** | Cannot see. Attacks against have advantage, own attacks have disadvantage. |
| 💕 | **Charmed** | Cannot attack charmer. Charmer has advantage on social checks. |
| 🔇 | **Deafened** | Cannot hear. Fails hearing-based ability checks. |
| 😴 | **Exhaustion** | Levels 1–6: disadvantage on checks, speed halved, attacks/saves disadvantage, HP max halved, death. |
| 😱 | **Frightened** | Disadvantage on checks/attacks while source is in sight. Cannot move closer. |
| 🤼 | **Grappled** | Speed becomes 0. Ends if grappler is incapacitated or moved out of reach. |
| 🚫 | **Incapacitated** | Cannot take actions or reactions. |
| 🌫️ | **Invisible** | Impossible to see. Attacks against have disadvantage. Own attacks have advantage. |
| ⚡ | **Paralyzed** | Incapacitated, cannot move or speak. Attacks against auto-crit on hit. Fails Str/Dex saves. |
| 🪨 | **Petrified** | Transformed to stone. Incapacitated, resistant to all damage. |
| 🤢 | **Poisoned** | Disadvantage on attack rolls and ability checks. |
| ⬇️ | **Prone** | Disadvantage on attacks. Melee attacks against have advantage; ranged attacks have disadvantage. |
| 🕸️ | **Restrained** | Speed 0. Attacks against have advantage. Own attacks have disadvantage. |
| 💫 | **Stunned** | Incapacitated, cannot move. Fails Str/Dex saves. Attacks against have advantage. |
| 💤 | **Unconscious** | Incapacitated, cannot move/speak. Drops items. Attacks against have advantage and auto-crit. |
| 🎯 | **Concentration** | Maintaining concentration on a spell. Broken by damage, another concentration spell, or death. |

## Applying Conditions

### On Map Tokens

Right-click any token to open the context menu, then click **Conditions...** to expand the condition picker. Each condition in the list can be toggled on/off by clicking it. Active conditions show a gold checkmark.

- **Exhaustion**: When exhaustion is active, a level selector (1–6) appears below it. Click a level number to set the exhaustion level.
- **Concentration**: Displayed as a small gold dot in the top-right corner of the token circle rather than as a text icon (to reduce clutter).
- All other conditions appear as emoji icons below the token's name label.

### In Initiative Tracker

Each combatant row shows colored pill badges for active conditions below their name. To manage conditions:

- **Click a badge** to immediately remove that condition.
- **Click the "+" button** at the end of the badges row to open the condition picker dropdown.
- The picker lists all 16 conditions with checkboxes. Check/uncheck to toggle.
- When Exhaustion is checked, level buttons 1–6 appear inline.

## Removing Conditions

- **Map tokens**: Open the context menu → Conditions... → click the active condition to deselect it.
- **Initiative tracker**: Click the colored badge for the condition you want to remove.
- **Exhaustion**: Removing exhaustion also clears the exhaustion level.

## Exhaustion Levels

Exhaustion is a special condition with 6 severity levels:

| Level | Effect |
|-------|--------|
| 1 | Disadvantage on ability checks |
| 2 | Speed halved |
| 3 | Disadvantage on attack rolls and saving throws |
| 4 | Hit point maximum halved |
| 5 | Speed reduced to 0 |
| 6 | Death |

The initiative tracker badge shows "Exhausted Lv.X" when a level is set.

## Screenshot Reference

Screenshots are saved in `docs/screenshots/conditions/`:

- `overview.png` — Full app view showing tokens with condition icons and initiative tracker badges
- `token-conditions.png` — Tokens on the map with various condition icons visible
- `initiative-conditions.png` — Initiative tracker showing condition badges on combatants
