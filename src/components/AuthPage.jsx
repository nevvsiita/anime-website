import React, { useState, useRef, useEffect } from 'react';
import { TRANSLATIONS } from '../data/translations.js';
import { LANGS } from '../data/languages.jsx';

export default function AuthPage({ onAuthSuccess, initialMode = 'register', currentLang = 'es', onLangChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.es;
  const activeLangObj = LANGS[currentLang] || LANGS.es;

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email: email.trim(), password } 
      : { username: username.trim(), email: email.trim(), password };

    try {
      let userData = null;
      let tokenData = null;

      // Try backend server first
      try {
        const apiUrl = window.location.hostname === 'localhost' 
          ? `http://localhost:3001${endpoint}` 
          : `${endpoint}`;

        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          userData = data.user;
          tokenData = data.token;
        }
      } catch (e) {
        console.warn('Backend offline, using local database auth');
      }

      // LocalStorage client fallback
      if (!userData) {
        const storedUsers = JSON.parse(localStorage.getItem('animegl_local_users') || '[]');

        if (isLogin) {
          const searchInput = email.trim().toLowerCase();
          const foundUser = storedUsers.find(
            u => (u.email.toLowerCase() === searchInput || u.username.toLowerCase() === searchInput) && u.password === password
          );

          if (!foundUser) {
            throw new Error('Credenciales incorrectas. Verifica tu correo/usuario y contraseña.');
          }

          userData = { id: foundUser.id, username: foundUser.username, email: foundUser.email, role: 'user' };
          tokenData = `token_${Date.now()}_${foundUser.id}`;
        } else {
          // Register Mode
          if (!username.trim() || !email.trim() || !password) {
            throw new Error('Por favor completa todos los campos.');
          }

          const existingUser = storedUsers.find(
            u => u.email.toLowerCase() === email.trim().toLowerCase() || u.username.toLowerCase() === username.trim().toLowerCase()
          );

          if (existingUser) {
            throw new Error('El usuario o correo electrónico ya existe. Inicia sesión.');
          }

          const newUser = {
            id: `usr_${Date.now()}`,
            username: username.trim(),
            email: email.trim(),
            password: password,
            createdAt: new Date().toISOString()
          };

          storedUsers.push(newUser);
          localStorage.setItem('animegl_local_users', JSON.stringify(storedUsers));

          userData = { id: newUser.id, username: newUser.username, email: newUser.email, role: 'user' };
          tokenData = `token_${Date.now()}_${newUser.id}`;
        }
      }

      onAuthSuccess(userData, tokenData);
    } catch (err) {
      setErrorMsg(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Google Login Fallback
  const handleGoogleLogin = () => {
    const mockUser = {
      id: `usr_google_${Date.now()}`,
      username: 'GoogleUser',
      email: 'user@google.com',
      role: 'user'
    };
    onAuthSuccess(mockUser, `token_google_${Date.now()}`);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'radial-gradient(ellipse at 50% 25%, rgba(240, 171, 252, 0.18) 0%, rgba(167, 139, 250, 0.12) 35%, rgba(24, 16, 42, 0.98) 70%, #080512 100%), linear-gradient(180deg, #1b122c 0%, #0a0718 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      overflowY: 'auto',
      fontFamily: "'Baloo 2', 'Karla', sans-serif"
    }}>
      {/* Top Bar Language Selector Dropdown (Identical to Header.jsx) */}
      <div 
        style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.5rem',
          zIndex: 30
        }}
        ref={langDropdownRef}
      >
        <div className="lang-widget-container">
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
                    if (onLangChange) onLangChange(lang.code);
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
      </div>

      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px'
      }}>
        {/* Large Official AnimeGL Logo Image */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '18px' }}>
          <img 
            src="/logo.png" 
            alt="AnimeGL Logo"
            style={{
              height: '175px',
              maxHeight: '24vh',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 35px rgba(240, 171, 252, 0.95)) drop-shadow(0 0 65px rgba(101, 113, 214, 0.85))',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Original AnimeGL Tagline Translated */}
        <div style={{
          fontFamily: "'Inconsolata', monospace, sans-serif",
          fontSize: '0.92rem',
          color: 'rgba(255, 255, 255, 0.65)',
          textAlign: 'center',
          lineHeight: 1.7,
          maxWidth: '32rem',
          marginTop: '6px'
        }}>
          {t.taglinePrefix || 'Impresiona a tus amigos con este elegante'}{' '}
          <span style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '4px 10px',
            color: '#aeb8ff',
            fontWeight: 600
          }}>
            {currentLang === 'es' ? 'reproductor de anime en la nube' : currentLang === 'en' ? 'cloud anime player' : currentLang === 'ca' ? 'reproductor d\'anime al núvol' : currentLang === 'it' ? 'lettore anime nel cloud' : 'lecteur anime dans le cloud'}
          </span>
          . {t.taglineSuffix || 'Es brillante, es moderno y te hace ver 10% más otaku.'}
        </div>
        <p style={{
          fontFamily: "'Inconsolata', monospace, sans-serif",
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.3)',
          textAlign: 'center',
          marginTop: '4px'
        }}>
          {t.disclaimerText || 'No comprobado científicamente, pero creemos en ti.'}
        </p>

        {/* Flat Glass Expandable Button */}
        <div 
          onClick={() => !isExpanded && setIsExpanded(true)}
          style={{
            background: isExpanded 
              ? 'rgba(14, 10, 26, 0.95)' 
              : '#6571D6',
            border: isExpanded ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            borderRadius: isExpanded ? '24px' : '9999px',
            padding: isExpanded ? '28px 32px' : '8px 20px',
            width: '100%',
            maxWidth: isExpanded ? '440px' : '230px',
            marginTop: '16px',
            boxShadow: isExpanded ? '0 20px 60px rgba(0, 0, 0, 0.6)' : 'none',
            cursor: !isExpanded ? 'pointer' : 'default',
            transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
            overflow: 'hidden'
          }}
        >
          {!isExpanded ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              color: 'white',
              fontFamily: 'var(--font-baloo)',
              fontSize: '0.88rem',
              fontWeight: 800,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap'
            }}>
              <span>{t.signInOrRegister || 'Registrarse / Iniciar Sesión'}</span>
            </div>
          ) : (
            <>
              <h2 style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                marginBottom: '26px',
                color: '#fff',
                fontFamily: 'var(--font-baloo)',
                textAlign: 'left'
              }}>
                {isLogin ? (t.signIn || 'Iniciar sesión') : (t.register || 'Crear cuenta')}
              </h2>

          {/* Error Message */}
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              marginBottom: '18px',
              textAlign: 'left'
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isLogin && (
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  required
                  placeholder=" "
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={inputStyle}
                  id="regUser"
                />
                <label htmlFor="regUser" style={labelStyle}>{t.usernameLabel || 'Nombre de usuario'}</label>
              </div>
            )}

            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                required
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                id="loginEmail"
              />
              <label htmlFor="loginEmail" style={labelStyle}>{t.emailLabel || 'Correo electrónico'}</label>
            </div>

            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="password"
                required
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                id="loginPassword"
              />
              <label htmlFor="loginPassword" style={labelStyle}>{t.passwordLabel || 'Contraseña'}</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '10px',
                padding: '14px',
                background: 'linear-gradient(135deg, #6571D6 0%, #8b95e8 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.05rem',
                fontWeight: 800,
                cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-baloo)',
                boxShadow: '0 4px 18px rgba(101, 113, 214, 0.35)'
              }}
            >
              {loading ? '...' : (isLogin ? t.signIn : t.register)}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.25)',
            margin: '22px 0 18px',
            fontSize: '0.85rem'
          }}>
            <span style={{ flex: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}></span>
            <span style={{ padding: '0 12px' }}>o</span>
            <span style={{ flex: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}></span>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-baloo)'
            }}
          >
            <svg style={{ width: '18px', height: '18px', fill: '#fff' }} viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{t.orContinueWithGoogle || 'O continuar con Google'}</span>
          </button>

          {/* Toggle Mode Footer Link */}
          <div style={{
            marginTop: '22px',
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.45)',
            display: 'flex',
            gap: '6px',
            justifyContent: 'center'
          }}>
            <a
              href="#toggle"
              onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); setErrorMsg(''); }}
              style={{ color: '#8b95e8', textDecoration: 'none', fontWeight: 700 }}
            >
              {isLogin ? (t.dontHaveAccount || '¿No tienes cuenta? Regístrate') : (t.alreadyHaveAccount || '¿Ya tienes cuenta? Inicia sesión')}
            </a>
          </div>
            </>
          )}
        </div>
      </div>

      {/* Clean Bottom Footer Credits with Sakura Pill Button on the Right */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        marginTop: '2.5rem',
        padding: '12px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        textAlign: 'center',
        fontFamily: 'var(--font-baloo)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.55rem',
          flexWrap: 'wrap'
        }}>
          <span style={{
            fontSize: '0.86rem',
            color: 'rgba(255, 255, 255, 0.65)',
            fontWeight: 600
          }}>
            {t.developedWithText || 'Desarrollado con mucho React, JavaScript y Café por'}
          </span>

          {/* Sakura Pill Button nevvsiita on the right side */}
          <a 
            href="https://github.com/nevvsiita" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'linear-gradient(90deg, #f472b6 0%, #ec4899 50%, #f43f5e 100%)',
              padding: '0.28rem 0.85rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 0 15px rgba(244, 114, 182, 0.55)',
              color: 'white',
              fontFamily: 'var(--font-baloo)',
              fontWeight: 800,
              fontSize: '0.82rem',
              textDecoration: 'none'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="8" cy="8" r="4" />
              <circle cx="16" cy="8" r="4" />
              <circle cx="16" cy="16" r="4" />
              <circle cx="8" cy="16" r="4" />
            </svg>
            <span>nevvsiita</span>
          </a>
        </div>

        <p style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.25)', margin: 0 }}>
          {t.footerRights || 'Todos los derechos reservados © 2026'}
        </p>
      </div>
    </div>
  );
}

// Floating Label Input Inline Styles
const inputStyle = {
  width: '100%',
  padding: '18px 20px 10px',
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '0.98rem',
  fontFamily: 'var(--font-baloo)',
  outline: 'none',
  transition: 'all 0.2s ease'
};

const labelStyle = {
  position: 'absolute',
  left: '20px',
  top: '14px',
  color: 'rgba(255, 255, 255, 0.45)',
  fontSize: '0.9rem',
  pointerEvents: 'none',
  transition: 'all 0.2s ease'
};
