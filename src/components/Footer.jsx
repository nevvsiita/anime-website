import React from 'react';
import { TRANSLATIONS } from '../data/translations.js';

export default function Footer({ currentLang = 'es' }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.es;

  return (
    <footer className="footer-sec" style={{ padding: '2rem 0 1.5rem', borderTop: '1px solid var(--border-subtle)', background: 'rgba(9, 7, 24, 0.6)' }}>
      <div className="container footer-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', textAlign: 'center' }}>
        
        {/* Inline Horizontal Credits with Sakura Pill Button on the right */}
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
            fontWeight: 600,
            fontFamily: 'var(--font-baloo)'
          }}>
            {t.developedWithText || 'Desarrollado con mucho React, JavaScript y Café por'}
          </span>

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
              textDecoration: 'none',
              transition: 'transform 0.2s ease'
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
          {t.footerRights || `Todos los derechos reservados © ${new Date().getFullYear()}`}
        </p>
      </div>
    </footer>
  );
}
