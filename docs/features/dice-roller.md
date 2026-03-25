# Dice Roller

A built-in dice roller panel for the D&D DM screen, accessible from the right-hand column beneath the Initiative Tracker.

## Overview

The Dice Roller provides quick access to all standard D&D polyhedral dice with support for multiple dice, modifiers, and advantage/disadvantage rolls. A scrollable roll history tracks the last 15 results so the DM can reference recent outcomes at a glance.

## Available Dice Types

| Button | Die      | Common Use                        |
|--------|----------|-----------------------------------|
| d4     | 4-sided   | Damage (e.g. dagger, magic missile) |
| d6     | 6-sided   | Damage (e.g. shortsword, fireball)  |
| d8     | 8-sided   | Damage (e.g. longsword, cure wounds) |
| d10    | 10-sided  | Damage (e.g. heavy crossbow)        |
| d12    | 12-sided  | Damage (e.g. greataxe)              |
| d20    | 20-sided  | Attack rolls, ability checks, saves |
| d100   | Percentile | Wild magic surges, random tables    |

## Controls

- **# Dice** — Number of dice to roll (1–20, default 1)
- **+/−** — Flat modifier added to the total (e.g. +5 for a proficient attack, −2 for a penalty)
- **Roll!** — Executes the roll and displays the result

## Advantage / Disadvantage (d20 only)

When d20 is selected with **# Dice = 1**, three toggle buttons appear:

| Mode           | Behavior                                      |
|----------------|-----------------------------------------------|
| **Disadv**     | Rolls two d20s, uses the **lower** result     |
| **Normal**     | Rolls a single d20                            |
| **Adv**        | Rolls two d20s, uses the **higher** result    |

Both rolls are shown in the result area with the used roll highlighted and the discarded roll struck through.

## Result Display

- The **total** is shown in large gold text in the center
- For advantage/disadvantage, both dice values are displayed
- For multi-dice rolls, all individual results are shown in small print
- **Natural 20** — panel glows gold, "NATURAL 20!" label appears
- **Natural 1** — panel glows red, "Natural 1" label appears

## Roll History

The history section shows the last 15 rolls, newest first. Each entry displays:

```
14:32 · 2d6+3 · 🎲 15 (rolls: 6, 6)
```

- **Gold** entries = Natural 20
- **Red** entries = Natural 1
- Click any history entry to restore its details in the result display

## Keyboard Shortcut

| Key | Action                                  |
|-----|-----------------------------------------|
| `D` | Toggle the Dice Roller open / closed    |

The shortcut is ignored when an input field, textarea, or select is focused, so typing in HP fields or name inputs won't accidentally toggle the panel.

## Opening the Panel

- Click the **🎲 Dice** button at the bottom of the initiative tracker column
- When open, the button label changes to **🎲 Hide Dice**
- The panel is fixed-height (~280px) and does not scroll — the history list inside is independently scrollable

## Screenshots

See `docs/screenshots/dice-roller/` for captured screenshots:

- `01-app-overview.png` — Full app layout before opening the dice roller
- `02-dice-roller-open.png` — Dice roller panel expanded
- `03-dice-roller-with-history.png` — Panel with multiple rolls and history entries
- `04-right-panel-close-up.png` — Close-up of the right column with initiative tracker and dice roller
- `05-history-entry-selected.png` — Clicking a history entry to view roll details
- `06-dice-roller-closed-shortcut.png` — Panel closed via keyboard shortcut
- `07-dice-roller-reopened.png` — Panel reopened via keyboard shortcut
