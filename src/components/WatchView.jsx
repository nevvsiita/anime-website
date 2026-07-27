import React, { useState, useEffect, useRef } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { LANGS } from '../data/languages.jsx';
import { TRANSLATIONS } from '../data/translations.js';
import { db } from '../services/database.js';

// Dedicated ArtPlayer component matching AnimeGL original architecture
function ArtPlayerContainer({ url, poster, onEnded, onComplete }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let hasCompleted = false;

    const art = new Artplayer({
      container: containerRef.current,
      url: url,
      type: url.includes('.m3u8') ? 'm3u8' : 'auto',
      poster: poster,
      autoplay: true,
      volume: 0.9,
      setting: true,
      playbackRate: true,
      pip: true,
      fullscreen: true,
      playsInline: true,
      screenshot: true,
      airplay: true,
      fastForward: true,
      theme: '#f0abfc',
      customType: {
        m3u8: function(video, url, art) {
          if (Hls.isSupported()) {
            if (art.hls) art.hls.destroy();
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            art.hls = hls;
            art.on('destroy', () => { try { hls.destroy(); } catch(e){} });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
          }
        }
      },
      icons: {
        loading: '<svg width="50" height="50" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="rgba(240,171,252,.7)" stroke-width="6" fill="none" stroke-dasharray="60 200"><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite"/></circle></svg>',
      }
    });

    // Mark as completed if video reaches >= 85% duration
    art.on('video:timeupdate', () => {
      if (!hasCompleted && art.duration > 0) {
        const progress = art.currentTime / art.duration;
        if (progress >= 0.85) {
          hasCompleted = true;
          if (onComplete) onComplete();
        }
      }
    });

    if (onEnded) {
      art.on('video:ended', () => {
        if (!hasCompleted && onComplete) onComplete();
        onEnded();
      });
    }

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
      }
    };
  }, [url, poster]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

