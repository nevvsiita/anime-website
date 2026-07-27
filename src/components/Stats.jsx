import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../data/translations.js';

export default function Stats({ currentLang = 'es', watchHistory = [], user = null }) {
  const [avgRating, setAvgRating] = useState(null);
  const [votesCount, setVotesCount] = useState(0);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.es;

  // Calculate user-specific watched episodes count (Only 100% completed episodes count)
  const totalUserEpisodes = (watchHistory || []).reduce((acc, item) => {
    if (item.completedEpisodes && Array.isArray(item.completedEpisodes)) {
      return acc + item.completedEpisodes.length;
    }
    return acc + (item.completed === true ? 1 : 0);
  }, 0);

  const calculateRating = () => {
    try {
      let total = 0;
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('animegl_rating_')) {
          const val = parseInt(localStorage.getItem(key) || '0');
          if (val > 0) {
            total += val;
            count++;
          }
        }
      }
      setVotesCount(count);
      setAvgRating(count > 0 ? (total / count).toFixed(1) : null);
    } catch {
      setAvgRating(null);
      setVotesCount(0);
    }
  };

  useEffect(() => {
    calculateRating();
    window.addEventListener('animegl_rating_change', calculateRating);
    return () => window.removeEventListener('animegl_rating_change', calculateRating);
  }, []);

  return (
    <div className="stats-grid">
      <div className="stat-card glass neon-border">
        <div className="stat-value gradient-text">{totalUserEpisodes}</div>
        <div className="stat-label">
          {user ? `Episodios Vistos (${user.username})` : t.episodesStreamed}
        </div>
      </div>
      <div className="stat-card glass neon-border">
        <div className="stat-value gradient-text">
          {avgRating ? `${avgRating}★` : '—'}
        </div>
        <div className="stat-label">
          {votesCount > 0 
            ? `${t.averageUserRating} (${votesCount} ${votesCount === 1 ? t.vote : t.votes})` 
            : `${t.averageUserRating} (${t.noVotes})`}
        </div>
      </div>
      <div className="stat-card glass neon-border">
        <div className="stat-value gradient-text">100%</div>
        <div className="stat-label">{t.adFreeUnlimited}</div>
      </div>
      <div className="stat-card glass neon-border">
        <div className="stat-value gradient-text">1080p</div>
        <div className="stat-label">{t.ultraQuality}</div>
      </div>
    </div>
  );
}
