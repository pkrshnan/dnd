// D&D 5e Spell Slot Presets
// Arrays are indexed 0-8, representing spell levels 1-9
// Values are the number of spell slots at each level

export interface PresetEntry {
  label: string;
  slots: Record<string, number>; // key: "1"-"9" or "pact"
  pactLevel?: number; // pact magic slot level (Warlock)
}

// Full caster progression (Wizard, Sorcerer, Bard, Cleric, Druid)
const FULL_CASTER: Record<string, number[]> = {
  '1':  [2,0,0,0,0,0,0,0,0],
  '2':  [3,0,0,0,0,0,0,0,0],
  '3':  [4,2,0,0,0,0,0,0,0],
  '4':  [4,3,0,0,0,0,0,0,0],
  '5':  [4,3,2,0,0,0,0,0,0],
  '6':  [4,3,3,0,0,0,0,0,0],
  '7':  [4,3,3,1,0,0,0,0,0],
  '8':  [4,3,3,2,0,0,0,0,0],
  '9':  [4,3,3,3,1,0,0,0,0],
  '10': [4,3,3,3,2,0,0,0,0],
  '11': [4,3,3,3,2,1,0,0,0],
  '12': [4,3,3,3,2,1,0,0,0],
  '13': [4,3,3,3,2,1,1,0,0],
  '14': [4,3,3,3,2,1,1,0,0],
  '15': [4,3,3,3,2,1,1,1,0],
  '16': [4,3,3,3,2,1,1,1,0],
  '17': [4,3,3,3,2,1,1,1,1],
  '18': [4,3,3,3,3,1,1,1,1],
  '19': [4,3,3,3,3,2,1,1,1],
  '20': [4,3,3,3,3,2,2,1,1],
};

// Half caster progression (Paladin, Ranger)
const HALF_CASTER: Record<string, number[]> = {
  '1':  [0,0,0,0,0,0,0,0,0],
  '2':  [2,0,0,0,0,0,0,0,0],
  '3':  [3,0,0,0,0,0,0,0,0],
  '4':  [3,0,0,0,0,0,0,0,0],
  '5':  [4,2,0,0,0,0,0,0,0],
  '6':  [4,2,0,0,0,0,0,0,0],
  '7':  [4,3,0,0,0,0,0,0,0],
  '8':  [4,3,0,0,0,0,0,0,0],
  '9':  [4,3,2,0,0,0,0,0,0],
  '10': [4,3,2,0,0,0,0,0,0],
  '11': [4,3,3,0,0,0,0,0,0],
  '12': [4,3,3,0,0,0,0,0,0],
  '13': [4,3,3,1,0,0,0,0,0],
  '14': [4,3,3,1,0,0,0,0,0],
  '15': [4,3,3,2,0,0,0,0,0],
  '16': [4,3,3,2,0,0,0,0,0],
  '17': [4,3,3,3,1,0,0,0,0],
  '18': [4,3,3,3,1,0,0,0,0],
  '19': [4,3,3,3,2,0,0,0,0],
  '20': [4,3,3,3,2,0,0,0,0],
};

// Third caster (Arcane Trickster, Eldritch Knight)
const THIRD_CASTER: Record<string, number[]> = {
  '1':  [0,0,0,0,0,0,0,0,0],
  '2':  [0,0,0,0,0,0,0,0,0],
  '3':  [2,0,0,0,0,0,0,0,0],
  '4':  [3,0,0,0,0,0,0,0,0],
  '5':  [3,0,0,0,0,0,0,0,0],
  '6':  [3,0,0,0,0,0,0,0,0],
  '7':  [4,2,0,0,0,0,0,0,0],
  '8':  [4,2,0,0,0,0,0,0,0],
  '9':  [4,2,0,0,0,0,0,0,0],
  '10': [4,3,0,0,0,0,0,0,0],
  '11': [4,3,0,0,0,0,0,0,0],
  '12': [4,3,0,0,0,0,0,0,0],
  '13': [4,3,2,0,0,0,0,0,0],
  '14': [4,3,2,0,0,0,0,0,0],
  '15': [4,3,2,0,0,0,0,0,0],
  '16': [4,3,3,0,0,0,0,0,0],
  '17': [4,3,3,0,0,0,0,0,0],
  '18': [4,3,3,0,0,0,0,0,0],
  '19': [4,3,3,1,0,0,0,0,0],
  '20': [4,3,3,1,0,0,0,0,0],
};

