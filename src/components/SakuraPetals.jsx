import React, { useMemo } from 'react';

// Sakura.js standard implementation matching lucialv.com / jhammann sakura engine
export default function SakuraPetals({ count = 30 }) {
  const petals = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => {
      const size = Math.random() * 10 + 12; // 12px to 22px
      const left = Math.random() * 100; // 0% to 100% viewport width
      const fallDuration = Math.random() * 8 + 9; // 9s to 17s fall
      const blowDuration = Math.random() * 4 + 4; // 4s to 8s wind sway
      const delay = Math.random() * -15; // random start offset
      const opacity = Math.random() * 0.4 + 0.55; // 0.55 to 0.95
      
      // Sakura.js color variations
      const color = [
        'linear-gradient(135deg, #ffb7c5 0%, #f472b6 100%)',
        'linear-gradient(135deg, #f0abfc 0%, #ec4899 100%)',
        'linear-gradient(135deg, #fda4af 0%, #f43f5e 100%)',
        'linear-gradient(135deg, #fbcfe8 0%, #f472b6 100%)'
      ][Math.floor(Math.random() * 4)];

      const blowAnimation = index % 2 === 0 ? 'sakuraBlowLeft' : 'sakuraBlowRight';

      return {
        id: index,
        size,
        left: `${left}%`,
        fallDuration: `${fallDuration}s`,
        blowDuration: `${blowDuration}s`,
        delay: `${delay}s`,
        opacity,
        color,
        blowAnimation
      };
    });
  }, [count]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 1
    }}>
      <style>{`
        @keyframes sakuraFall {
          0% {
            top: -5%;
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          100% {
            top: 105%;
            transform: rotateX(360deg) rotateY(180deg) rotateZ(360deg);
          }
        }

        @keyframes sakuraBlowLeft {
          0%, 100% {
            margin-left: 0px;
          }
          50% {
            margin-left: -70px;
          }
        }

        @keyframes sakuraBlowRight {
          0%, 100% {
            margin-left: 0px;
          }
          50% {
            margin-left: 70px;
          }
        }
      `}</style>

      {petals.map((petal) => (
        <div
          key={petal.id}
          style={{
            position: 'absolute',
            top: '-5%',
            left: petal.left,
            width: `${petal.size}px`,
            height: `${petal.size * 1.3}px`,
            borderRadius: '100% 0% 100% 30% / 100% 30% 100% 0%',
            background: petal.color,
            boxShadow: '0 0 10px rgba(244, 114, 182, 0.4)',
            opacity: petal.opacity,
            animation: `sakuraFall ${petal.fallDuration} linear infinite, ${petal.blowAnimation} ${petal.blowDuration} ease-in-out infinite`,
            animationDelay: `${petal.delay}, ${petal.delay}`,
            pointerEvents: 'none',
            transformOrigin: 'center center'
          }}
        />
      ))}
    </div>
  );
}
