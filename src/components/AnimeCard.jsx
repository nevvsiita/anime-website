import React, { useState, useEffect } from 'react';

export default function AnimeCard({ anime, onWatch }) {
  const animeId = anime?.id;
  const [imgSrc, setImgSrc] = useState(() => anime?.coverUrl || '');
  const [imgError, setImgError] = useState(false);

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

  if (!anime || !animeId) return null;

  const truncatedTitle = anime.title.length > 20 
    ? anime.title.slice(0, 20) + '…' 
    : anime.title;

  const handleImageError = () => {
    // If MyAnimeList direct fails, switch directly to AniList official cover
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
    </div>
  );
}
