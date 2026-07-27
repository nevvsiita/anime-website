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
          onClick={this.handleReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at 50% 50%, #160b26 0%, #09090e 75%)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
        >
          {/* Ambient Glow background */}
          <div style={{
            position: 'absolute',
            width: '280px',
            height: '280px',
            background: 'radial-gradient(circle, rgba(240, 171, 252, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
            pointerEvents: 'none',
            animation: 'pulseGlow 2.5s ease-in-out infinite alternate'
          }} />

          {/* Minimalist Pure Spinning Circle Animation */}
          <div style={{
            position: 'relative',
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Spinning Ring */}
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '3px solid rgba(240, 171, 252, 0.15)',
              borderTopColor: '#f0abfc',
              borderRightColor: '#c084fc',
              animation: 'spinRing 0.9s linear infinite',
              boxShadow: '0 0 25px rgba(240, 171, 252, 0.45)'
            }} />
          </div>

          <style>{`
            @keyframes spinRing {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes pulseGlow {
              0% { transform: scale(0.85); opacity: 0.4; }
              100% { transform: scale(1.1); opacity: 0.8; }
            }
          `}</style>
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
