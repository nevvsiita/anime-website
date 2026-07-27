import React, { useState, useEffect } from 'react';

export default function AnimeCard({ anime, onWatch, isAdmin = false, onSetFeaturedBanner }) {
  const animeId = anime?.id;
  const [imgSrc, setImgSrc] = useState(() => anime?.coverUrl || '');
  const [imgError, setImgError] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (anime?.coverUrl) {
      setImgSrc(anime.coverUrl);
      setImgError(false);
    }
  }, [anime?.coverUrl, anime?.backupCoverUrl]);

  // Load user rating from localStorage if set
  const [userRating, setUserRating] = useState(() => {
    if (!animeId) return 0;
    try {
      const saved = localStorage.getItem(`animegl_rating_${animeId}`);
      return saved ? parseInt(saved) : 0;
    } catch {
      return 0;
    }
  });

  const handleStarClick = (e, ratingValue) => {
    e.stopPropagation();
    if (!animeId) return;
    const newRating = userRating === ratingValue ? 0 : ratingValue;
    setUserRating(newRating);
    try {
      if (newRating > 0) {
        localStorage.setItem(`animegl_rating_${animeId}`, newRating.toString());
      } else {
        localStorage.removeItem(`animegl_rating_${animeId}`);
      }
      window.dispatchEvent(new Event('animegl_rating_change'));
    } catch {}
  };

  useEffect(() => {
    if (!animeId) return;
    const updateRating = () => {
      try {
        const saved = localStorage.getItem(`animegl_rating_${animeId}`);
        setUserRating(saved ? parseInt(saved) : 0);
      } catch {}
    };
    window.addEventListener('animegl_rating_change', updateRating);
    return () => window.removeEventListener('animegl_rating_change', updateRating);
  }, [animeId]);

  const handleContextMenu = (e) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  useEffect(() => {
    const handleOutsideClick = () => setShowContextMenu(false);
    if (showContextMenu) {
      window.addEventListener('click', handleOutsideClick);
      window.addEventListener('scroll', handleOutsideClick, { passive: true });
    }
    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('scroll', handleOutsideClick);
    };
  }, [showContextMenu]);

  if (!anime || !animeId) return null;

  const truncatedTitle = anime.title.length > 20 
    ? anime.title.slice(0, 20) + '…' 
    : anime.title;

  const handleImageError = () => {
    if (anime?.backupCoverUrl && imgSrc !== anime.backupCoverUrl) {
      setImgSrc(anime.backupCoverUrl);
    } else {
      setImgError(true);
    }
  };

  return (
    <div 
      className="pc"
      onClick={() => onWatch(anime, 1)}
      onContextMenu={handleContextMenu}
    >
      {/* Clean Poster Cover with Glowing Neon Border */}
      <div className="pci-wrap glass neon-border">
        {imgError || !imgSrc ? (
          <div className="pc-fallback" style={{ background: anime.gradient }}>
            <div className="pc-fallback-icon">⚔️</div>
            <div className="pc-fallback-title">{anime.title}</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.85, marginTop: '0.25rem', fontWeight: 600 }}>
              {anime.year} • {anime.studio}
            </div>
          </div>
        ) : (
          <img 
            className="pci" 
            src={imgSrc} 
            alt={anime.title} 
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleImageError}
          />
        )}
      </div>

      {/* Under cover title info */}
      <div className="pct" title={anime.title}>{truncatedTitle}</div>

      {/* Rating Stars under card title */}
      <div className={`star-rating ${userRating ? 'rated' : ''}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={`sr ${star <= userRating ? 'lit' : ''}`}
            onClick={(e) => handleStarClick(e, star)}
          >
            ★
          </span>
        ))}
      </div>

      {/* Admin Right-Click Context Menu */}
      {showContextMenu && isAdmin && (
        <div 
          style={{
            position: 'fixed',
            left: `${Math.min(menuPos.x, window.innerWidth - 240)}px`,
            top: `${Math.min(menuPos.y, window.innerHeight - 80)}px`,
            zIndex: 99999,
            background: 'rgba(15, 10, 28, 0.98)',
            border: '1px solid var(--fuchsia-main)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.9), 0 0 25px rgba(240, 171, 252, 0.5)',
            borderRadius: '12px',
            padding: '6px',
            backdropFilter: 'blur(16px)',
            minWidth: '230px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'linear-gradient(135deg, rgba(240, 171, 252, 0.25) 0%, rgba(167, 139, 250, 0.25) 100%)',
              border: '1px solid rgba(240, 171, 252, 0.4)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: '700',
              fontFamily: 'var(--font-baloo)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'left'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowContextMenu(false);
              if (onSetFeaturedBanner) onSetFeaturedBanner(anime.id);
            }}
          >
            <span>🌟</span>
            <span>Establecer como Banner Principal</span>
          </button>
        </div>
      )}
    </div>
  );
}
