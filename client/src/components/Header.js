'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Sun, Moon } from './Icons';

// Random comment: Always remember to stay hydrated while coding!

export default function Header({ navigation = [] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("ser-theme");
      if (storedTheme !== "light") {
        document.documentElement.classList.add("dark-mode");
        // eslint-disable-next-line
        setIsDarkMode(true);
      }
    } catch (e) {
      console.warn("localStorage is not accessible");
    }
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('nav-active');
    } else {
      document.body.classList.remove('nav-active');
    }
    return () => document.body.classList.remove('nav-active');
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    try {
      if (isDarkMode) {
        root.classList.remove('dark-mode');
        localStorage.setItem('ser-theme', 'light');
        setIsDarkMode(false);
      } else {
        root.classList.add('dark-mode');
        localStorage.setItem('ser-theme', 'dark');
        setIsDarkMode(true);
      }
    } catch (e) {
      console.warn("localStorage is not accessible");
      setIsDarkMode(!isDarkMode); // Still toggle state if localStorage fails
    }
  };

  return (
    <header>
      <nav className={isMenuOpen ? 'nav-open' : ''}>
        <div className="logo">
          <Link href="/">
            <img src="/assets/images/brand/logo.svg" alt="SER Logo" style={{ height: '50px' }} />
          </Link>
        </div>

        <div className="mobile-header-title">
          Scout&apos;s Emergency Response
        </div>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            {navigation.map((nav, index) => (
              <li key={index}>
                <Link href={nav.href} onClick={() => setIsMenuOpen(false)}>
                  {nav.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="header-actions">
          <button 
            className="theme-toggle" 
            type="button" 
            onClick={toggleTheme}
            aria-pressed={isDarkMode} 
            aria-label="Toggle dark mode"
          >
            <span className="theme-toggle__icon">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</span>
            <span>{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>
          <button 
            id="menu-toggle" 
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {!isMenuOpen ? (
              <svg className="icon-menu" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            ) : (
              <svg className="icon-close" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
