import React, { useRef, useState, useEffect } from 'react';
import AnimeCard from './AnimeCard';

export default function AnimeRow({ title, tag, animes, onWatch, favorites, onToggleFavorite }) {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position to disable/enable arrows
  const checkScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    // Allow 4px margin of error
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = rowRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      // Run once on load/resize
      checkScroll();
      
      // Delay check slightly to let children render
      const timer = setTimeout(checkScroll, 300);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        clearTimeout(timer);
      };
    }
  }, [animes]);

  const validAnimes = Array.isArray(animes) ? animes.filter(a => a && a.id) : [];
  if (validAnimes.length === 0) return null;

  const scroll = (direction) => {
    const el = rowRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="sec" style={{ padding: '0 0.5rem 1rem' }}>
      <div className="sec-hdr" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
        <span 
          className="row-icon-tag" 
          style={{ 
            fontSize: '0.85rem', 
            opacity: 0.85, 
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'scale(0.85)'
          }}
        >
          {tag}
        </span>
        <h2 className="sec-title" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{title}</h2>
      </div>

      <div className="row-wrap">
        {/* Left Arrow */}
        <button 
          className="row-arrow left" 
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
        >
          ‹
        </button>

        {/* Scrollable Row */}
        <div className="row" ref={rowRef}>
          <div className="row-spacer"></div>
          {validAnimes.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              onWatch={onWatch}
              isFavorite={Array.isArray(favorites) ? favorites.includes(anime.id) : false}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
          <div className="row-spacer"></div>
        </div>

        {/* Right Arrow */}
        <button 
          className="row-arrow right" 
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
        >
          ›
        </button>
      </div>
    </div>
  );
}
