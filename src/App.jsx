import React, { useState, useEffect, useCallback, useRef } from 'react';
import Fuse from 'fuse.js';
import './styles/App.css';

const App = () => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('apps'); // apps, clipboard, notes, calculator, ai, web
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [apps, setApps] = useState([]);
  const [clipboardHistory, setClipboardHistory] = useState([]);
  const [notes, setNotes] = useState([]);
  const [calcResult, setCalcResult] = useState(null);
  const [aiResponse, setAiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const inputRef = useRef(null);

  // Load apps on mount
  useEffect(() => {
    loadApps();
    loadClipboardHistory();
    loadNotes();
    
    if (window.electronAPI) {
      window.electronAPI.onShowWindow(() => {
        resetState();
      });
    }
  }, []);

  // Detect mode based on query
  useEffect(() => {
    const q = query.trim();
    
    if (q.startsWith('/ai ') || q.startsWith('/chat ')) {
      setMode('ai');
      handleAIChat(q.replace(/^\/(ai|chat)\s*/, ''));
    } else if (q.startsWith('/note') || q.startsWith('/notes')) {
      setMode('notes');
      handleNotesSearch(q.replace(/^\/(note|notes)\s*/, ''));
    } else if (q.startsWith('/clip') || q.startsWith('/clipboard')) {
      setMode('clipboard');
      handleClipboardSearch(q.replace(/^\/(clip|clipboard)\s*/, ''));
    } else if (q.startsWith('/web ') || q.startsWith('/search ')) {
      setMode('web');
      handleWebSearch(q.replace(/^\/(web|search)\s*/, ''));
    } else if (/^[0-9+\-*/().\s]+$/.test(q) && /[+\-*/]/.test(q)) {
      setMode('calculator');
      handleCalculator(q);
    } else if (!q) {
      setMode('apps');
      setResults(apps.slice(0, 10));
    } else {
      setMode('apps');
      handleAppSearch(q);
    }
    
    setSelectedIndex(0);
  }, [query]);

  const resetState = () => {
    setQuery('');
    setSelectedIndex(0);
    setCalcResult(null);
    setAiResponse(null);
    setShowNoteEditor(false);
    setCurrentNote(null);
  };

  const loadApps = async () => {
    if (window.electronAPI) {
      const loadedApps = await window.electronAPI.searchApps('');
      setApps(loadedApps);
      setResults(loadedApps.slice(0, 10));
    }
  };

  const loadClipboardHistory = async () => {
    if (window.electronAPI) {
      const history = await window.electronAPI.getClipboardHistory(20);
      setClipboardHistory(history);
    }
  };

  const loadNotes = async () => {
    if (window.electronAPI) {
      const loadedNotes = await window.electronAPI.getNotes('');
      setNotes(loadedNotes);
    }
  };

  const handleAppSearch = (q) => {
    const fuse = new Fuse(apps, {
      keys: ['name', 'exec'],
      threshold: 0.3,
      includeScore: true
    });
    const searchResults = fuse.search(q).slice(0, 10);
    setResults(searchResults.map(r => r.item));
  };

  const handleCalculator = async (expression) => {
    if (window.electronAPI) {
      const result = await window.electronAPI.calculate(expression);
      setCalcResult(result);
      setResults([{ type: 'calc', ...result }]);
    }
  };

  const handleAIChat = async (prompt) => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    if (window.electronAPI) {
      const response = await window.electronAPI.aiChat(prompt, []);
      setAiResponse(response);
      setResults([{ type: 'ai', ...response }]);
    }
    setIsLoading(false);
  };

  const handleNotesSearch = async (q) => {
    if (window.electronAPI) {
      const foundNotes = await window.electronAPI.getNotes(q);
      setResults([
        { type: 'new_note', title: 'Create New Note', icon: '➕' },
        ...foundNotes.map(n => ({ type: 'note', ...n }))
      ]);
    }
  };

  const handleClipboardSearch = async (q) => {
    const history = await window.electronAPI.getClipboardHistory(50);
    if (q.trim()) {
      const filtered = history.filter(h => 
        h.content.toLowerCase().includes(q.toLowerCase())
      );
      setResults(filtered.map((h, i) => ({ type: 'clipboard', ...h, index: i })));
    } else {
      setResults(history.map((h, i) => ({ type: 'clipboard', ...h, index: i })));
    }
  };

  const handleWebSearch = async (q) => {
    if (!q.trim()) return;
    setIsLoading(true);
    if (window.electronAPI) {
      const suggestions = window.electronAPI.getSearchSuggestions(q);
      const searchResults = await window.electronAPI.webSearch(q, 'duckduckgo');
      setResults([
        ...(suggestions || []),
        { type: 'web_result', url: searchResults.url, title: `Search "${q}"` }
      ]);
    }
    setIsLoading(false);
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      executeAction(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (showNoteEditor || currentNote) {
        setShowNoteEditor(false);
        setCurrentNote(null);
      } else {
        window.electronAPI?.hideWindow();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (mode === 'calculator' && calcResult?.success) {
        setQuery(calcResult.result.toString());
        setCalcResult(null);
        setResults([]);
      }
    }
  }, [results, selectedIndex, mode, calcResult, showNoteEditor, currentNote]);

  const executeAction = async (item) => {
    switch (item.type) {
      case 'app':
      case undefined: // Default app launch
        if (window.electronAPI) {
          await window.electronAPI.launchApp(item.exec);
          resetState();
          window.electronAPI.hideWindow();
        }
        break;
        
      case 'clipboard':
        if (window.electronAPI) {
          await window.electronAPI.writeClipboard(item.content);
          await window.electronAPI.hideWindow();
        }
        break;
        
      case 'note':
        setCurrentNote(item);
        setShowNoteEditor(true);
        break;
        
      case 'new_note':
        setCurrentNote({ title: '', content: '' });
        setShowNoteEditor(true);
        break;
        
      case 'calc':
        if (window.electronAPI) {
          await window.electronAPI.writeClipboard(item.result.toString());
          await window.electronAPI.hideWindow();
        }
        break;
        
      case 'open_url':
        require('electron').shell.openExternal(item.action);
        window.electronAPI?.hideWindow();
        break;
        
      case 'email':
        require('electron').shell.openExternal(item.action);
        window.electronAPI?.hideWindow();
        break;
        
      case 'calculate':
        setQuery(item.action);
        break;
        
      case 'web_result':
        require('electron').shell.openExternal(item.url);
        window.electronAPI?.hideWindow();
        break;
        
      default:
        console.log('Unknown action type:', item.type);
    }
  };

  const saveCurrentNote = async () => {
    if (!currentNote?.title.trim()) return;
    
    if (window.electronAPI) {
      if (currentNote.id) {
        await window.electronAPI.updateNote(currentNote.id, {
          title: currentNote.title,
          content: currentNote.content
        });
      } else {
        await window.electronAPI.createNote(currentNote.title, currentNote.content);
      }
      setShowNoteEditor(false);
      setCurrentNote(null);
      loadNotes();
    }
  };

  const deleteCurrentNote = async () => {
    if (currentNote?.id && window.electronAPI) {
      await window.electronAPI.deleteNote(currentNote.id);
      setShowNoteEditor(false);
      setCurrentNote(null);
      loadNotes();
    }
  };

  const getModeIcon = () => {
    const icons = {
      apps: '🚀',
      clipboard: '📋',
      notes: '📝',
      calculator: '🔢',
      ai: '🤖',
      web: '🌐'
    };
    return icons[mode] || '🚀';
  };

  const getModeTitle = () => {
    const titles = {
      apps: 'Apps',
      clipboard: 'Clipboard',
      notes: 'Notes',
      calculator: 'Calculator',
      ai: 'AI Chat',
      web: 'Web Search'
    };
    return titles[mode] || 'Apps';
  };

  return (
    <div className="container">
      <div className="header">
        <span className="mode-indicator">{getModeIcon()} {getModeTitle()}</span>
        {isLoading && <span className="loading-indicator">⏳</span>}
      </div>
      
      {showNoteEditor ? (
        <div className="note-editor">
          <input
            type="text"
            className="note-title-input"
            placeholder="Note title..."
            value={currentNote?.title || ''}
            onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
            autoFocus
          />
          <textarea
            className="note-content-input"
            placeholder="Write your note..."
            value={currentNote?.content || ''}
            onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
          />
          <div className="note-actions">
            <button onClick={saveCurrentNote}>💾 Save</button>
            <button onClick={() => { setShowNoteEditor(false); setCurrentNote(null); }}>❌ Cancel</button>
            {currentNote?.id && (
              <button onClick={deleteCurrentNote} className="delete-btn">🗑️ Delete</button>
            )}
          </div>
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder={`Search ${mode}... (try /ai, /notes, /clipboard, /web, or math)`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />

          <ul className="results-list">
            {results.map((item, index) => (
              <li
                key={`${item.type || 'app'}-${item.id || item.file || item.index || index}`}
                className={`result-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => executeAction(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="result-icon">
                  {item.icon || item.type === 'clipboard' ? '📋' : 
                   item.type === 'note' ? '📝' :
                   item.type === 'ai' ? '🤖' :
                   item.type === 'calc' ? '🔢' :
                   item.type === 'new_note' ? '➕' :
                   item.type === 'web_result' ? '🌐' :
                   item.type === 'open_url' ? '🔗' :
                   item.type === 'email' ? '📧' : '📦'}
                </div>
                <div className="result-content">
                  <span className="result-name">
                    {item.name || item.title || item.content?.substring(0, 50) || 'Result'}
                  </span>
                  {item.type === 'clipboard' && (
                    <span className="result-description">{item.content}</span>
                  )}
                  {item.type === 'note' && (
                    <span className="result-description">{item.content?.substring(0, 100)}</span>
                  )}
                  {item.type === 'calc' && item.success && (
                    <span className="result-calc">= {item.result}</span>
                  )}
                  {item.type === 'ai' && item.response && (
                    <span className="result-ai">{item.response}</span>
                  )}
                  {item.exec && (
                    <span className="result-description">{item.exec.split(' ')[0]}</span>
                  )}
                </div>
              </li>
            ))}
            
            {results.length === 0 && query.trim() && !isLoading && (
              <li className="result-item">
                <span className="result-name">No results found for "{query}"</span>
              </li>
            )}
          </ul>
        </>
      )}

      <div className="shortcuts-help">
        <span>↑↓ Navigate</span>
        <span className="separator">•</span>
        <span>↵ Select</span>
        <span className="separator">•</span>
        <span>Esc Close</span>
        <span className="separator">•</span>
        <span>Tab Copy (calc)</span>
        <span className="separator">•</span>
        <span>/ai chat</span>
        <span className="separator">•</span>
        <span>/notes</span>
        <span className="separator">•</span>
        <span>/clipboard</span>
      </div>
    </div>
  );
};

export default App;
