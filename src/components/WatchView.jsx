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

    // Mark as completed if video reaches >= 85% duration (casi al final)
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

  const activeLangObj = LANGS[currentLang] || LANGS.es;

  // 100% Verified Stream Sources (Plays on Chrome, Safari, Firefox, ArtPlayer & HLS)
  const videoStreamSources = [
    'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    'https://vjs.zencdn.net/v/oceans.mp4',
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  ];

  const [streamOffset, setStreamOffset] = useState(0);
  const activeVideoUrl = anime.videoUrl || videoStreamSources[(currentEpisode - 1 + streamOffset) % videoStreamSources.length];

  const [animeflvServer, setAnimeflvServer] = useState('stream'); // 'stream' | 'mega' | 'streamtape' | 'yourupload' | 'okru' | 'official'

  // Server embed source builder
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
    <div className="animate-fade-in" style={{ width: '100%', minHeight: '100vh', padding: '1rem 0' }}>
      {/* Top Bar with Back Button */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <button 
          onClick={onBack}
          className="tab-btn"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.5rem 1.1rem',
            background: 'rgba(240, 171, 252, 0.08)',
            border: '1px solid rgba(240, 171, 252, 0.25)',
            color: 'var(--fuchsia-main)',
            borderRadius: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <span>←</span>
          <span>{t.backToBrowse}</span>
        </button>

        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          AnimeGL Cinema • {anime.isMovie ? (t.movie || 'Película') : `${t.episodeNum || 'Episodio'} ${currentEpisode} de ${totalEpisodesCount}`}
        </span>
      </div>

      {/* Server Selector Bar */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          marginBottom: '1rem', 
          flexWrap: 'wrap',
          background: 'rgba(20, 20, 30, 0.8)',
          padding: '0.6rem 1rem',
          borderRadius: '0.85rem',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '0.4rem' }}>
          ⚡ {t.serverLabel || 'Servidores:'}
        </span>

        {[
          { id: 'mega', label: '⚡ Mega (SUB)' },
          { id: 'streamtape', label: '🚀 Streamtape (SUB)' },
          { id: 'yourupload', label: '📁 YourUpload (SUB)' },
          { id: 'okru', label: '🌟 Okru (SUB)' },
          { id: 'official', label: '🎬 Tráiler Oficial' },
          { id: 'stream', label: '▶ ArtPlayer Direct MP4' }
        ].map((srv) => (
          <button
            key={srv.id}
            onClick={() => setAnimeflvServer(srv.id)}
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              border: animeflvServer === srv.id ? '1px solid var(--fuchsia-main)' : '1px solid rgba(255,255,255,0.08)',
              background: animeflvServer === srv.id ? 'var(--gradient-neon)' : 'rgba(255, 255, 255, 0.04)',
              color: 'white',
              boxShadow: animeflvServer === srv.id ? 'var(--shadow-neon)' : 'none'
            }}
          >
            {srv.label}
          </button>
        ))}
      </div>

      {/* Theater Layout */}
      <div className="watch-layout">
        <div className="player-col">
          <div className="player-card glass neon-border" style={{ position: 'relative' }}>
            <div 
              className="player-ambient-backlight"
              style={{ background: anime.gradient }}
            ></div>

            {/* ArtPlayer / Iframe Player Container */}
            <div className="player-wrapper" style={{ background: '#000', borderRadius: '0.85rem', overflow: 'hidden', aspectRatio: '16/9', position: 'relative' }}>
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

            {/* Episode Navigation Bar (Previous / Next) */}
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '0.85rem 1rem', 
                background: 'rgba(15, 15, 22, 0.9)',
                borderRadius: '0 0 0.85rem 0.85rem',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: '-0.25rem'
              }}
            >
              <button 
                disabled={currentEpisode <= 1}
                onClick={() => onEpisodeChange(currentEpisode - 1)}
                className="tab-btn"
                style={{ 
                  opacity: currentEpisode <= 1 ? 0.35 : 1, 
                  cursor: currentEpisode <= 1 ? 'not-allowed' : 'pointer',
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: '0.5rem',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                ⏮️ {t.prevEpisode || 'Episodio Anterior'}
              </button>

              <span style={{ fontWeight: 800, color: 'var(--fuchsia-main)', fontSize: '0.85rem' }}>
                {anime.isMovie ? `🎬 ${t.movie || 'Película'}` : `${t.episodeNum || 'Episodio'} ${currentEpisode} / ${totalEpisodesCount}`}
              </span>

              <button 
                disabled={currentEpisode >= totalEpisodesCount}
                onClick={() => onEpisodeChange(currentEpisode + 1)}
                className="tab-btn"
                style={{ 
                  opacity: currentEpisode >= totalEpisodesCount ? 0.35 : 1, 
                  cursor: currentEpisode >= totalEpisodesCount ? 'not-allowed' : 'pointer',
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: '0.5rem',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {t.nextEpisode || 'Episodio Siguiente'} ⏭️
              </button>
            </div>
            
            <div className="watch-content">
              <div className="watch-header-row">
                <div className="watch-title-block">
                  <h1>{anime.title} {anime.isMovie ? `— ${t.movie || 'Película'}` : `— ${t.episodeNum || 'Episodio'} ${currentEpisode}`}</h1>
                  <div className="watch-badge-group">
                    <span className="watch-badge rating" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      ★ {userRating ? `${userRating}.0` : '—'}
                    </span>
                    <span className="watch-badge quality">1080p Ultra HD</span>
                    <span className="watch-badge">{anime.studio || 'Studio'}</span>
                    <span className="watch-badge">{anime.year || '2024'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button 
                    onClick={onToggleFavorite}
                    className="btn-primary"
                    style={{ 
                      padding: '0.6rem 1.25rem',
                      background: isFavorite ? 'rgba(239, 68, 68, 0.2)' : undefined,
                      borderColor: isFavorite ? '#ef4444' : undefined,
                      color: isFavorite ? '#fca5a5' : undefined
                    }}
                  >
                    {isFavorite ? `✓ ${t.removeFavorites}` : `♥ ${t.addFavorites}`}
                  </button>
                </div>
              </div>

              {/* Star Rating Section */}
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.85rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Tu valoración:
                </span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => handleStarClick(star)}
                      style={{
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        color: star <= (userRating || 0) ? '#facc15' : 'rgba(255,255,255,0.2)',
                        transition: 'transform 0.15s, color 0.15s',
                        transform: star <= (userRating || 0) ? 'scale(1.15)' : 'scale(1)'
                      }}
                      title={`Valorar con ${star} estrellas`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <p className="watch-synopsis">
                {anime.synopsis}
              </p>

              <div className="watch-meta-grid">
                <div className="meta-item">
                  <div className="meta-label">{t.genres}</div>
                  <div className="meta-value">{anime.genres?.join(', ') || 'Anime'}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">Estudio / Licencia</div>
                  <div className="meta-value">{anime.studio || 'Desconocido'}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">{t.subtitlesBadge}</div>
                  <div className="meta-value" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span>{activeLangObj.flag}</span>
                    <span>{activeLangObj.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Playlist & Episode Sidebar */}
        <div className="sidebar-col">
          {/* Clean Floating Anime Poster Cover */}
          <div 
            className="glass neon-border animate-float"
            style={{
              width: '210px',
              height: '300px',
              borderRadius: '16px',
              overflow: 'hidden',
              margin: '0 auto 1.25rem 0.75rem',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.85), 0 0 30px rgba(240, 171, 252, 0.4)',
              border: '2px solid rgba(240, 171, 252, 0.55)'
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
          </div>

          <div className="episodes-card glass neon-border">
            <h3>{anime.title} — {anime.isMovie ? (t.movie || 'Película') : t.episodes}</h3>
            <div className="episode-list">
              {allEpisodes.map((ep) => (
                <div 
                  key={ep.number}
                  className={`episode-item ${ep.number === currentEpisode ? 'active' : ''}`}
                  onClick={() => onEpisodeChange(ep.number)}
                >
                  <div className="ep-num">{ep.number}</div>
                  <div className="ep-info">
                    <div className="ep-title">{ep.title}</div>
                    <div className="ep-dur">{ep.duration}</div>
                  </div>
                  {ep.number === currentEpisode && (
                    <div className="now-playing-dot"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
