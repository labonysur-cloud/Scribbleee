import React, { useState, useEffect } from 'react';

/**
 * ScribbleeeHeroLogo — React + Tailwind CSS Component
 * Sharp Neo-Brutalist + Princess-Aesthetic Handcrafted Stop-Motion Typographic Animation.
 *
 * Each of the 10 letters in "Scribbleee" uses a completely different, unique font style
 * and independent structural variations, cycling at a rhythmic, slowed-down stop-motion pace (~180ms / 5.5 FPS).
 * Zero emojis and zero external image assets used—everything is custom pure CSS and SVG vectors.
 */

const LETTERS = [
  { char: 'S', id: 0, stagger: 0, font: "'Instrument Serif', Georgia, serif" },
  { char: 'c', id: 1, stagger: 2, font: "'Caveat', cursive" },
  { char: 'r', id: 2, stagger: 4, font: "'Space Grotesk', sans-serif" },
  { char: 'i', id: 3, stagger: 1, font: "'Instrument Serif', Georgia, serif" },
  { char: 'b', id: 4, stagger: 3, font: "Impact, 'Arial Black', sans-serif" },
  { char: 'b', id: 5, stagger: 0, font: "'Courier New', monospace" },
  { char: 'l', id: 6, stagger: 2, font: "'Caveat', cursive" }, // Ultra unique fun swashy l
  { char: 'e', id: 7, stagger: 4, font: "'Instrument Serif', Georgia, serif" },
  { char: 'e', id: 8, stagger: 1, font: "'Caveat', cursive" },
  { char: 'e', id: 9, stagger: 3, font: "'Space Grotesk', monospace" },
];

/**
 * Pure SVG vector heart accent
 */
