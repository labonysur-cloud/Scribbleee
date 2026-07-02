import React, { useState, useEffect } from 'react';

/**
 * 👑🎀 ScribbleeeHeroLogo — React + Tailwind CSS Component
 * Sharp Neo-Brutalist + Princess-Aesthetic 12 FPS Stop-Motion Typographic Animation.
 *
 * Each of the 10 letters in "Scribbleee" independently cycles through 5 hardcoded structural variants
 * with randomized frame stagger offsets, creating a lively 12 FPS stop-motion / flipbook buzz.
 */

const LETTERS = [
  { char: 'S', id: 0, stagger: 0 },
  { char: 'c', id: 1, stagger: 2 },
  { char: 'r', id: 2, stagger: 4 },
  { char: 'i', id: 3, stagger: 1 },
  { char: 'b', id: 4, stagger: 3 },
  { char: 'b', id: 5, stagger: 0 },
  { char: 'l', id: 6, stagger: 2 },
  { char: 'e', id: 7, stagger: 4 },
  { char: 'e', id: 8, stagger: 1 },
  { char: 'e', id: 9, stagger: 3 },
];

/**
 * Hardcoded 5 Structural Visual Variants for each letter
 */
function renderVariant(char, variantIdx) {
  switch (variantIdx) {
    case 0:
      // Variant 1 (Base/Brutalist): Ultra-thick black lines, solid filled structure, sharp geometric
      return (
        <span className="font-black text-black tracking-tight select-none transform transition-none inline-block">
          {char}
        </span>
      );

    case 1:
      // Variant 2 (Princess Aesthetic): Accented with pink vector hearts ♡, sparkling stars ⭐️, and bows 🎀
      if (char === 'i') {
        return (
          <span className="relative inline-flex flex-col items-center justify-center font-bold text-black select-none">
            <span className="text-pink-500 text-xs animate-bounce leading-none">♡</span>
            <span className="text-black font-black leading-none">ı</span>
          </span>
        );
      }
      if (char === 'e') {
        return (
          <span className="relative inline-block font-black text-black select-none">
            {char}
            <span className="absolute -top-2 -right-1 text-[11px]">🎀</span>
          </span>
        );
      }
      if (char === 'S') {
        return (
          <span className="relative inline-block font-black text-black select-none">
            {char}
            <span className="absolute -top-2 -left-1 text-[11px]">👑</span>
          </span>
        );
      }
      return (
        <span className="relative inline-block font-black text-pink-500 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] select-none">
          {char}
          <span className="absolute -bottom-1 right-0 text-[9px]">✨</span>
        </span>
      );

    case 2:
      // Variant 3 (Wobbly Scribble): Shaky, distorted, liquid-like marker outline
      return (
        <span
          className="inline-block font-extrabold text-transparent select-none transform -rotate-3 skew-x-6 scale-105"
          style={{
            WebkitTextStroke: '3px #000000',
            filter: 'drop-shadow(2px 3px 0px #ff69b4)',
          }}
        >
          {char}
        </span>
      );

    case 3:
      // Variant 4 (Dotted / Textured): Broken down into distinct beads, dots, or dashed strokes
      return (
        <span
          className="inline-block font-black text-transparent select-none transform rotate-1"
          style={{
            WebkitTextStroke: '2.5px #000000',
            backgroundImage: 'radial-gradient(#ff1493 35%, transparent 36%)',
            backgroundSize: '4px 4px',
            WebkitBackgroundClip: 'text',
          }}
        >
          {char}
        </span>
      );

    case 4:
      // Variant 5 (Retro Pixel / Block): Stepped low-res digital block structure
      return (
        <span
          className="inline-block font-mono font-bold uppercase tracking-tighter bg-black text-white px-1 py-0 shadow-[2px_2px_0px_#ff69b4] select-none transform scale-95"
          style={{ imageRendering: 'pixelated' }}
        >
          {char}
        </span>
      );

    default:
      return <span>{char}</span>;
  }
}

export default function ScribbleeeHeroLogo() {
  const [frame, setFrame] = useState(0);

  // 12 Frames Per Second stop-motion loop (~83ms per tick)
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 5);
    }, 83);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#FFF0F5] py-12 px-4 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Background princess floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40 flex justify-around items-center">
        <span className="text-pink-400 text-3xl animate-pulse">♡</span>
        <span className="text-black text-2xl font-black">✦</span>
        <span className="text-pink-300 text-4xl">🎀</span>
        <span className="text-black text-xl font-bold">★</span>
        <span className="text-pink-400 text-3xl">🌸</span>
      </div>

      {/* Prominent centered banner container with Neo-Brutalist box styling */}
      <div
        className="relative z-10 bg-white border-4 border-black px-6 py-5 md:px-12 md:py-8 shadow-[6px_6px_0px_#000000] flex flex-col items-center justify-center max-w-4xl w-full mx-auto transition-transform hover:-translate-y-1"
      >
        {/* Top badge / princess eyebrow */}
        <div className="flex items-center gap-2 mb-3 bg-pink-100 border-2 border-black px-3 py-1 shadow-[2px_2px_0px_#000000] rounded-none">
          <span className="text-xs font-black tracking-widest uppercase text-black">
            👑 Princess Brutalism Foundry
          </span>
          <span className="text-xs animate-spin">⭐️</span>
        </div>

        {/* 12 FPS Stop-Motion Flipbook Logo Text */}
        <h1
          className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-4xl sm:text-6xl md:text-7xl font-black tracking-tight py-2 select-none"
          aria-label="Scribbleee"
        >
          {LETTERS.map((item, idx) => {
            // Apply letter-specific offset so letters cycle out of sync ("buzzing" effect)
            const activeVariant = (frame + item.stagger) % 5;
            return (
              <span
                key={idx}
                className="inline-flex items-center justify-center min-w-[1.1em] h-[1.3em]"
              >
                {renderVariant(item.char, activeVariant)}
              </span>
            );
          })}
        </h1>

        {/* Bottom tagline sub-banner */}
        <div className="mt-4 text-center font-bold text-xs sm:text-sm text-black uppercase tracking-wider bg-black text-pink-200 px-4 py-1.5 shadow-[3px_3px_0px_#ff69b4]">
          12 FPS Pure-Code Stop-Motion Loop • Zero Video / Image Assets
        </div>
      </div>
    </div>
  );
}
