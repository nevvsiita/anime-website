import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, isReloading: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AnimeGL Error Boundary Caught Exception:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ isReloading: true });
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    setTimeout(() => {
      window.location.href = window.location.origin + window.location.pathname;
    }, 600);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at 50% 50%, #160b26 0%, #09090e 75%)',
            color: '#fff',
            fontFamily: 'var(--font-baloo), system-ui, sans-serif',
            padding: '2rem',
            textAlign: 'center'
          }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(240, 171, 252, 0.3)',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            maxWidth: '460px',
            width: '100%',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌸</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.8rem', color: '#f0abfc' }}>
              AnimeGL v3.0
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.75)', marginBottom: '1.8rem', lineHeight: '1.5' }}>
              Se ha detectado un pequeño error de carga. Haz clic abajo para reiniciar la aplicación.
            </p>

            <button 
              onClick={this.handleReset}
              style={{
                background: 'linear-gradient(135deg, #f0abfc 0%, #a78bfa 100%)',
                color: '#090718',
                fontWeight: 800,
                border: 'none',
                padding: '0.85rem 1.8rem',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(240, 171, 252, 0.45)',
                transition: 'all 0.2s ease'
              }}
            >
              {this.state.isReloading ? 'Cargando...' : '🔄 Reiniciar Aplicación'}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