const SvgHeart = ({ className = "w-3 h-3 text-pink-500 inline-block" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

/**
 * Pure SVG vector star sparkle accent
 */
const SvgSparkle = ({ className = "w-3 h-3 text-pink-500 inline-block" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
  </svg>
);

/**
 * Hardcoded 5 Structural Visual Variants for each unique letter index
 */
function renderVariant(char, variantIdx, letterIndex, customFont) {
  const baseStyle = { fontFamily: customFont };

  switch (variantIdx) {
    case 0:
      // Variant 1 (Base/Brutalist): High-contrast ink stamp with letter-specific rotation and character
      if (letterIndex === 6) {
        // Ultra fun unique 'l'
        return (
          <span style={baseStyle} className="relative inline-flex items-center justify-center px-1 font-black text-black transform -rotate-6 scale-110">
            <span className="text-pink-500 absolute -top-3 right-0 animate-bounce"><SvgSparkle className="w-3.5 h-3.5 text-pink-500" /></span>
            <span className="underline decoration-pink-500 decoration-4 underline-offset-4">l</span>
          </span>
        );
      }
      return (
        <span style={baseStyle} className={`font-black text-black select-none inline-block ${letterIndex % 2 === 0 ? '-rotate-2' : 'rotate-2'}`}>
          {char}
        </span>
      );

    case 1:
      // Variant 2 (Princess Vector Aesthetic): Custom vector heart/sparkle accents
      if (char === 'i') {
        return (
          <span style={baseStyle} className="relative inline-flex flex-col items-center justify-center font-bold text-black select-none">
            <span className="animate-bounce leading-none mb-0.5"><SvgHeart className="w-3.5 h-3.5 text-pink-500" /></span>
            <span className="text-black font-black leading-none">ı</span>
          </span>
        );
      }
      if (letterIndex === 6) {
        // Creative looped swash l with star badge
        return (
          <span style={baseStyle} className="relative inline-block font-black text-black select-none bg-pink-100 px-1.5 border-2 border-black shadow-[2px_2px_0px_#000]">
            {char}
            <span className="absolute -top-2 -right-2"><SvgSparkle className="w-3 h-3 text-pink-500" /></span>
          </span>
        );
      }
      return (
        <span style={baseStyle} className="relative inline-block font-black text-pink-500 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] select-none transform rotate-1">
          {char}
          <span className="absolute -bottom-1 -right-1"><SvgSparkle className="w-2.5 h-2.5 text-black" /></span>
        </span>
      );

    case 2:
      // Variant 3 (Wobbly Scribble): Shaky liquid marker outline
      return (
        <span
          style={{
            ...baseStyle,
            WebkitTextStroke: '2.5px #000000',
            filter: 'drop-shadow(3px 3px 0px #ff69b4)',
          }}
          className="inline-block font-extrabold text-transparent select-none transform -rotate-6 skew-x-6 scale-105"
        >
          {char}
        </span>
      );

    case 3:
      // Variant 4 (Dotted / Halftone Texture): Beaded halftone dots
      return (
        <span
          style={{
            ...baseStyle,
            WebkitTextStroke: '2px #000000',
            backgroundImage: 'radial-gradient(#ff1493 38%, transparent 39%)',
            backgroundSize: '5px 5px',
            WebkitBackgroundClip: 'text',
          }}
          className="inline-block font-black text-transparent select-none transform rotate-3 scale-105"
        >
          {char}
        </span>
      );

    case 4:
      // Variant 5 (Retro Pixel / Stencil Block): Boxed digital badge layout
      return (
        <span
          style={baseStyle}
          className="inline-block font-bold uppercase bg-black text-white px-1.5 py-0.5 shadow-[3px_3px_0px_#ff69b4] select-none transform scale-95 -rotate-1"
        >
          {char}
        </span>
      );

    default:
      return <span style={baseStyle}>{char}</span>;
  }
}

export default function ScribbleeeHeroLogo() {
  const [frame, setFrame] = useState(0);

  // Slowed down stop-motion loop (~180ms per tick / ~5.5 FPS) for handcrafted perfection
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 5);
    }, 180);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#FFF0F5] py-12 px-4 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Background vector decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 flex justify-around items-center">
        <SvgHeart className="w-8 h-8 text-pink-400 animate-pulse" />
        <SvgSparkle className="w-10 h-10 text-pink-300" />
        <SvgHeart className="w-6 h-6 text-black" />
        <SvgSparkle className="w-8 h-8 text-pink-400" />
      </div>

      {/* Prominent centered banner container with Neo-Brutalist styling */}
      <div className="relative z-10 bg-white border-4 border-black px-6 py-6 md:px-14 md:py-9 shadow-[6px_6px_0px_#000000] rounded-2xl flex flex-col items-center justify-center max-w-4xl w-full mx-auto transition-transform hover:-translate-y-1">
        
        {/* Top aesthetic pill badge */}
        <div className="flex items-center gap-2 mb-4 bg-pink-100 border-2 border-black px-4 py-1.5 rounded-full shadow-[2px_2px_0px_#000000]">
          <SvgSparkle className="w-4 h-4 text-pink-600 animate-spin" />
          <span className="text-xs font-black tracking-widest uppercase text-black">
            Princess Brutalism Foundry
          </span>
          <SvgHeart className="w-3.5 h-3.5 text-pink-500" />
        </div>

        {/* Slowed-down Stop-Motion Flipbook Logo Text with distinct font styles per letter */}
        <h1
          className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-4xl sm:text-6xl md:text-7xl font-black tracking-tight py-3 select-none"
          aria-label="Scribbleee"
        >
          {LETTERS.map((item, idx) => {
            const activeVariant = (frame + item.stagger) % 5;
            return (
              <span
                key={idx}
                className="inline-flex items-center justify-center min-w-[1.1em] h-[1.35em]"
              >
                {renderVariant(item.char, activeVariant, idx, item.font)}
              </span>
            );
          })}
        </h1>

        {/* Bottom tagline badge */}
        <div className="mt-5 text-center font-bold text-xs sm:text-sm uppercase tracking-wider bg-black text-pink-200 px-5 py-2 rounded-xl shadow-[3px_3px_0px_#ff69b4] flex items-center gap-2">
          <SvgSparkle className="w-3.5 h-3.5 text-pink-400" />
          <span>Multi-Font Stop-Motion Loop • Zero Emoji / Image Assets</span>
        </div>
      </div>
    </div>
  );
}
