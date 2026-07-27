import React, { useState, useEffect, useRef } from 'react';
import { LANGS } from '../data/languages.jsx';
import { TRANSLATIONS } from '../data/translations.js';

export default function Header({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  user,
  onSignInClick,
  onSignOutClick,
  onAdminClick,
  currentLang = 'es',
  setCurrentLang
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.es;

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const activeLangObj = LANGS[currentLang] || LANGS.es;

  return (
    <nav className="header-nav" style={{ position: 'relative' }}>
      <div className="container header-container">
        <a
          href="#"
          className="logo-link"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
          onClick={(e) => {
            e.preventDefault();
            setSearchQuery('');
            setCurrentView('home');
          }}
        >
          <img
            src="/logo.png"
            alt="AnimeGL Logo"
            className="site-logo-img"
            style={{
              height: '68px',
              width: 'auto',
              objectFit: 'contain',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          />
        </a>

        <div className="search-box">
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentView !== 'browse' && e.target.value !== '') {
                setCurrentView('browse');
              }
            }}
          />
        </div>

        <div className="nav-links">
          <button
            className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => {
              setSearchQuery('');
              setCurrentView('home');
            }}
          >
            {t.home}
          </button>
          <button
            className={`nav-item ${currentView === 'browse' ? 'active' : ''}`}
            onClick={() => setCurrentView('browse')}
          >
            {t.browse}
          </button>
          <button
            className={`nav-item ${currentView === 'favorites' ? 'active' : ''}`}
            onClick={() => setCurrentView('favorites')}
          >
            {t.favorites}
          </button>

          {/* Language Selector Widget (From reference) */}
          <div className="lang-widget-container" ref={langDropdownRef}>
            <button
              className="lang-btn"
              onClick={(e) => {
                e.stopPropagation();
                setLangDropdownOpen(!langDropdownOpen);
              }}
              title={t.changeLanguage}
            >
              <span>{activeLangObj.flag}</span>
              <span>{activeLangObj.name}</span>
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ 
                  transform: langDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                  opacity: 0.85,
                  flexShrink: 0
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {langDropdownOpen && (
              <div className="lang-dropdown">
                {Object.values(LANGS).map((lang) => (
                  <button
                    key={lang.code}
                    className={`lang-option ${currentLang === lang.code ? 'active' : ''}`}
                    onClick={() => {
                      if (setCurrentLang) setCurrentLang(lang.code);
                      setLangDropdownOpen(false);
                    }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User auth layout */}
          {user ? (
            <div className="profile-menu-container" ref={dropdownRef} style={{ position: 'relative' }}>
              <div
                className="comment-avatar"
                style={{
                  cursor: 'pointer',
                  border: dropdownOpen ? '2px solid var(--fuchsia-main)' : '2px solid transparent',
                  boxShadow: dropdownOpen ? '0 0 10px rgba(240, 171, 252, 0.4)' : 'none',
                  transition: 'all 0.2s'
                }}
                onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
              >
                {user.avatar || user.username[0].toUpperCase()}
              </div>

              {dropdownOpen && (
                <div className="glass neon-border" style={dropdownStyle}>
                  <div style={dropdownHeaderStyle}>
                    <div style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>{user.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                  </div>
                  <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', margin: '0.25rem 0' }}></div>
                  <button
                    style={dropdownItemStyle}
                    onClick={() => { setDropdownOpen(false); onAdminClick(); }}
                  >
                    🛠️ {t.adminSettings}
                  </button>
                  <button
                    style={{ ...dropdownItemStyle, color: '#ef4444' }}
                    onClick={() => { setDropdownOpen(false); onSignOutClick(); }}
                  >
                    {t.signOut}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <button
                className="tab-btn"
                onClick={() => onSignInClick('login')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.55rem 1.25rem',
                  fontFamily: 'var(--font-baloo)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-secondary)',
                  borderRadius: '0.75rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {t.signIn}
              </button>

              <button
                className="tab-btn"
                onClick={() => onSignInClick('register')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.55rem 1.35rem',
                  fontFamily: 'var(--font-baloo)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  border: '1px solid rgba(240,171,252,0.4)',
                  background: 'var(--gradient-neon)',
                  color: 'white',
                  borderRadius: '0.75rem',
                  whiteSpace: 'nowrap',
                  boxShadow: 'var(--shadow-neon)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {t.register}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// Inline styles for header profile dropdown
const dropdownStyle = {
  position: 'absolute',
  top: '3.5rem',
  right: 0,
  minWidth: '200px',
  borderRadius: '0.75rem',
  padding: '0.5rem 0',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  zIndex: 105,
  display: 'flex',
  flexDirection: 'column'
};

const dropdownHeaderStyle = {
  padding: '0.5rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.15rem'
};

const dropdownItemStyle = {
  background: 'none',
  border: 'none',
  textAlign: 'left',
  width: '100%',
  padding: '0.6rem 1rem',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontWeight: 600,
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.15s'
};
// Hover states are defined in global stylesheet under .profile-menu-container .tab-btn etc.
