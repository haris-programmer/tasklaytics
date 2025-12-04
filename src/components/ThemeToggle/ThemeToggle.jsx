import { useState, useEffect } from 'react';
import './ThemeToggle.css';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update localStorage and DOM
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDark]);

  const handleToggle = () => {
    setIsDark(!isDark);
  };

  return (
    <button
      className="theme-toggle"
      onClick={handleToggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Glow layers */}
      <div className="theme-toggle__glow-outer" />
      <div className="theme-toggle__glow-inner" />

      {/* Toggle track */}
      <div className="theme-toggle__track">
        {/* Knob */}
        <div className={`theme-toggle__knob ${isDark ? 'theme-toggle__knob--active' : ''}`}>
          {isDark ? (
            <svg className="theme-toggle__icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg className="theme-toggle__icon" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