// Warlock Pact Magic: all slots are the same level; count and level grow with class level
// pactLevel = the level of each slot; pactCount = how many slots
const WARLOCK_PACT: Record<string, { level: number; count: number }> = {
  '1':  { level: 1, count: 1 },
  '2':  { level: 1, count: 2 },
  '3':  { level: 2, count: 2 },
  '4':  { level: 2, count: 2 },
  '5':  { level: 3, count: 2 },
  '6':  { level: 3, count: 2 },
  '7':  { level: 4, count: 2 },
  '8':  { level: 4, count: 2 },
  '9':  { level: 5, count: 2 },
  '10': { level: 5, count: 2 },
  '11': { level: 5, count: 3 },
  '12': { level: 5, count: 3 },
  '13': { level: 5, count: 3 },
  '14': { level: 5, count: 3 },
  '15': { level: 5, count: 3 },
  '16': { level: 5, count: 3 },
  '17': { level: 5, count: 4 },
  '18': { level: 5, count: 4 },
  '19': { level: 5, count: 4 },
  '20': { level: 5, count: 4 },
};

function slotsFromArray(arr: number[]): Record<string, number> {
  const result: Record<string, number> = {};
  arr.forEach((count, idx) => {
    if (count > 0) result[String(idx + 1)] = count;
  });
  return result;
}

// Build the full presets table
// Keys: "Class Lv N" style labels
export const SPELL_SLOT_PRESETS: PresetEntry[] = [];

// Full casters: levels 1-20
const fullCasterClasses = ['Wizard', 'Sorcerer', 'Bard', 'Cleric', 'Druid'];
// Pick representative character levels
const representativeLevels = [1, 3, 5, 7, 9, 11, 13, 15, 17, 20];

for (const cls of fullCasterClasses) {
  for (const lvl of representativeLevels) {
    const arr = FULL_CASTER[String(lvl)];
    if (arr) {
      SPELL_SLOT_PRESETS.push({
        label: `${cls} L${lvl}`,
        slots: slotsFromArray(arr),
      });
    }
  }
}

// Half casters
const halfCasterClasses = ['Paladin', 'Ranger'];
for (const cls of halfCasterClasses) {
  for (const lvl of representativeLevels) {
    const arr = HALF_CASTER[String(lvl)];
    if (arr) {
      const slots = slotsFromArray(arr);
      if (Object.keys(slots).length > 0) {
        SPELL_SLOT_PRESETS.push({
          label: `${cls} L${lvl}`,
          slots,
        });
      }
    }
  }
}

// Third casters
const thirdCasterClasses = ['Eldritch Knight', 'Arcane Trickster'];
for (const cls of thirdCasterClasses) {
  for (const lvl of representativeLevels) {
    const arr = THIRD_CASTER[String(lvl)];
    if (arr) {
      const slots = slotsFromArray(arr);
      if (Object.keys(slots).length > 0) {
        SPELL_SLOT_PRESETS.push({
          label: `${cls} L${lvl}`,
          slots,
        });
      }
    }
  }
}

// Warlock pact magic
for (const lvl of representativeLevels) {
  const pact = WARLOCK_PACT[String(lvl)];
  if (pact) {
    SPELL_SLOT_PRESETS.push({
      label: `Warlock L${lvl}`,
      slots: { pact: pact.count },
      pactLevel: pact.level,
    });
  }
}

// Artificer (half caster, starts at level 1)
const ARTIFICER: Record<string, number[]> = {
  '1':  [2,0,0,0,0,0,0,0,0],
  '2':  [2,0,0,0,0,0,0,0,0],
  '3':  [3,0,0,0,0,0,0,0,0],
  '4':  [3,0,0,0,0,0,0,0,0],
  '5':  [4,2,0,0,0,0,0,0,0],
  '6':  [4,2,0,0,0,0,0,0,0],
  '7':  [4,3,0,0,0,0,0,0,0],
  '8':  [4,3,0,0,0,0,0,0,0],
  '9':  [4,3,2,0,0,0,0,0,0],
  '10': [4,3,2,0,0,0,0,0,0],
  '11': [4,3,3,0,0,0,0,0,0],
  '12': [4,3,3,0,0,0,0,0,0],
  '13': [4,3,3,1,0,0,0,0,0],
  '14': [4,3,3,1,0,0,0,0,0],
  '15': [4,3,3,2,0,0,0,0,0],
  '16': [4,3,3,2,0,0,0,0,0],
  '17': [4,3,3,3,1,0,0,0,0],
  '18': [4,3,3,3,1,0,0,0,0],
  '19': [4,3,3,3,2,0,0,0,0],
  '20': [4,3,3,3,2,0,0,0,0],
};

for (const lvl of representativeLevels) {
  const arr = ARTIFICER[String(lvl)];
  if (arr) {
    const slots = slotsFromArray(arr);
    if (Object.keys(slots).length > 0) {
      SPELL_SLOT_PRESETS.push({
        label: `Artificer L${lvl}`,
        slots,
      });
    }
  }
}

export const LEVEL_LABELS: Record<string, string> = {
  '1': '1st',
  '2': '2nd',
  '3': '3rd',
  '4': '4th',
  '5': '5th',
  '6': '6th',
  '7': '7th',
  '8': '8th',
  '9': '9th',
  pact: 'Pact',
};
