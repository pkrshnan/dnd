import { useEffect, useState } from 'react';
import './App.css';
import { Toolbar } from './components/Toolbar/Toolbar';
import { MapView } from './components/MapView/MapView';
import { InitiativeTracker } from './components/InitiativeTracker/InitiativeTracker';
import { DiceRoller } from './components/DiceRoller/DiceRoller';
import { Notes } from './components/Notes/Notes';
import { useStore } from './store/useStore';

type RightTab = 'initiative' | 'notes';

function App() {
  const setActiveTool = useStore((s) => s.setActiveTool);
  const [diceOpen, setDiceOpen] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>('initiative');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
      switch (e.key.toLowerCase()) {
        case 'p': setActiveTool('pointer'); break;
        case 'r': setActiveTool('fog-reveal'); break;
        case 'h': setActiveTool('fog-hide'); break;
        case 'd': setDiceOpen((open) => !open); break;
        case 't': setRightTab((tab) => tab === 'initiative' ? 'notes' : 'initiative'); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setActiveTool]);

  return (
    <div className="app">
      <div className="app-toolbar">
        <Toolbar />
      </div>
      <div className="app-map">
        <MapView />
      </div>
      <div className="app-initiative">
        {/* Tab bar */}
        <div className="right-tab-bar">
          <button
            className={`right-tab-btn${rightTab === 'initiative' ? ' right-tab-btn--active' : ''}`}
            onClick={() => setRightTab('initiative')}
          >
            ⚔ Initiative
          </button>
          <button
            className={`right-tab-btn${rightTab === 'notes' ? ' right-tab-btn--active' : ''}`}
            onClick={() => setRightTab('notes')}
          >
            📝 Notes
          </button>
        </div>

        {/* Tab content */}
        {rightTab === 'initiative' ? (
          <>
            <InitiativeTracker />
            <div className="dice-toggle-bar">
              <button
                className={`dice-toggle-btn${diceOpen ? ' dice-toggle-btn--open' : ''}`}
                onClick={() => setDiceOpen((o) => !o)}
                title="Toggle Dice Roller (D)"
              >
                {diceOpen ? '🎲 Hide Dice' : '🎲 Dice'}
              </button>
            </div>
            <DiceRoller isOpen={diceOpen} />
          </>
        ) : (
          <Notes />
        )}
      </div>
    </div>
  );
}

export default App;
