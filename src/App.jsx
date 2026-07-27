import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Tabs from './components/Tabs';
import AnimeGrid from './components/AnimeGrid';
import AnimeRow from './components/AnimeRow';
import WatchView from './components/WatchView';
import Footer from './components/Footer';
import Starfield from './components/Starfield';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import AuthPage from './components/AuthPage';
import { animeData, getLocalizedAnime } from './data/animeData';
import { TRANSLATIONS } from './data/translations.js';

// Custom User Video Intro Component with Reverse Playback and AnimeGL Neon Color Replacement
function CustomUserVideoIntro({ onComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [fadeOut, setFadeOut] = useState(false);

  const handleEnded = () => {
    setFadeOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);
  };

  useEffect(() => {
    let animId;
    let reverseInterval;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      handleEnded();
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Handle reverse playback
    const startReversePlayback = () => {
      if (!video || !video.duration) return;
      video.pause();
      video.currentTime = video.duration;

      const step = 0.033; // FPS step
      reverseInterval = setInterval(() => {
        if (video && video.currentTime > step) {
          video.currentTime -= step;
        } else {
          clearInterval(reverseInterval);
          handleEnded();
        }
      }, 33);
    };

    video.addEventListener('loadedmetadata', startReversePlayback);
    if (video.duration) startReversePlayback();

    const renderLoop = () => {
      if (video && video.videoWidth && video.videoHeight) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;
        const len = data.length;

        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // 1. Green screen chroma key condition
          if (g > 60 && g > r * 1.08 && g > b * 1.08) {
            data[i + 3] = 0; // Transparent
          } 
          // 2. Replace white / bright pixels with AnimeGL neon pastel gradient colors (#f0abfc / #a78bfa)
          else if (r > 150 && g > 150 && b > 150) {
            const brightness = (r + g + b) / 3;
            const factor = brightness / 255;

            // Brand Neon Pastel Colors (#f0abfc fuchsia / #6571d6 indigo)
            data[i] = Math.min(255, Math.floor(240 * factor));     // Red
            data[i + 1] = Math.min(255, Math.floor(171 * factor)); // Green
            data[i + 2] = Math.min(255, Math.floor(252 * factor)); // Blue
          }
        }

        ctx.putImageData(frame, 0, 0);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    // Fallback safety timer
    const timer = setTimeout(() => {
      handleEnded();
    }, 3000);

    return () => {
      cancelAnimationFrame(animId);
      if (reverseInterval) clearInterval(reverseInterval);
      clearTimeout(timer);
      if (video) video.removeEventListener('loadedmetadata', startReversePlayback);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: fadeOut ? 'none' : 'auto'
    }}>
      {/* Video element positioned off-screen for active GPU frame decoding */}
      <video
        ref={videoRef}
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        onError={handleEnded}
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: '640px',
          height: '360px',
          opacity: 0.01,
          pointerEvents: 'none'
        }}
      />

      {/* Real-time Filtered Transparent Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'cover'
        }}
      />
    </div>
  );
}

export default function App() {
  // Registered User State & Session Persistence
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('animegl_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [showIntro, setShowIntro] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'browse' | 'watch' | 'favorites'
  const [selectedAnime, setSelectedAnime] = useState(animeData[0]);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  // Force AuthModal to open if user is not authenticated yet
  const [isAuthOpen, setIsAuthOpen] = useState(!user);
  const [authMode, setAuthMode] = useState('register'); // 'login' | 'register'

  // Trigger video intro upon login / registration unlock
  const handleAuthSuccess = (userData, tokenData) => {
    setUser(userData);
    localStorage.setItem('animegl_user', JSON.stringify(userData));
    localStorage.setItem('animegl_token', tokenData);
    setIsAuthOpen(false);
    
    // Play video intro animation immediately after user unlocks/authenticates
    setShowIntro(true);
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('animegl_user');
    localStorage.removeItem('animegl_token');
    setIsAuthOpen(true);
    setShowIntro(false);
  };

  // Language state (default: 'es' Español automático al entrar)
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('animegl_lang') || 'es';
  });

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.es;

  // Ensure default language is Spanish on first load
  useEffect(() => {
    if (!localStorage.getItem('animegl_lang')) {
      localStorage.setItem('animegl_lang', 'es');
    }
  }, []);

  // Persist language selection
  useEffect(() => {
    localStorage.setItem('animegl_lang', currentLang);
  }, [currentLang]);

  // Catalog initialization with 100% fresh official database
  const [catalog, setCatalog] = useState(() => animeData);

  // Localized catalog for current selected language
  const localizedCatalog = catalog
    .map(anime => getLocalizedAnime(anime, currentLang))
    .filter(Boolean);

  // Save custom catalog to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('animegl_custom_catalog', JSON.stringify(catalog));
    } catch {}
  }, [catalog]);

  // Per-User Favorites state
  const [favorites, setFavorites] = useState(() => {
    try {
      const storageKey = user ? `animegl_favorites_${user.id}` : 'animegl_favorites';
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : ['cyberpunk-edgerunners', 'chainsaw-man', 'solo-leveling'];
    } catch {
      return ['cyberpunk-edgerunners', 'chainsaw-man', 'solo-leveling'];
    }
  });

  // Sync favorites when user switches
  useEffect(() => {
    try {
      const storageKey = user ? `animegl_favorites_${user.id}` : 'animegl_favorites';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setFavorites(JSON.parse(saved));
      } else if (!user) {
        setFavorites(['cyberpunk-edgerunners', 'chainsaw-man', 'solo-leveling']);
      } else {
        setFavorites([]);
      }
    } catch {}
  }, [user]);

  // Save favorites per active user
  useEffect(() => {
    try {
      const storageKey = user ? `animegl_favorites_${user.id}` : 'animegl_favorites';
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    } catch {}
  }, [favorites, user]);

  // Per-User Watch History state
  const [watchHistory, setWatchHistory] = useState(() => {
    try {
      const storageKey = user ? `animegl_history_${user.id}` : 'animegl_watch_history';
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [
        { animeId: 'cyberpunk-edgerunners', episode: 2, timestamp: Date.now() - 3600000 },
        { animeId: 'chainsaw-man', episode: 1, timestamp: Date.now() - 86400000 }
      ];
    } catch {
      return [];
    }
  });

  // Sync watch history when user switches
  useEffect(() => {
    try {
      const storageKey = user ? `animegl_history_${user.id}` : 'animegl_watch_history';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setWatchHistory(JSON.parse(saved));
      } else if (!user) {
        setWatchHistory([
          { animeId: 'cyberpunk-edgerunners', episode: 2, timestamp: Date.now() - 3600000 },
          { animeId: 'chainsaw-man', episode: 1, timestamp: Date.now() - 86400000 }
        ]);
      } else {
        setWatchHistory([]);
      }
    } catch {}
  }, [user]);

  // Save watch history per active user
  useEffect(() => {
    try {
      const storageKey = user ? `animegl_history_${user.id}` : 'animegl_watch_history';
      localStorage.setItem(storageKey, JSON.stringify(watchHistory));
    } catch {}
  }, [watchHistory, user]);

  // Global Anti-Code Copy & DevTools Inspector Shield
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        (e.ctrlKey && ['U', 'u', 'S', 's'].includes(e.key))
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Secret Admin Key combination Easter Egg (type "agl" on keyboard to open panel)
  useEffect(() => {
    let keyBuffer = '';
    const handleKeydown = (e) => {
      // Don't trigger if user typing in input fields
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      keyBuffer += e.key.toLowerCase();
      if (keyBuffer.length > 5) keyBuffer = keyBuffer.slice(-5);
      if (keyBuffer.includes('agl')) {
        setIsAdminOpen(true);
        keyBuffer = '';
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // Handle Watch action
  const handleWatch = (anime, episodeNum = 1) => {
    setSelectedAnime(anime);
    setSelectedEpisode(episodeNum);
    setCurrentView('watch');

    setWatchHistory((prev) => {
      const existing = prev.find(h => h.animeId === anime.id);
      const filtered = prev.filter(h => h.animeId !== anime.id);
      return [
        { 
          animeId: anime.id, 
          episode: episodeNum, 
          completedEpisodes: existing?.completedEpisodes || [],
          completed: existing?.completed || false,
          timestamp: Date.now() 
        }, 
        ...filtered
      ];
    });
  };

  // Mark episode as 100% completed when playback finishes
  const handleEpisodeComplete = (animeId, episodeNum) => {
    setWatchHistory((prev) => {
      const existingIndex = prev.findIndex(h => h.animeId === animeId);
      if (existingIndex >= 0) {
        const item = prev[existingIndex];
        const completedEpisodes = item.completedEpisodes ? [...item.completedEpisodes] : [];
        if (!completedEpisodes.includes(episodeNum)) {
          completedEpisodes.push(episodeNum);
        }
        const updated = [...prev];
        updated[existingIndex] = { ...item, completedEpisodes, completed: true, episode: episodeNum };
        return updated;
      }
      return [
        { 
          animeId, 
          episode: episodeNum, 
          completedEpisodes: [episodeNum], 
          completed: true, 
          timestamp: Date.now() 
        }, 
        ...prev
      ];
    });
  };

  // Handle Favorite toggle
  const handleToggleFavorite = (animeId) => {
    if (favorites.includes(animeId)) {
      setFavorites(favorites.filter(id => id !== animeId));
    } else {
      setFavorites([...favorites, animeId]);
    }
  };

  // Filter shows based on search query across ALL languages and active genre
  const getFilteredAnimes = () => {
    return localizedCatalog.filter((anime) => {
      if (!anime) return false;
      const animeGenres = Array.isArray(anime.genres) ? anime.genres : [];
      const matchesGenre = activeGenre === 'All' || animeGenres.includes(activeGenre);

      if (!searchQuery || !searchQuery.trim()) {
        return matchesGenre;
      }
      const query = searchQuery.toLowerCase().trim();

      // Search in current title + all titleByLang entries + ID
      const titles = anime.titleByLang ? Object.values(anime.titleByLang) : [anime.title];
      const matchesTitle = titles.some(t => t && t.toString().toLowerCase().includes(query)) || 
                           (anime.title && anime.title.toString().toLowerCase().includes(query)) ||
                           (anime.id && anime.id.toString().toLowerCase().includes(query));

      // Search in current synopsis + all synopsisByLang entries
      const synopses = anime.synopsisByLang ? Object.values(anime.synopsisByLang) : [anime.synopsis];
      const matchesSynopsis = synopses.some(s => s && s.toString().toLowerCase().includes(query)) || 
                              (anime.synopsis && anime.synopsis.toString().toLowerCase().includes(query));

      // Search in genres and studio
      const matchesGenres = animeGenres.some(g => g && g.toString().toLowerCase().includes(query));
      const matchesStudio = anime.studio ? anime.studio.toString().toLowerCase().includes(query) : false;

      const matchesSearch = matchesTitle || matchesSynopsis || matchesGenres || matchesStudio;

      return matchesSearch && matchesGenre;
    });
  };

  // Handle Genre tab click
  const handleGenreChange = (genre) => {
    setActiveGenre(genre);
    if (currentView !== 'home' && currentView !== 'browse') {
      setCurrentView('browse');
    }
  };

  // Pick a random anime from catalog and watch episode 1
  const handleRandomClick = () => {
    if (localizedCatalog.length === 0) return;
    const randomIndex = Math.floor(Math.random() * localizedCatalog.length);
    const randomAnime = localizedCatalog[randomIndex];
    handleWatch(randomAnime, 1);
  };

  // Add anime handler
  const handleAddAnime = (newAnime) => {
    setCatalog([...catalog, newAnime]);
  };

  // Remove anime handler
  const handleRemoveAnime = (animeId) => {
    setCatalog(catalog.filter(a => a.id !== animeId));
    // Clean up selected anime if deleted
    if (selectedAnime?.id === animeId) {
      setSelectedAnime(catalog.find(a => a.id !== animeId) || null);
    }
    // Clean up favorites and history
    setFavorites(favorites.filter(id => id !== animeId));
    setWatchHistory(watchHistory.filter(h => h.animeId !== animeId));
  };

  // Filtered lists
  const filteredAnimes = getFilteredAnimes();
  const favoriteAnimes = localizedCatalog.filter(anime => favorites.includes(anime.id));
  const featuredAnime = localizedCatalog.find(a => a.id === 'cyberpunk-edgerunners') || localizedCatalog[0] || null;

  // Category Shelf: Seguir Viendo (Continue Watching) mapped to catalog shows
  const continueWatchingAnimes = watchHistory
    .map(h => {
      const anime = localizedCatalog.find(a => a.id === h.animeId);
      if (!anime) return null;
      return { ...anime, lastWatchedEpisode: h.episode };
    })
    .filter(Boolean);

  // Category Shelf: Tendencias (Trending - Ratings >= 4.85)
  const trendingAnimes = [...localizedCatalog]
    .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    .slice(0, 10);

  // Strict Unauthenticated User Gate: Block 100% of website content if not logged in
  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
        <Starfield />
        <div className="ambient-glow-1"></div>
        <div className="ambient-glow-2"></div>
        <AuthPage 
          onAuthSuccess={handleAuthSuccess}
          initialMode={authMode}
          currentLang={currentLang}
          onLangChange={setCurrentLang}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Dynamic Starfield Background */}
      <Starfield />

      {/* Background ambient blobs */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      <Header 
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRandomClick={handleRandomClick}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        user={user}
        onSignInClick={(mode = 'register') => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        onSignOutClick={handleSignOut}
        onAdminClick={() => setIsAdminOpen(true)}
      />

      <main style={{ flex: 1, paddingBottom: '3rem', zIndex: 1 }}>
        {currentView === 'home' && (
          <div className="container">
            {localizedCatalog.length > 0 && (
              <Hero 
                featuredAnime={featuredAnime} 
                featuredAnimes={localizedCatalog.slice(0, 8)}
                onWatch={handleWatch} 
                currentLang={currentLang}
              />
            )}
            <Stats currentLang={currentLang} watchHistory={watchHistory} user={user} />
            <Tabs 
              activeGenre={activeGenre} 
              setActiveGenre={handleGenreChange} 
              currentLang={currentLang}
            />

            {/* Shelf: Continue Watching (only if history exists) */}
            {continueWatchingAnimes.length > 0 && (
              <AnimeRow
                title={t.continueWatching}
                tag="▶"
                animes={continueWatchingAnimes}
                onWatch={(anime) => handleWatch(anime, anime.lastWatchedEpisode)}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {/* Shelf: Recommended (Custom catalog filtered by active genre/search) */}
            <AnimeRow
              title={activeGenre === 'All' ? t.recommendedForYou : `${activeGenre} — ${t.recommendedForYou}`}
              tag="★"
              animes={filteredAnimes}
              onWatch={(anime) => handleWatch(anime, 1)}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Shelf: Trending Shelf */}
            <AnimeRow
              title={t.trendingNow}
              tag="🔥"
              animes={trendingAnimes}
              onWatch={(anime) => handleWatch(anime, 1)}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Shelf: My List (Favorites as horizontal slider shelf) */}
            {favoriteAnimes.length > 0 && (
              <AnimeRow
                title={t.favorites}
                tag="✓"
                animes={favoriteAnimes}
                onWatch={(anime) => handleWatch(anime, 1)}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </div>
        )}

        {currentView === 'browse' && (
          <div className="container" style={{ marginTop: '2.5rem' }}>
            <Tabs 
              activeGenre={activeGenre} 
              setActiveGenre={handleGenreChange} 
              currentLang={currentLang}
            />
            <h2 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 800 }}>
              {searchQuery ? `"${searchQuery}"` : `${activeGenre} Anime`}
            </h2>
            <AnimeGrid 
              animes={filteredAnimes} 
              onWatch={handleWatch}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}

        {currentView === 'watch' && selectedAnime && (
          <WatchView 
            anime={getLocalizedAnime(selectedAnime, currentLang)}
            currentEpisode={selectedEpisode}
            onEpisodeChange={setSelectedEpisode}
            isFavorite={favorites.includes(selectedAnime.id)}
            onToggleFavorite={handleToggleFavorite}
            onBack={() => setCurrentView('home')}
            currentLang={currentLang}
            onEpisodeComplete={handleEpisodeComplete}
          />
        )}

        {currentView === 'favorites' && (
          <div className="container" style={{ marginTop: '2.5rem' }}>
            <span className="section-tag animate-float">
              <span className="dot" style={{ background: '#f0abfc' }}></span>
              <span>{t.favorites}</span>
            </span>
            <h2 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 800 }}>{t.favorites}</h2>
            <AnimeGrid 
              animes={favoriteAnimes} 
              onWatch={handleWatch}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              emptyMessage={t.noFavoritesYet}
            />
          </div>
        )}
      </main>

      <Footer currentLang={currentLang} />

      {/* Optional Header Auth Modal */}
      {user && isAuthOpen && (
        <AuthModal 
          isOpen={isAuthOpen}
          initialMode={authMode}
          allowClose={true}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Secret Admin Panel Modal */}
      <AdminPanel 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        catalog={catalog}
        onAddAnime={handleAddAnime}
        onRemoveAnime={handleRemoveAnime}
      />

      {/* Custom User Video Project 5.mp4 Intro */}
      {showIntro && (
        <CustomUserVideoIntro 
          onComplete={() => setShowIntro(false)} 
        />
      )}
    </div>
  );
}
