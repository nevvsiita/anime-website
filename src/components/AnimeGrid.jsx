import React from 'react';
import AnimeCard from './AnimeCard';

export default function AnimeGrid({ animes, onWatch, favorites, onToggleFavorite, emptyMessage, isAdmin, onSetFeaturedBanner }) {
  const validAnimes = Array.isArray(animes) ? animes.filter(a => a && a.id) : [];

  if (validAnimes.length === 0) {
    return (
      <div className="empty-view glass neon-border">
        <div className="empty-icon animate-float">
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </div>
        <h3 className="empty-title">Nothing Found</h3>
        <p className="empty-text">{emptyMessage || "No matches correspond to this category or query."}</p>
      </div>
    );
  }

  return (
    <div className="anime-grid">
      {validAnimes.map((anime) => (
        <AnimeCard
          key={anime.id}
          anime={anime}
          onWatch={onWatch}
          isFavorite={Array.isArray(favorites) ? favorites.includes(anime.id) : false}
          onToggleFavorite={onToggleFavorite}
          isAdmin={isAdmin}
          onSetFeaturedBanner={onSetFeaturedBanner}
        />
      ))}
    </div>
  );
}
