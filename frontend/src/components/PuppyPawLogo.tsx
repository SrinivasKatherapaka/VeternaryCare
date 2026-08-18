import React from 'react';

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  animated?: boolean;
}

export const PuppyPawLogo: React.FC<Props> = ({
  size = 'md',
  showText = true,
  subtitle = 'COMPLIANCE EVIDENCE ENGINE',
  className = '',
  animated = true
}) => {
  const dimensions = {
    xs: { icon: 'w-6 h-6', text: 'text-xs', sub: 'text-[7px]', gap: 'gap-1.5' },
    sm: { icon: 'w-7 h-7', text: 'text-sm', sub: 'text-[8px]', gap: 'gap-2' },
    md: { icon: 'w-9 h-9', text: 'text-lg', sub: 'text-[9px]', gap: 'gap-2.5' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', sub: 'text-[10px]', gap: 'gap-3' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', sub: 'text-xs', gap: 'gap-3.5' }
  }[size];

  return (
    <div className={`group inline-flex items-center ${dimensions.gap} select-none ${className}`}>
      {/* Endearing Golden Retriever Puppy Paw Icon */}
      <div
        className={`relative flex items-center justify-center ${dimensions.icon} transition-all duration-300 ${
          animated ? 'group-hover:scale-110 group-hover:rotate-[-4deg]' : ''
        }`}
      >
        {/* Soft Ambient Golden Glow Halo */}
        <div className="absolute inset-0 rounded-full bg-amber-500/25 blur-md group-hover:bg-amber-400/40 transition-all duration-300 -z-10" />

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]"
        >
          <defs>
            {/* Golden Retriever Paw Gradient (Fur & Honey tones) */}
            <linearGradient id="goldenPawGradient" x1="10%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="30%" stopColor="#fbbf24" />
              <stop offset="65%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* Warm Cream Heart Gradient */}
            <linearGradient id="goldenHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
              <stop offset="45%" stopColor="#fef3c7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fde68a" stopOpacity="0.75" />
            </linearGradient>

            {/* 3D Gloss Highlight */}
            <linearGradient id="goldenGloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>

            {/* Magic Sparkle Golden Star */}
            <linearGradient id="goldenSparkle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Soft Glow Filter */}
            <filter id="goldenInnerGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Protective Orbit Halo Ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="url(#goldenPawGradient)"
            strokeWidth="1.5"
            strokeDasharray="3 4"
            opacity="0.4"
          />

          {/* 4 Plump Golden Puppy Toe Beans */}
          {/* Leftmost Toe */}
          <g transform="translate(19, 39) rotate(-26)">
            <ellipse cx="0" cy="0" rx="7" ry="9.2" fill="url(#goldenPawGradient)" filter="url(#goldenInnerGlow)" />
            <ellipse cx="-1.5" cy="-3.5" rx="3.2" ry="4.2" fill="url(#goldenGloss)" />
          </g>

          {/* Left-Center Toe */}
          <g transform="translate(37, 24) rotate(-9)">
            <ellipse cx="0" cy="0" rx="8.2" ry="11.5" fill="url(#goldenPawGradient)" filter="url(#goldenInnerGlow)" />
            <ellipse cx="-2" cy="-4.5" rx="3.8" ry="5.5" fill="url(#goldenGloss)" />
          </g>

          {/* Right-Center Toe */}
          <g transform="translate(63, 24) rotate(9)">
            <ellipse cx="0" cy="0" rx="8.2" ry="11.5" fill="url(#goldenPawGradient)" filter="url(#goldenInnerGlow)" />
            <ellipse cx="-1.5" cy="-4.5" rx="3.8" ry="5.5" fill="url(#goldenGloss)" />
          </g>

          {/* Rightmost Toe */}
          <g transform="translate(81, 39) rotate(26)">
            <ellipse cx="0" cy="0" rx="7" ry="9.2" fill="url(#goldenPawGradient)" filter="url(#goldenInnerGlow)" />
            <ellipse cx="-1.5" cy="-3.5" rx="3.2" ry="4.2" fill="url(#goldenGloss)" />
          </g>

          {/* Main Heart-Plump Puppy Palm Pad */}
          <g filter="url(#goldenInnerGlow)">
            <path
              d="M 50 47 C 42 41, 23 46, 22 62 C 21 74, 34 83, 50 84 C 66 83, 79 74, 78 62 C 77 46, 58 41, 50 47 Z"
              fill="url(#goldenPawGradient)"
            />
          </g>

          {/* Organic Palm Gloss Reflection */}
          <path
            d="M 50 50 C 44 45, 30 49, 29 60 C 28 64, 32 68, 38 66 C 45 64, 48 56, 50 53 C 52 56, 55 64, 62 66 C 68 68, 72 64, 71 60 C 70 49, 56 45, 50 50 Z"
            fill="url(#goldenGloss)"
            opacity="0.6"
          />

          {/* Endearing Care Heart Inset */}
          <path
            d="M 50 57 C 46.5 52, 38 53, 38 61 C 38 67, 46.5 73, 50 76 C 53.5 73, 62 67, 62 61 C 62 53, 53.5 52, 50 57 Z"
            fill="url(#goldenHeartGrad)"
          />

          {/* Warm Amber Veterinary Care Cross */}
          <g opacity="0.85">
            <rect x="48.5" y="61" width="3" height="8.5" rx="1.5" fill="#b45309" />
            <rect x="45.8" y="63.8" width="8.4" height="3" rx="1.5" fill="#b45309" />
          </g>

          {/* Magic Sparkle Star (Top-Right) */}
          <g transform="translate(86, 14)" className="transition-transform duration-500 group-hover:rotate-45">
            <path d="M 0 -7 Q 0 0 7 0 Q 0 0 0 7 Q 0 0 -7 0 Q 0 0 0 -7 Z" fill="url(#goldenSparkle)" />
            <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
          </g>

          {/* Micro Sparkle (Bottom-Left) */}
          <g transform="translate(12, 68) scale(0.6)">
            <path d="M 0 -6 Q 0 0 6 0 Q 0 0 0 6 Q 0 0 -6 0 Q 0 0 0 -6 Z" fill="url(#goldenSparkle)" opacity="0.85" />
          </g>
        </svg>
      </div>

      {/* Brand Text Block */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent font-display ${dimensions.text}`}
            >
              PAWCARE
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 text-[9px] font-bold text-amber-300 font-mono tracking-wide shadow-sm">
              AI
            </span>
          </div>

          <span
            className={`font-bold text-stone-400 tracking-wider uppercase mt-0.5 font-mono flex items-center gap-1.5 ${dimensions.sub}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="text-amber-400/90">{subtitle}</span>
          </span>
        </div>
      )}
    </div>
  );
};
