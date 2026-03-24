import { useEffect } from 'react';
import './App.css';
import { Toolbar } from './components/Toolbar/Toolbar';
import { MapView } from './components/MapView/MapView';
import { InitiativeTracker } from './components/InitiativeTracker/InitiativeTracker';
import { useStore } from './store/useStore';

function App() {
  const setActiveTool = useStore((s) => s.setActiveTool);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
      switch (e.key.toLowerCase()) {
        case 'p': setActiveTool('pointer'); break;
        case 'r': setActiveTool('fog-reveal'); break;
        case 'h': setActiveTool('fog-hide'); break;
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
        <InitiativeTracker />
      </div>
    </div>
  );
}

export default App;
