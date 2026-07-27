import React, { useEffect, useState } from 'react';

export default function Starfield() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 90 }).map((_, i) => {
      const size = Math.random() * 2 + 1; // size between 1px and 3px
      const sx = (Math.random() - 0.5) * 18;
      const sy = (Math.random() - 0.5) * 18;
      const duration = 4 + Math.random() * 8; // 4s to 12s
      const delay = Math.random() * 6; // 0s to 6s

      return {
        id: i,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          '--sx': `${sx}px`,
          '--sy': `${sy}px`,
        }
      };
    });
    setStars(generatedStars);
  }, []);

  return (
    <div id="starfield">
      {/* Gifukai Deep Dark Gradient & Glow Orbs Background */}
      <div className="gifukai-bg-base"></div>
      <div className="gifukai-glow-orb-1"></div>
      <div className="gifukai-glow-orb-2"></div>
      <div className="gifukai-glow-orb-3"></div>

      {/* Original Starfield Particles */}
      {stars.map((star) => (
        <div key={star.id} className="star" style={star.style}></div>
      ))}
    </div>
  );
}
