import { useState, useCallback } from 'react';
import './DiceRoller.css';

type DiceSides = 4 | 6 | 8 | 10 | 12 | 20 | 100;
type Advantage = 'normal' | 'advantage' | 'disadvantage';

interface RollResult {
  id: string;
  timestamp: Date;
  sides: DiceSides;
  count: number;
  modifier: number;
  advantage: Advantage;
  rolls: number[];
  advantageRolls?: [number, number]; // only for d20 advantage/disadvantage with count=1
  usedRoll?: number; // which roll was used for adv/disadv
  total: number;
  isNat20: boolean;
  isNat1: boolean;
}

const DICE: DiceSides[] = [4, 6, 8, 10, 12, 20, 100];
const MAX_HISTORY = 15;

function rollOnce(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

function rollDice(
  count: number,
  sides: DiceSides,
  modifier: number,
  advantage: Advantage
): RollResult {
  const id = `${Date.now()}-${Math.random()}`;
  const timestamp = new Date();

  let rolls: number[];
  let advantageRolls: [number, number] | undefined;
  let usedRoll: number | undefined;
  let total: number;

  if (sides === 20 && count === 1 && advantage !== 'normal') {
    const r1 = rollOnce(sides);
    const r2 = rollOnce(sides);
    advantageRolls = [r1, r2];
    usedRoll = advantage === 'advantage' ? Math.max(r1, r2) : Math.min(r1, r2);
    rolls = [usedRoll];
    total = usedRoll + modifier;
  } else {
    rolls = Array.from({ length: count }, () => rollOnce(sides));
    total = rolls.reduce((sum, r) => sum + r, 0) + modifier;
  }

  const isNat20 = sides === 20 && count === 1 && rolls[0] === 20;
  const isNat1 = sides === 20 && count === 1 && rolls[0] === 1;

  return { id, timestamp, sides, count, modifier, advantage, rolls, advantageRolls, usedRoll, total, isNat20, isNat1 };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatEntry(result: RollResult): string {
  const modStr = result.modifier !== 0
    ? (result.modifier > 0 ? `+${result.modifier}` : `${result.modifier}`)
    : '';
  const diceStr = `${result.count}d${result.sides}${modStr}`;
  const rollsStr = result.rolls.join(', ');
  return `${formatTime(result.timestamp)} · ${diceStr} · 🎲 ${result.total} (rolls: ${rollsStr})`;
}

interface DiceRollerProps {
  isOpen: boolean;
}

export function DiceRoller({ isOpen }: DiceRollerProps) {
  const [selectedDie, setSelectedDie] = useState<DiceSides>(20);
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [advantage, setAdvantage] = useState<Advantage>('normal');
  const [history, setHistory] = useState<RollResult[]>([]);
  const [lastResult, setLastResult] = useState<RollResult | null>(null);

  const handleRoll = useCallback(() => {
    const result = rollDice(diceCount, selectedDie, modifier, advantage);
    setLastResult(result);
    setHistory(prev => [result, ...prev].slice(0, MAX_HISTORY));
  }, [diceCount, selectedDie, modifier, advantage]);

  const handleHistoryClick = useCallback((result: RollResult) => {
    setLastResult(result);
  }, []);

  if (!isOpen) return null;

  const modStr = modifier !== 0
    ? (modifier > 0 ? `+${modifier}` : `${modifier}`)
    : '';

  return (
    <div className="dice-roller">
      <div className="dice-roller-header">
        <span className="dice-roller-title">DICE ROLLER</span>
      </div>

      {/* Dice type buttons */}
      <div className="dice-buttons">
        {DICE.map((d) => (
          <button
            key={d}
            className={`dice-btn${selectedDie === d ? ' dice-btn--active' : ''}`}
            onClick={() => {
              setSelectedDie(d);
              if (d !== 20) setAdvantage('normal');
            }}
          >
            d{d}
          </button>
        ))}
      </div>

      {/* Roll controls */}
      <div className="dice-controls">
        <label className="dice-label">
          <span># Dice</span>
          <input
            type="number"
            className="dice-input"
            min={1}
            max={20}
            value={diceCount}
            onChange={(e) => setDiceCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
          />
        </label>
        <label className="dice-label">
          <span>+/−</span>
          <input
            type="number"
            className="dice-input"
            min={-20}
            max={20}
            value={modifier}
            onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
          />
        </label>
      </div>

      {/* Advantage toggle (d20 only) */}
      {selectedDie === 20 && (
        <div className="advantage-row">
          {(['disadvantage', 'normal', 'advantage'] as Advantage[]).map((adv) => (
            <button
              key={adv}
              className={`adv-btn${advantage === adv ? ' adv-btn--active' : ''}`}
              onClick={() => setAdvantage(adv)}
            >
              {adv === 'disadvantage' ? 'Disadv' : adv === 'normal' ? 'Normal' : 'Adv'}
            </button>
          ))}
        </div>
      )}

      {/* Roll button */}
      <button className="roll-btn" onClick={handleRoll}>
        Roll {diceCount}d{selectedDie}{modStr}!
      </button>

      {/* Result display */}
      {lastResult && (
        <div className={`dice-result${lastResult.isNat20 ? ' dice-result--nat20' : lastResult.isNat1 ? ' dice-result--nat1' : ''}`}>
          <div className="dice-result-total">{lastResult.total}</div>
          {lastResult.advantageRolls && (
            <div className="dice-result-adv">
              {lastResult.advantage === 'advantage' ? '▲ Adv' : '▼ Disadv'}:&nbsp;
              <span className={lastResult.advantageRolls[0] === lastResult.usedRoll && lastResult.advantageRolls[0] >= lastResult.advantageRolls[1] ? 'roll-used' : 'roll-discarded'}>{lastResult.advantageRolls[0]}</span>
              &nbsp;/&nbsp;
              <span className={lastResult.advantageRolls[1] === lastResult.usedRoll && lastResult.advantageRolls[1] >= lastResult.advantageRolls[0] ? 'roll-used' : 'roll-discarded'}>{lastResult.advantageRolls[1]}</span>
            </div>
          )}
          {!lastResult.advantageRolls && lastResult.rolls.length > 0 && (
            <div className="dice-result-rolls">rolls: [{lastResult.rolls.join(', ')}]</div>
          )}
          {lastResult.isNat20 && <div className="dice-result-label nat20-label">NATURAL 20!</div>}
          {lastResult.isNat1 && <div className="dice-result-label nat1-label">Natural 1</div>}
        </div>
      )}

      {/* Roll history */}
      {history.length > 0 && (
        <div className="dice-history">
          {history.map((entry) => (
            <button
              key={entry.id}
              className={`history-entry${lastResult?.id === entry.id ? ' history-entry--selected' : ''}${entry.isNat20 ? ' history-nat20' : entry.isNat1 ? ' history-nat1' : ''}`}
              onClick={() => handleHistoryClick(entry)}
              title="Click to view details"
            >
              {formatEntry(entry)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
