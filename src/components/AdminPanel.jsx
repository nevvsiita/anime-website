import React, { useState } from 'react';

const PASTEL_PRESETS = [
  { name: 'Pink-Purple', value: 'linear-gradient(135deg, #fbcfe8 0%, #c084fc 100%)' },
  { name: 'Peach-Red', value: 'linear-gradient(135deg, #ffedd5 0%, #fca5a5 100%)' },
  { name: 'Teal-Blue', value: 'linear-gradient(135deg, #99f6e4 0%, #bae6fd 100%)' },
  { name: 'Mint-Jade', value: 'linear-gradient(135deg, #ccfbf1 0%, #a7f3d0 100%)' }
];

export default function AdminPanel({ isOpen, onClose, catalog, onAddAnime, onRemoveAnime }) {
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [rating, setRating] = useState('4.8');
  const [studio, setStudio] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [youtubeId, setYoutubeId] = useState('OLg84xA4lgo');
  const [genresText, setGenresText] = useState('Action, Sci-Fi');
  const [selectedGradient, setSelectedGradient] = useState(PASTEL_PRESETS[0].value);
  const [malId, setMalId] = useState('50265');
  const [isMovie, setIsMovie] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !synopsis.trim() || !studio.trim()) {
      alert('Please fill out Title, Synopsis, and Studio.');
      return;
    }

    const mId = Number(malId) || 50265;
    const epsCount = isMovie ? 1 : 12;

    const newAnime = {
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      malId: mId,
      isMovie,
      title,
      coverUrl: coverUrl || 'https://cdn.myanimelist.net/images/anime/1806/126216.jpg',
      synopsis,
      rating,
      year,
      status: 'Ongoing',
      episodesCount: epsCount,
      studio,
      genres: genresText.split(',').map(g => g.trim()).filter(Boolean),
      gradient: selectedGradient,
      youtubeId: youtubeId || 'OLg84xA4lgo',
      episodes: isMovie 
        ? [{ number: 1, title: 'Full Movie', duration: '2h 0m', videoId: youtubeId || 'OLg84xA4lgo' }]
        : Array.from({ length: epsCount }).map((_, i) => ({
            number: i + 1,
            title: `Episode ${i + 1}`,
            duration: '24m',
            videoId: youtubeId || 'OLg84xA4lgo'
          }))
    };

    onAddAnime(newAnime);
    
    // Reset form fields
    setTitle('');
    setSynopsis('');
    setStudio('');
    alert('Anime added to custom catalog successfully!');
  };

  return (
    <div style={modalOverlayStyle}>
      <div className="glass neon-border" style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src="/logo.png" alt="AnimeGL" style={{ height: '48px', width: 'auto' }} />
            <span className="gradient-text" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              Admin Panel
            </span>
          </div>
          <button style={closeButtonStyle} onClick={onClose}>✕</button>
        </div>

        <div className="admin-panel-body" style={modalBodyStyle}>
          {/* Add Anime Form */}
          <form onSubmit={handleSubmit} style={formStyle}>
            <h3 style={sectionTitleStyle}>Add Custom Anime</h3>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Title *</label>
              <input 
                type="text" 
                style={inputStyle} 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Chainsaw Man" 
                required 
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Cover Poster Image URL</label>
              <input 
                type="url" 
                style={inputStyle} 
                value={coverUrl} 
                onChange={(e) => setCoverUrl(e.target.value)} 
                placeholder="e.g. https://cdn.myanimelist.net/..." 
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Studio *</label>
              <input 
                type="text" 
                style={inputStyle} 
                value={studio} 
                onChange={(e) => setStudio(e.target.value)} 
                placeholder="e.g. MAPPA" 
                required 
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ ...formGroupStyle, flex: 1 }}>
                <label style={labelStyle}>MyAnimeList ID *</label>
                <input 
                  type="text" 
                  style={inputStyle} 
                  value={malId} 
                  onChange={(e) => setMalId(e.target.value)} 
                  placeholder="e.g. 50265" 
                  required 
                />
              </div>
              <div style={{ ...formGroupStyle, flex: 1, flexDirection: 'row', alignItems: 'center', gap: '0.5rem', paddingTop: '1.25rem' }}>
                <input 
                  type="checkbox" 
                  id="isAdminMovie"
                  checked={isMovie} 
                  onChange={(e) => setIsMovie(e.target.checked)} 
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="isAdminMovie" style={{ ...labelStyle, cursor: 'pointer' }}>Is Movie?</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ ...formGroupStyle, flex: 1 }}>
                <label style={labelStyle}>Rating</label>
                <input 
                  type="text" 
                  style={inputStyle} 
                  value={rating} 
                  onChange={(e) => setRating(e.target.value)} 
                  placeholder="e.g. 4.8" 
                />
              </div>
              <div style={{ ...formGroupStyle, flex: 1 }}>
                <label style={labelStyle}>Release Year</label>
                <input 
                  type="text" 
                  style={inputStyle} 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)} 
                  placeholder="e.g. 2026" 
                />
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Genres (comma-separated)</label>
              <input 
                type="text" 
                style={inputStyle} 
                value={genresText} 
                onChange={(e) => setGenresText(e.target.value)} 
                placeholder="e.g. Action, Fantasy, Shonen" 
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>YouTube Trailer ID</label>
              <input 
                type="text" 
                style={inputStyle} 
                value={youtubeId} 
                onChange={(e) => setYoutubeId(e.target.value)} 
                placeholder="e.g. OLg84xA4lgo" 
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Pastel Card Gradient Theme</label>
              <div style={presetGridStyle}>
                {PASTEL_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    style={{
                      ...presetBtnStyle,
                      background: preset.value,
                      border: selectedGradient === preset.value ? '2px solid white' : '1px solid rgba(255,255,255,0.1)'
                    }}
                    onClick={() => setSelectedGradient(preset.value)}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Synopsis *</label>
              <textarea 
                style={{ ...inputStyle, height: '80px', resize: 'none' }} 
                value={synopsis} 
                onChange={(e) => setSynopsis(e.target.value)} 
                placeholder="Enter anime synopsis details..." 
                required 
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Add to Catalog
            </button>
          </form>

          {/* Current Catalog Management */}
          <div style={catalogManagerStyle}>
            <h3 style={sectionTitleStyle}>Current Catalog ({catalog.length})</h3>
            <div style={catalogListStyle}>
              {catalog.map((anime) => (
                <div key={anime.id} style={catalogItemStyle}>
                  <div style={{ ...itemColorIndicatorStyle, background: anime.gradient }}></div>
                  <div style={itemInfoStyle}>
                    <div style={itemTitleStyle}>{anime.title}</div>
                    <div style={itemMetaStyle}>{anime.studio} • {anime.year}</div>
                  </div>
                  {catalog.length > 2 && (
                    <button 
                      style={removeBtnStyle} 
                      onClick={() => onRemoveAnime(anime.id)}
                      title="Remove from Catalog"
                    >
                      ✕
                    </button>
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

// Inline CSS Styles for absolute styling control
const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.8)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem'
};

const modalContentStyle = {
  width: '100%',
  maxWidth: '750px',
  maxHeight: '90vh',
  borderRadius: '1.5rem',
  padding: '1.75rem',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  paddingBottom: '1rem',
  flexShrink: 0
};

const closeButtonStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'var(--text-primary)',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.85rem'
};

const modalBodyStyle = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 1fr',
  gap: '1.5rem',
  paddingTop: '1.25rem',
  overflowY: 'auto',
  flex: 1
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
};

const sectionTitleStyle = {
  fontSize: '1rem',
  fontWeight: 700,
  color: 'var(--fuchsia-main)',
  marginBottom: '0.5rem'
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem'
};

const labelStyle = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'var(--text-secondary)'
};

const inputStyle = {
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '0.5rem',
  padding: '0.5rem 0.75rem',
  color: 'white',
  fontSize: '0.85rem',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  transition: 'border-color 0.2s'
};

const presetGridStyle = {
  display: 'flex',
  gap: '0.5rem'
};

const presetBtnStyle = {
  width: '36px',
  height: '24px',
  borderRadius: '0.25rem',
  cursor: 'pointer',
  outline: 'none'
};

const catalogManagerStyle = {
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

const catalogListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  overflowY: 'auto',
  maxHeight: '380px',
  paddingRight: '0.25rem'
};

const catalogItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  padding: '0.5rem 0.75rem',
  borderRadius: '0.5rem',
  flexShrink: 0
};

const itemColorIndicatorStyle = {
  width: '12px',
  height: '28px',
  borderRadius: '0.25rem',
  flexShrink: 0
};

const itemInfoStyle = {
  flex: 1,
  minWidth: 0
};

const itemTitleStyle = {
  fontSize: '0.85rem',
  fontWeight: 700,
  color: 'white',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const itemMetaStyle = {
  fontSize: '0.7rem',
  color: 'var(--text-muted)'
};

const removeBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  fontSize: '0.85rem',
  padding: '0.25rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};
