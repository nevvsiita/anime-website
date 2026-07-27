import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../data/translations.js';

export default function Hero({ featuredAnime, featuredAnimes = [], onWatch, currentLang = 'es' }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.es;

  // Build carousel array from featuredAnimes or single featuredAnime
  const slides = featuredAnimes && featuredAnimes.length > 0 
    ? featuredAnimes.slice(0, 7)
    : (featuredAnime ? [featuredAnime] : []);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Light pastel glowing gradients array
  const lightPastelGradients = [
    'linear-gradient(135deg, rgba(240, 171, 252, 0.28) 0%, rgba(192, 132, 252, 0.20) 50%, rgba(147, 197, 253, 0.28) 100%)',
    'linear-gradient(135deg, rgba(167, 139, 250, 0.28) 0%, rgba(251, 113, 133, 0.22) 50%, rgba(253, 186, 116, 0.28) 100%)',
    'linear-gradient(135deg, rgba(110, 231, 183, 0.28) 0%, rgba(147, 197, 253, 0.22) 50%, rgba(240, 171, 252, 0.28) 100%)',
    'linear-gradient(135deg, rgba(253, 224, 71, 0.25) 0%, rgba(244, 114, 182, 0.22) 50%, rgba(192, 132, 252, 0.28) 100%)',
    'linear-gradient(135deg, rgba(251, 113, 133, 0.28) 0%, rgba(167, 139, 250, 0.22) 50%, rgba(129, 140, 248, 0.28) 100%)'
  ];

  // Auto-slide carousel timer (every 10 seconds)
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const activeAnime = slides[currentIndex] || featuredAnime;
  if (!activeAnime) return null;

  const currentPastelGradient = lightPastelGradients[currentIndex % lightPastelGradients.length];

  return (
    <section className="hero-sec" style={{ position: 'relative' }}>
      <div 
        className="hero-banner glass neon-border"
        style={{ 
          backgroundImage: `linear-gradient(rgba(12, 12, 18, 0.45), rgba(7, 7, 12, 0.95)), ${currentPastelGradient}, ${activeAnime.gradient}`,
          transition: 'all 0.8s ease-in-out',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="hero-overlay"></div>

        {/* 10-Second Progress Indicator Bar at Top of Banner */}
        {slides.length > 1 && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 10
          }}>
            <div 
              key={currentIndex} 
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #f0abfc, #c084fc)',
                width: '100%',
                transformOrigin: 'left',
                animation: 'progressFill 10s linear'
              }}
            />
          </div>
        )}

        {/* Carousel Content with Silky Smooth Slide Right Animation */}
        <div 
          className="hero-content" 
          key={activeAnime.id} 
          style={{ 
            animation: 'slideRightSmooth 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            willChange: 'transform, opacity, filter'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span className="hero-badge animate-float">{t.featuredSeries}</span>
          </div>

          <h1 className="hero-title">{activeAnime.title}</h1>
          <p className="hero-desc">{activeAnime.synopsis}</p>
          
          <div className="hero-meta">
            <div className="hero-meta-item">
              <span>{t.rating}:</span>
              <span className="hero-meta-val" style={{ color: '#fbbf24' }}>
                ★ {activeAnime.rating}
              </span>
            </div>
            <div className="hero-meta-item">
              <span>{t.studio}:</span>
              <span className="hero-meta-val">{activeAnime.studio}</span>
            </div>
            <div className="hero-meta-item">
              <span>{t.year}:</span>
              <span className="hero-meta-val">{activeAnime.year}</span>
            </div>
            <div className="hero-meta-item">
              <span>{t.episodes}:</span>
              <span className="hero-meta-val">{activeAnime.episodesCount} eps</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <button 
              className="btn-primary"
              onClick={() => onWatch(activeAnime, 1)}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"></polygon>
              </svg>
              <span>{t.watchNow}</span>
            </button>

            {/* Visual Slide Position Indicators */}
            {slides.length > 1 && (
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', pointerEvents: 'none', userSelect: 'none' }}>
                {slides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    style={{
                      width: idx === currentIndex ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: idx === currentIndex ? 'var(--fuchsia-main)' : 'rgba(255,255,255,0.25)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: idx === currentIndex ? '0 0 10px rgba(240, 171, 252, 0.6)' : 'none'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Featured Anime Poster Cover on Right Side */}
        <div 
          key={activeAnime.id + '_cover'} 
          className="hero-poster-card"
          onClick={() => onWatch(activeAnime, 1)}
          title={activeAnime.title}
        >
          <img 
            src={activeAnime.coverUrl || activeAnime.backupCoverUrl} 
            alt={activeAnime.title}
            referrerPolicy="no-referrer"
            className="hero-poster-img"
          />
          <div className="hero-poster-overlay">
            <span className="hero-poster-title">{activeAnime.title}</span>
          </div>
        </div>

        {/* Embedded Keyframes for Smooth Slide Right and 10s Progress Bar */}
        <style>{`
          @keyframes slideRightSmooth {
            0% {
              opacity: 0;
              transform: translate3d(-140px, 0, 0);
              filter: blur(10px);
            }
            40% {
              opacity: 0.7;
            }
            100% {
              opacity: 1;
              transform: translate3d(0, 0, 0);
              filter: blur(0px);
            }
          }
          @keyframes progressFill {
            0% {
              transform: scaleX(0);
            }
            100% {
              transform: scaleX(1);
            }
          }
        `}</style>
      </div>
    </section>
  );
}