export default function WatchView({ 
  anime, 
  currentEpisode, 
  onEpisodeChange, 
  isFavorite, 
  onToggleFavorite,
  onBack,
  currentLang = 'es',
  onEpisodeComplete
}) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.es;

  const [userRating, setUserRating] = useState(() => {
    return db.getRating(anime?.id);
  });

  const [epSearch, setEpSearch] = useState('');

  const handleStarClick = (ratingValue) => {
    if (!anime?.id) return;
    const newRating = userRating === ratingValue ? 0 : ratingValue;
    setUserRating(newRating);
    db.setRating(anime.id, newRating);
  };

  // Update Discord Rich Presence & OS MediaSession metadata
  useEffect(() => {
    if (!anime) return;
    const epTitle = anime.title;
    const epState = anime.isMovie 
      ? `Película — ${anime.studio} (${anime.year})`
      : `${t.episodeNum || 'Episodio'} ${currentEpisode} — ${anime.studio} (${anime.year})`;

    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: epTitle,
          artist: epState,
          album: 'AnimeGL 3.0 Cinema',
          artwork: [
            { src: anime.coverUrl || '', sizes: '512x512', type: 'image/jpeg' }
          ]
        });
        navigator.mediaSession.playbackState = 'playing';
      } catch {}
    }

    try {
      fetch('http://localhost:3001/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          details: epTitle,
          state: epState,
          largeImage: anime.coverUrl,
          startTimestamp: Math.floor(Date.now() / 1000)
        })
      }).catch(() => {});
    } catch {}
  }, [anime, currentEpisode, currentLang]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [anime, currentEpisode]);

  if (!anime) return null;

  const totalEpisodesCount = anime.episodesCount || anime.episodes?.length || 12;
  const allEpisodes = Array.from({ length: totalEpisodesCount }).map((_, i) => {
    const epNum = i + 1;
    const existing = anime.episodes?.find(e => e.number === epNum);
    return existing || {
      number: epNum,
      title: `${t.episodeNum || 'Episodio'} ${epNum}`,
      duration: '24m'
    };
  });

  const filteredEpisodes = allEpisodes.filter(ep => {
    if (!epSearch.trim()) return true;
    return (
      ep.number.toString().includes(epSearch.trim()) ||
      ep.title.toLowerCase().includes(epSearch.toLowerCase())
    );
  });

  const activeLangObj = LANGS[currentLang] || LANGS.es;

  // Stream Sources
  const videoStreamSources = [
    'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    'https://vjs.zencdn.net/v/oceans.mp4',
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  ];

  const [streamOffset, setStreamOffset] = useState(0);
  const activeVideoUrl = anime.videoUrl || videoStreamSources[(currentEpisode - 1 + streamOffset) % videoStreamSources.length];

  const [animeflvServer, setAnimeflvServer] = useState('stream');

  const getEmbedUrl = () => {
    if (animeflvServer === 'official') {
      return anime.trailerEmbedUrl ? `${anime.trailerEmbedUrl}&autoplay=1` : `https://www.youtube-nocookie.com/embed/${anime.youtubeId || 'pU309S3aJq0'}?autoplay=1&rel=0`;
    }
    if (animeflvServer === 'stream') {
      return activeVideoUrl;
    }
    if (animeflvServer === 'mega') {
      return `https://www.youtube-nocookie.com/embed/${anime.youtubeId || 'pU309S3aJq0'}?autoplay=1&controls=1`;
    }
    if (animeflvServer === 'streamtape') {
      return `https://www.youtube-nocookie.com/embed/${anime.youtubeId || 'pU309S3aJq0'}?autoplay=1&modestbranding=1`;
    }
    if (animeflvServer === 'yourupload') {
      return `https://www.youtube-nocookie.com/embed/${anime.youtubeId || 'pU309S3aJq0'}?autoplay=1`;
    }
    if (animeflvServer === 'okru') {
      return `https://www.youtube-nocookie.com/embed/${anime.youtubeId || 'pU309S3aJq0'}?autoplay=1`;
    }
    return activeVideoUrl;
  };

  return (
    <div className="watch-view-wrapper animate-fade-in" style={{ width: '100%', minHeight: '100vh', padding: '1.25rem 0 3rem' }}>
      
      {/* Top Header Breadcrumb & Back Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        <button 
          onClick={onBack}
          className="tab-btn"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            padding: '0.65rem 1.35rem',
            background: 'linear-gradient(135deg, rgba(240, 171, 252, 0.15) 0%, rgba(192, 132, 252, 0.1) 100%)',
            border: '1px solid rgba(240, 171, 252, 0.35)',
            color: '#ffffff',
            borderRadius: '0.85rem',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(240, 171, 252, 0.2)',
            transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>←</span>
          <span>{t.backToBrowse}</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(15, 10, 26, 0.8)',
          padding: '0.5rem 1rem',
          borderRadius: '0.85rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--fuchsia-main)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            AnimeGL Cinema
          </span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
            {anime.title}
          </span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span style={{ 
            fontSize: '0.8rem', 
            fontWeight: 800, 
            background: 'var(--gradient-neon)', 
            padding: '2px 8px', 
            borderRadius: '12px', 
            color: 'white' 
          }}>
            {anime.isMovie ? (t.movie || 'Película') : `${t.episodeNum || 'Episodio'} ${currentEpisode}`}
          </span>
        </div>
      </div>

      {/* Server Selector Bar */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.6rem', 
          marginBottom: '1.25rem', 
          flexWrap: 'wrap',
          background: 'rgba(18, 14, 30, 0.85)',
          padding: '0.75rem 1.25rem',
          borderRadius: '1rem',
          border: '1px solid rgba(240, 171, 252, 0.25)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(240, 171, 252, 0.15)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--fuchsia-main)', marginRight: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>⚡</span>
          <span>{t.serverLabel || 'Servidores de Reproducción:'}</span>
        </span>

        {[
          { id: 'mega', label: '⚡ Mega (SUB)' },
          { id: 'streamtape', label: '🚀 Streamtape (SUB)' },
          { id: 'yourupload', label: '📁 YourUpload (SUB)' },
          { id: 'okru', label: '🌟 Okru (SUB)' },
          { id: 'official', label: '🎬 Tráiler Oficial' },
          { id: 'stream', label: '▶ ArtPlayer Direct HD' }
        ].map((srv) => (
          <button
            key={srv.id}
            onClick={() => setAnimeflvServer(srv.id)}
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              borderRadius: '0.65rem',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              border: animeflvServer === srv.id ? '1px solid var(--fuchsia-main)' : '1px solid rgba(255,255,255,0.1)',
              background: animeflvServer === srv.id ? 'var(--gradient-neon)' : 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              boxShadow: animeflvServer === srv.id ? '0 0 20px rgba(240, 171, 252, 0.5), 0 4px 12px rgba(0,0,0,0.4)' : 'none',
              transform: animeflvServer === srv.id ? 'translateY(-2px)' : 'none'
            }}
          >
            {srv.label}
          </button>
        ))}
      </div>

      {/* Main Theater Layout Grid */}
      <div className="watch-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.75rem' }}>
        
        {/* Left Main Player & Content Column */}
        <div className="player-col">
          <div className="player-card glass neon-border" style={{ position: 'relative', borderRadius: '1.25rem', overflow: 'hidden' }}>
            
            {/* Ambient Backlight Glow behind player */}
            <div 
              className="player-ambient-backlight"
              style={{ background: anime.gradient, opacity: 0.7, filter: 'blur(50px)' }}
            ></div>

            {/* Video Player Container */}
            <div className="player-wrapper" style={{ background: '#000', width: '100%', aspectRatio: '16/9', position: 'relative' }}>
              {animeflvServer === 'stream' ? (
                <ArtPlayerContainer 
                  key={`${anime.id}-${currentEpisode}-${activeVideoUrl}`}
                  url={activeVideoUrl}
                  poster={anime.coverUrl}
                  onComplete={() => {
                    if (onEpisodeComplete) onEpisodeComplete(anime.id, currentEpisode);
                  }}
                  onEnded={() => {
                    if (onEpisodeComplete) onEpisodeComplete(anime.id, currentEpisode);
                    if (currentEpisode < totalEpisodesCount) {
                      onEpisodeChange(currentEpisode + 1);
                    }
                  }}
                />
              ) : (
                <iframe
                  key={`${anime.id}-${currentEpisode}-${animeflvServer}`}
                  title={`${anime.title} Episode ${currentEpisode}`}
                  src={getEmbedUrl()}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                ></iframe>
              )}
            </div>

            {/* Integrated Player Control Bar */}
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '0.9rem 1.25rem', 
                background: 'linear-gradient(180deg, rgba(16, 12, 28, 0.95) 0%, rgba(10, 8, 18, 0.98) 100%)',
                borderTop: '1px solid rgba(240, 171, 252, 0.2)',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >
              <button 
                disabled={currentEpisode <= 1}
                onClick={() => onEpisodeChange(currentEpisode - 1)}
                className="tab-btn"
                style={{ 
                  opacity: currentEpisode <= 1 ? 0.35 : 1, 
                  cursor: currentEpisode <= 1 ? 'not-allowed' : 'pointer',
                  padding: '0.5rem 1.1rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  borderRadius: '0.6rem',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.15)',
                  transition: 'all 0.2s'
                }}
              >
                ⏮️ {t.prevEpisode || 'Episodio Anterior'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ 
                  fontWeight: 800, 
                  color: '#ffffff', 
                  fontSize: '0.9rem',
                  background: 'rgba(240, 171, 252, 0.15)',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(240, 171, 252, 0.3)'
                }}>
                  {anime.isMovie ? `🎬 ${t.movie || 'Película'}` : `${t.episodeNum || 'Episodio'} ${currentEpisode} de ${totalEpisodesCount}`}
                </span>
              </div>

              <button 
                disabled={currentEpisode >= totalEpisodesCount}
                onClick={() => onEpisodeChange(currentEpisode + 1)}
                className="tab-btn"
                style={{ 
                  opacity: currentEpisode >= totalEpisodesCount ? 0.35 : 1, 
                  cursor: currentEpisode >= totalEpisodesCount ? 'not-allowed' : 'pointer',
                  padding: '0.5rem 1.1rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  borderRadius: '0.6rem',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.15)',
                  transition: 'all 0.2s'
                }}
              >
                {t.nextEpisode || 'Episodio Siguiente'} ⏭️
              </button>
            </div>
            
            {/* Anime Info & Meta Section */}
            <div className="watch-content" style={{ padding: '1.75rem' }}>
              <div className="watch-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div className="watch-title-block">
                  <h1 style={{ 
                    fontSize: '1.85rem', 
                    fontWeight: 900, 
                    marginBottom: '0.6rem',
                    background: 'linear-gradient(90deg, #ffffff 0%, #f0abfc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2
                  }}>
                    {anime.title} {anime.isMovie ? `— ${t.movie || 'Película'}` : `— ${t.episodeNum || 'Episodio'} ${currentEpisode}`}
                  </h1>
                  
                  <div className="watch-badge-group" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="watch-badge rating" style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)', background: 'rgba(251, 191, 36, 0.08)' }}>
                      ★ {userRating ? `${userRating}.0` : (anime.rating || '4.8')}
                    </span>
                    <span className="watch-badge quality" style={{ color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.3)', background: 'rgba(96, 165, 250, 0.08)' }}>
                      1080p Ultra HD
                    </span>
                    <span className="watch-badge" style={{ color: '#c084fc' }}>{anime.studio || 'Studio'}</span>
                    <span className="watch-badge">{anime.year || '2024'}</span>
                    <span className="watch-badge" style={{ color: '#34d399' }}>{totalEpisodesCount} eps</span>
                  </div>
                </div>

                <button 
                  onClick={onToggleFavorite}
                  className="btn-primary"
                  style={{ 
                    padding: '0.65rem 1.35rem',
                    borderRadius: '0.75rem',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    background: isFavorite ? 'rgba(239, 68, 68, 0.25)' : undefined,
                    borderColor: isFavorite ? '#ef4444' : undefined,
                    color: isFavorite ? '#fca5a5' : undefined,
                    boxShadow: isFavorite ? '0 0 20px rgba(239, 68, 68, 0.4)' : undefined
                  }}
                >
                  {isFavorite ? `✓ ${t.removeFavorites}` : `♥ ${t.addFavorites}`}
                </button>
              </div>

              {/* Interactive Star Rating Bar */}
              <div style={{ 
                marginTop: '1.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.85rem', 
                background: 'rgba(255, 255, 255, 0.03)', 
                padding: '0.7rem 1.1rem', 
                borderRadius: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  Tu valoración de la serie:
                </span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => handleStarClick(star)}
                      style={{
                        fontSize: '1.35rem',
                        cursor: 'pointer',
                        color: star <= (userRating || 0) ? '#facc15' : 'rgba(255,255,255,0.2)',
                        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: star <= (userRating || 0) ? 'scale(1.2)' : 'scale(1)'
                      }}
                      title={`Valorar con ${star} estrellas`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {/* Synopsis Description Card */}
              <div style={{
                marginTop: '1.25rem',
                padding: '1.25rem',
                background: 'rgba(14, 10, 24, 0.6)',
                borderRadius: '0.85rem',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--fuchsia-main)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Sinopsis del Anime
                </h4>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.65', color: 'rgba(255, 255, 255, 0.88)', margin: 0 }}>
                  {anime.synopsis}
                </p>
              </div>

              {/* Meta Grid Specs */}
              <div className="watch-meta-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
                gap: '1rem', 
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div className="meta-item" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="meta-label" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>{t.genres}</div>
                  <div className="meta-value" style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>{anime.genres?.join(', ') || 'Action, Anime'}</div>
                </div>

                <div className="meta-item" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="meta-label" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Estudio / Licencia</div>
                  <div className="meta-value" style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>{anime.studio || 'Desconocido'}</div>
                </div>

                <div className="meta-item" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="meta-label" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>{t.subtitlesBadge}</div>
                  <div className="meta-value" style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{activeLangObj.flag}</span>
                    <span>{activeLangObj.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Playlist & Episode Column */}
        <div className="sidebar-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Featured Anime Poster Banner Card */}
          <div 
            className="glass neon-border animate-float"
            style={{
              width: '100%',
              height: '240px',
              borderRadius: '1.25rem',
              overflow: 'hidden',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.85), 0 0 30px rgba(240, 171, 252, 0.35)',
              border: '2px solid rgba(240, 171, 252, 0.5)',
              position: 'relative'
            }}
          >
            <img 
              src={anime.coverUrl || anime.backupCoverUrl} 
              alt={anime.title}
              referrerPolicy="no-referrer"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '1.25rem 1rem 0.75rem',
              background: 'linear-gradient(to top, rgba(9, 9, 14, 0.95) 0%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--fuchsia-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Serie en Reproducción
              </span>
              <span style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
                {anime.title}
              </span>
            </div>
          </div>

          {/* Episode List Card */}
          <div className="episodes-card glass neon-border" style={{ borderRadius: '1.25rem', padding: '1.25rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                {anime.isMovie ? (t.movie || 'Película') : `${t.episodes} (${totalEpisodesCount})`}
              </h3>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--fuchsia-main)', background: 'rgba(240,171,252,0.12)', padding: '2px 8px', borderRadius: '10px' }}>
                HD 1080p
              </span>
            </div>

            {/* Episode Search Filter */}
            {totalEpisodesCount > 5 && (
              <div style={{ marginBottom: '1rem' }}>
                <input 
                  type="text"
                  placeholder="🔍 Buscar episodio..."
                  value={epSearch}
                  onChange={(e) => setEpSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.82rem',
                    borderRadius: '0.65rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    outline: 'none',
                    fontFamily: 'var(--font-sans)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {/* Episode List Container */}
            <div className="episode-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredEpisodes.map((ep) => {
                const isActive = ep.number === currentEpisode;
                return (
                  <div 
                    key={ep.number}
                    className={`episode-item ${isActive ? 'active' : ''}`}
                    onClick={() => onEpisodeChange(ep.number)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '0.75rem',
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(240, 171, 252, 0.25) 0%, rgba(192, 132, 252, 0.2) 100%)' 
                        : 'rgba(255, 255, 255, 0.03)',
                      border: isActive 
                        ? '1px solid var(--fuchsia-main)' 
                        : '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      boxShadow: isActive ? '0 4px 15px rgba(240, 171, 252, 0.3)' : 'none',
                      transform: isActive ? 'scale(1.02)' : 'none'
                    }}
                  >
                    <div className="ep-num" style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isActive ? 'var(--gradient-neon)' : 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {ep.number}
                    </div>

                    <div className="ep-info" style={{ flex: 1, minWidth: 0 }}>
                      <div className="ep-title" style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: 700, 
                        color: isActive ? 'var(--fuchsia-main)' : '#ffffff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {ep.title}
                      </div>
                      <div className="ep-dur" style={{ fontSize: '0.72rem', opacity: 0.7, color: 'var(--text-muted)', marginTop: '2px' }}>
                        {ep.duration} • Full HD
                      </div>
                    </div>

                    {isActive && (
                      <span style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 800, 
                        background: '#ef4444', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        letterSpacing: '0.5px',
                        flexShrink: 0,
                        animation: 'pulse 1.5s infinite'
                      }}>
                        REPRODUCIENDO
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
