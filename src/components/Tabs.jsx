import React from 'react';
import { TRANSLATIONS } from '../data/translations.js';

const GENRES = ['All', 'Action', 'Fantasy', 'Romance', 'Comedy', 'Sci-Fi', 'Mystery'];

export default function Tabs({ activeGenre, setActiveGenre, currentLang = 'es' }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.es;

  const getGenreName = (g) => {
    if (g === 'All') return t.allGenres;
    if (g === 'Action') return t.action;
    if (g === 'Fantasy') return t.fantasy;
    if (g === 'Romance') return t.romance;
    if (g === 'Comedy') return t.comedy;
    if (g === 'Sci-Fi') return t.sciFi;
    if (g === 'Mystery') return t.mystery;
    return g;
  };

  return (
    <div className="tabs-sec">
      <div className="tabs-container">
        {GENRES.map((genre) => (
          <button
            key={genre}
            className={`tab-btn ${activeGenre === genre ? 'active' : ''}`}
            onClick={() => setActiveGenre(genre)}
          >
            {getGenreName(genre)}
          </button>
        ))}
      </div>
    </div>
  );
}
