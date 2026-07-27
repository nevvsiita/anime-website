// Centralized Database Service for AnimeGL 3.0
// Manages local persistence for ratings, favorites, catalog data, and user preferences

const STORAGE_KEYS = {
  RATINGS: 'animegl_user_ratings_v3',
  FAVORITES: 'animegl_user_favorites_v3',
  LANGUAGE: 'animegl_lang',
  CATALOG: 'animegl_custom_catalog',
  WATCH_HISTORY: 'animegl_watch_history'
};

class AnimeGLDatabase {
  constructor() {
    this.init();
  }

  init() {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.RATINGS)) {
        localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify({}));
      }
      if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify([]));
      }
      if (!localStorage.getItem(STORAGE_KEYS.WATCH_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify([]));
      }
    } catch (e) {
      console.error('Database initialization error:', e);
    }
  }

  // --- Ratings API ---
  getRating(animeId) {
    try {
      const ratings = JSON.parse(localStorage.getItem(STORAGE_KEYS.RATINGS) || '{}');
      return ratings[animeId] || 0;
    } catch {
      return 0;
    }
  }

  setRating(animeId, value) {
    try {
      const ratings = JSON.parse(localStorage.getItem(STORAGE_KEYS.RATINGS) || '{}');
      if (value > 0) {
        ratings[animeId] = value;
      } else {
        delete ratings[animeId];
      }
      localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratings));
      window.dispatchEvent(new CustomEvent('animegl_db_update', { detail: { type: 'rating', animeId, value } }));
      return true;
    } catch {
      return false;
    }
  }

  // --- Favorites API ---
  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
    } catch {
      return [];
    }
  }

  toggleFavorite(animeId) {
    try {
      const favs = this.getFavorites();
      const exists = favs.includes(animeId);
      const updated = exists ? favs.filter(id => id !== animeId) : [...favs, animeId];
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('animegl_db_update', { detail: { type: 'favorite', animeId, isFav: !exists } }));
      return !exists;
    } catch {
      return false;
    }
  }

  // --- Watch History API ---
  saveProgress(animeId, episode, timestamp = 0) {
    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCH_HISTORY) || '[]');
      const filtered = history.filter(item => item.animeId !== animeId);
      const entry = { animeId, episode, timestamp, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify([entry, ...filtered]));
    } catch (e) {
      console.error('Save progress error:', e);
    }
  }
}

export const db = new AnimeGLDatabase();
