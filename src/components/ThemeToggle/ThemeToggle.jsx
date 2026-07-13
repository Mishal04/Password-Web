import React, { useEffect, useState } from 'react';
import './ThemeToggle.css';
import { FiSun, FiMoon } from 'react-icons/fi';

function ThemeToggle() {
  // Read from localStorage first, fallback to system preference
  const getInitialTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [darkMode, setDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.dataset.theme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      root.dataset.theme = 'light';
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggle = () => setDarkMode((prev) => !prev);

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
      {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
    </button>
  );
}

export default ThemeToggle;

