import React, { useState, useEffect, useCallback } from 'react';
import Fuse from 'fuse.js';

const App = () => {
  const [query, setQuery] = useState('');
  const [apps, setApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState('apps'); // 'apps', 'commands', 'clipboard'

  useEffect(() => {
    loadApps();
    
    if (window.electronAPI) {
      window.electronAPI.onShowWindow(() => {
        setQuery('');
        setSelectedIndex(0);
      });
    }
  }, []);

  const loadApps = async () => {
    if (window.electronAPI) {
      const loadedApps = await window.electronAPI.searchApps('');
      setApps(loadedApps);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setFilteredApps(apps.slice(0, 10));
      return;
    }

    const fuse = new Fuse(apps, {
      keys: ['name', 'exec'],
      threshold: 0.3,
      includeScore: true
    });

    const results = fuse.search(query).slice(0, 10);
    setFilteredApps(results.map(r => r.item));
    setSelectedIndex(0);
  }, [query, apps]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredApps.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' && filteredApps[selectedIndex]) {
      e.preventDefault();
      launchApp(filteredApps[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // Hide window would be handled by blur
    }
  }, [filteredApps, selectedIndex]);

  const launchApp = async (app) => {
    if (window.electronAPI) {
      await window.electronAPI.launchApp(app.exec);
      setQuery('');
      // Window will hide on blur
    }
  };

  const executeQuickCommand = async (command) => {
    if (window.electronAPI) {
      const result = await window.electronAPI.executeCommand(command);
      console.log('Command result:', result);
    }
  };

  return (
    <div className="container" style={{
      position: 'absolute',
      top: '20%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '700px'
    }}>
      <div className="mode-indicator">
        {mode === 'apps' ? '🚀 Apps' : mode === 'commands' ? '⚡ Commands' : '📋 Clipboard'}
      </div>
      
      <input
        type="text"
        className="search-input"
        placeholder="Search applications..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />

      <ul className="results-list">
        {filteredApps.map((app, index) => (
          <li
            key={`${app.file}-${index}`}
            className={`result-item ${index === selectedIndex ? 'selected' : ''}`}
            onClick={() => launchApp(app)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="result-icon">
              {app.icon ? app.icon.charAt(0).toUpperCase() : '📦'}
            </div>
            <span className="result-name">{app.name}</span>
            <span className="result-description">{app.exec.split(' ')[0]}</span>
          </li>
        ))}
        
        {filteredApps.length === 0 && query.trim() && (
          <li className="result-item">
            <span className="result-name">No results found for "{query}"</span>
          </li>
        )}
      </ul>

      <div style={{
        marginTop: '12px',
        padding: '8px 16px',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.4)'
      }}>
        <span>↑↓ Navigate</span>
        <span style={{ margin: '0 8px' }}>•</span>
        <span>↵ Launch</span>
        <span style={{ margin: '0 8px' }}>•</span>
        <span>Esc Close</span>
      </div>
    </div>
  );
};

export default App;
