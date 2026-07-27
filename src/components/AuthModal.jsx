import React, { useState, useEffect } from 'react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'register', allowClose = true }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsLogin(initialMode === 'login');
    setErrorMsg('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Pre-validation: Do not allow emails or '@' in the username field
    if (!isLogin) {
      const trimmedUser = username.trim();
      if (!trimmedUser || !email.trim() || !password.trim()) {
        setErrorMsg('Por favor completa todos los campos para registrarte.');
        return;
      }
      if (trimmedUser.includes('@')) {
        setErrorMsg('El nombre de usuario no puede ser un correo electrónico ni contener el símbolo "@".');
        return;
      }
    }

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

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok) {
            userData = data.user;
            tokenData = data.token;
          } else {
            throw new Error(data.error || 'Este correo electrónico o usuario ya está registrado.');
          }
        }
      } catch (e) {
        if (e.message && !e.message.includes('fetch') && !e.message.includes('Failed to fetch') && !e.message.includes('JSON') && !e.message.includes('token')) {
          throw e;
        }
        console.warn('Backend server offline, falling back to local database authentication');
      }

      // If backend was not reached, use LocalStorage client database
      if (!userData) {
        const storedUsers = JSON.parse(localStorage.getItem('animegl_local_users') || '[]');
        const activeUser = JSON.parse(localStorage.getItem('animegl_user') || 'null');

        if (isLogin) {
          const searchInput = email.trim().toLowerCase();
          const foundUser = storedUsers.find(
            u => (u.email && u.email.toLowerCase() === searchInput || u.username && u.username.toLowerCase() === searchInput) && u.password === password
          );

          if (!foundUser) {
            throw new Error('Usuario o contraseña incorrectos. Si no tienes cuenta, regístrate.');
          }

          userData = { id: foundUser.id, username: foundUser.username, email: foundUser.email, role: 'user' };
          tokenData = `token_${Date.now()}_${foundUser.id}`;
        } else {
          // Register flow
          const cleanEmail = email.trim().toLowerCase();
          const cleanUsername = username.trim().toLowerCase();

          const emailExists = storedUsers.some(u => u.email && u.email.toLowerCase() === cleanEmail) ||
                            (activeUser && activeUser.email && activeUser.email.toLowerCase() === cleanEmail);

          if (emailExists) {
            throw new Error('Este correo electrónico ya está registrado. Debes iniciar sesión con tu cuenta.');
          }

          const usernameExists = storedUsers.some(u => u.username && u.username.toLowerCase() === cleanUsername) ||
                               (activeUser && activeUser.username && activeUser.username.toLowerCase() === cleanUsername);

          if (usernameExists) {
            throw new Error('Este nombre de usuario ya está registrado. Debes iniciar sesión.');
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

      // Store active session in localStorage
      localStorage.setItem('animegl_token', tokenData);
      localStorage.setItem('animegl_user', JSON.stringify(userData));

      onAuthSuccess(userData, tokenData);
      onClose();

      // Reset form input fields
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Error al procesar la solicitud');

      if (!isLogin && err.message && (
        err.message.includes('registrado') || 
        err.message.includes('existe') || 
        err.message.includes('ya está') ||
        err.message.includes('iniciar sesión')
      )) {
        setTimeout(() => {
          setIsLogin(true);
        }, 1300);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div className="glass neon-border animate-float" style={modalStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="gradient-text" style={{ fontSize: '1.2rem', fontWeight: 900 }}>
              {isLogin ? '🔑 Iniciar Sesión' : '✨ Crear Cuenta (Registro)'}
            </span>
          </div>
          {allowClose && <button style={closeBtnStyle} onClick={onClose}>✕</button>}
        </div>

        {/* Tab switcher */}
        <div style={tabContainerStyle}>
          <button 
            style={{ 
              ...tabBtnStyle, 
              color: !isLogin ? 'var(--fuchsia-main)' : 'var(--text-secondary)', 
              borderBottom: !isLogin ? '2px solid var(--fuchsia-main)' : 'none' 
            }}
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
          >
            Registrarse
          </button>

          <button 
            style={{ 
              ...tabBtnStyle, 
              color: isLogin ? 'var(--fuchsia-main)' : 'var(--text-secondary)', 
              borderBottom: isLogin ? '2px solid var(--fuchsia-main)' : 'none' 
            }}
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
          >
            Iniciar Sesión
          </button>
        </div>

        {errorMsg && <div style={errorStyle}>{errorMsg}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          {!isLogin && (
            <div style={formGroupStyle}>
              <label style={labelStyle}>Nombre de usuario</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Ej: nevvsiita"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div style={formGroupStyle}>
            <label style={labelStyle}>{isLogin ? 'Correo o Usuario' : 'Correo electrónico'}</label>
            <input
              type="text"
              style={inputStyle}
              placeholder={isLogin ? "Tu correo o nombre de usuario" : "ejemplo@animegl.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              style={inputStyle}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Procesando...' : isLogin ? 'Entrar a mi Cuenta' : 'Crear mi Cuenta Gratis'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Inline Styles for modal layout
const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.85)',
  zIndex: 1100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem'
};

const modalStyle = {
  width: '100%',
  maxWidth: '400px',
  borderRadius: '1.25rem',
  padding: '1.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
};

const headerStyle = {
  display: 'flex',
  justify: 'space-between',
  alignItems: 'center'
};

const closeBtnStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'white',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const tabContainerStyle = {
  display: 'flex',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
};

const tabBtnStyle = {
  flex: 1,
  background: 'none',
  border: 'none',
  padding: '0.5rem 0',
  fontWeight: 700,
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const errorStyle = {
  background: 'rgba(239, 68, 68, 0.15)',
  border: '1px solid rgba(239, 68, 68, 0.4)',
  color: '#fca5a5',
  padding: '0.6rem 0.85rem',
  borderRadius: '0.5rem',
  fontSize: '0.85rem',
  textAlign: 'center'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.9rem'
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem'
};

const labelStyle = {
  fontSize: '0.8rem',
  fontWeight: 700,
  color: 'var(--text-muted)'
};

const inputStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '0.6rem',
  padding: '0.6rem 0.85rem',
  color: 'white',
  outline: 'none',
  fontSize: '0.9rem'
};
