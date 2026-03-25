import { useState, useCallback, useRef } from 'react';
import { useStore } from '../../store/useStore';
import type { NoteSection } from '../../store/useStore';
import './Notes.css';

const SECTIONS: { key: NoteSection; label: string; icon: string }[] = [
  { key: 'session', label: 'Session', icon: '📋' },
  { key: 'npcs',    label: 'NPCs',    icon: '🧙' },
  { key: 'lore',    label: 'Lore',    icon: '📖' },
  { key: 'quests',  label: 'Quests',  icon: '⚔' },
];

function wordCount(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

export function Notes() {
  const notes = useStore((s) => s.notes);
  const updateNote = useStore((s) => s.updateNote);

  const [activeSection, setActiveSection] = useState<NoteSection>('session');
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (value: string) => {
      updateNote(activeSection, value);

      // Debounce the "Saved" indicator by 500ms
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSavedIndicator(true);
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSavedIndicator(false), 2000);
      }, 500);
    },
    [activeSection, updateNote],
  );

  const handleClear = useCallback(() => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    updateNote(activeSection, '');
    setConfirmClear(false);
  }, [confirmClear, activeSection, updateNote]);

  const currentText = notes[activeSection];
  const count = wordCount(currentText);

  return (
    <div className="notes-panel">
      {/* Section tabs */}
      <div className="notes-sections">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            className={`notes-section-btn${activeSection === s.key ? ' notes-section-btn--active' : ''}`}
            onClick={() => { setActiveSection(s.key); setConfirmClear(false); }}
          >
            <span className="notes-section-icon">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Textarea area */}
      <div className="notes-editor">
        <textarea
          className="notes-textarea"
          value={currentText}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`${SECTIONS.find((s) => s.key === activeSection)?.label} notes…`}
          spellCheck={false}
        />

        {/* Footer */}
        <div className="notes-footer">
          <div className="notes-footer-left">
            <button
              className={`notes-clear-btn${confirmClear ? ' notes-clear-btn--confirm' : ''}`}
              onClick={handleClear}
              title="Clear this section"
            >
              {confirmClear ? 'Confirm?' : 'Clear'}
            </button>
            {savedIndicator && (
              <span className="notes-saved">Saved</span>
            )}
          </div>
          <div className="notes-footer-right">
            <span className="notes-wordcount">{count} {count === 1 ? 'word' : 'words'}</span>
          </div>
        </div>
      </div>

      {/* Formatting hint */}
      <div className="notes-hint">Tip: Use - for bullets, ## for headers</div>
    </div>
  );
}
