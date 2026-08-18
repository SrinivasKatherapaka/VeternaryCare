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
      {/* Endearing Paw Icon Container */}
      <div
        className={`relative flex items-center justify-center ${dimensions.icon} transition-all duration-300 ${
          animated ? 'group-hover:scale-110 group-hover:rotate-[-4deg]' : ''
        }`}
      >
        {/* Soft Ambient Glow Halo */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md group-hover:bg-cyan-400/35 transition-all duration-300 -z-10" />

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_10px_rgba(6,182,212,0.45)]"
        >
          <defs>
            {/* Primary Paw Gradient */}
            <linearGradient id="pawBrandGradient" x1="10%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="40%" stopColor="#06b6d4" />
              <stop offset="80%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            {/* Endearing Care Heart Gradient */}
            <linearGradient id="pawHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#bae6fd" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.6" />
            </linearGradient>

            {/* 3D Gloss Highlight Gradient */}
            <linearGradient id="pawGloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>

            {/* Magic Sparkle Gradient */}
            <linearGradient id="pawSparkle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>

            {/* Soft Glow Filter */}
            <filter id="pawInnerGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Protective Orbit Halo (Subtle dashed ring) */}
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="url(#pawBrandGradient)"
            strokeWidth="1.5"
            strokeDasharray="3 4"
            opacity="0.35"
          />

          {/* 4 Lovable, Plump Toe Beans */}
          {/* Leftmost Toe */}
          <g transform="translate(19, 39) rotate(-26)">
            <ellipse cx="0" cy="0" rx="7" ry="9.2" fill="url(#pawBrandGradient)" filter="url(#pawInnerGlow)" />
            <ellipse cx="-1.5" cy="-3.5" rx="3.2" ry="4.2" fill="url(#pawGloss)" />
          </g>

          {/* Left-Center Toe (Main Hero Bean) */}
          <g transform="translate(37, 24) rotate(-9)">
            <ellipse cx="0" cy="0" rx="8.2" ry="11.5" fill="url(#pawBrandGradient)" filter="url(#pawInnerGlow)" />
            <ellipse cx="-2" cy="-4.5" rx="3.8" ry="5.5" fill="url(#pawGloss)" />
          </g>

          {/* Right-Center Toe (Main Hero Bean) */}
          <g transform="translate(63, 24) rotate(9)">
            <ellipse cx="0" cy="0" rx="8.2" ry="11.5" fill="url(#pawBrandGradient)" filter="url(#pawInnerGlow)" />
            <ellipse cx="-1.5" cy="-4.5" rx="3.8" ry="5.5" fill="url(#pawGloss)" />
          </g>

          {/* Rightmost Toe */}
          <g transform="translate(81, 39) rotate(26)">
            <ellipse cx="0" cy="0" rx="7" ry="9.2" fill="url(#pawBrandGradient)" filter="url(#pawInnerGlow)" />
            <ellipse cx="-1.5" cy="-3.5" rx="3.2" ry="4.2" fill="url(#pawGloss)" />
          </g>

          {/* Main Heart-Plump Puppy Palm Pad */}
          <g filter="url(#pawInnerGlow)">
            <path
              d="M 50 47 C 42 41, 23 46, 22 62 C 21 74, 34 83, 50 84 C 66 83, 79 74, 78 62 C 77 46, 58 41, 50 47 Z"
              fill="url(#pawBrandGradient)"
            />
          </g>

          {/* Organic Palm Gloss Reflection */}
          <path
            d="M 50 50 C 44 45, 30 49, 29 60 C 28 64, 32 68, 38 66 C 45 64, 48 56, 50 53 C 52 56, 55 64, 62 66 C 68 68, 72 64, 71 60 C 70 49, 56 45, 50 50 Z"
            fill="url(#pawGloss)"
            opacity="0.55"
          />

          {/* Endearing Care Heart Inset */}
          <path
            d="M 50 57 C 46.5 52, 38 53, 38 61 C 38 67, 46.5 73, 50 76 C 53.5 73, 62 67, 62 61 C 62 53, 53.5 52, 50 57 Z"
            fill="url(#pawHeartGrad)"
          />

          {/* Soft Veterinary Care Cross Accent */}
          <g opacity="0.8">
            <rect x="48.5" y="61" width="3" height="8.5" rx="1.5" fill="#0284c7" />
            <rect x="45.8" y="63.8" width="8.4" height="3" rx="1.5" fill="#0284c7" />
          </g>

          {/* Magic Sparkle Star (Top-Right) */}
          <g transform="translate(86, 14)" className="transition-transform duration-500 group-hover:rotate-45">
            <path d="M 0 -7 Q 0 0 7 0 Q 0 0 0 7 Q 0 0 -7 0 Q 0 0 0 -7 Z" fill="url(#pawSparkle)" />
            <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
          </g>

          {/* Micro Sparkle (Bottom-Left) */}
          <g transform="translate(12, 68) scale(0.6)">
            <path d="M 0 -6 Q 0 0 6 0 Q 0 0 0 6 Q 0 0 -6 0 Q 0 0 0 -6 Z" fill="url(#pawSparkle)" opacity="0.8" />
          </g>
        </svg>
      </div>

      {/* Brand Text Block */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent font-display ${dimensions.text}`}
            >
              PAWCARE
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-400/30 text-[9px] font-bold text-cyan-300 font-mono tracking-wide shadow-sm">
              AI
            </span>
          </div>

          <span
            className={`font-bold text-slate-400 tracking-wider uppercase mt-0.5 font-mono flex items-center gap-1.5 ${dimensions.sub}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-cyan-400/90">{subtitle}</span>
          </span>
        </div>
      )}
    </div>
  );
};
