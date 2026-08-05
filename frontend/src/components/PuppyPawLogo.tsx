import React from 'react';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const PuppyPawLogo: React.FC<Props> = ({ size = 'md', showText = true, className = '' }) => {
  const dimensions = {
    sm: { icon: 'w-6 h-6', text: 'text-sm' },
    md: { icon: 'w-8 h-8', text: 'text-lg' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' }
  }[size];

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* Puppy Paws Foot Trail SVG Logo */}
      <div className={`relative flex items-center justify-center ${dimensions.icon}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]"
        >
          <defs>
            <linearGradient id="pawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="trailGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0c4a6e" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Dotted Paw Step Trail Line */}
          <path
            d="M 8 38 C 16 32, 22 24, 34 10"
            stroke="url(#trailGradient)"
            strokeWidth="2"
            strokeDasharray="2 3"
            strokeLinecap="round"
          />

          {/* Paw Step 1 (Trail Start - Bottom Left - Smaller) */}
          <g transform="translate(4, 26) rotate(-20) scale(0.55)" fill="url(#pawGradient)" opacity="0.6">
            {/* Main Pad */}
            <path d="M 12 14 C 7 14 5 18 8 21 C 10 23 14 23 16 21 C 19 18 17 14 12 14 Z" />
            {/* 4 Toe Beans */}
            <circle cx="6" cy="11" r="2.2" />
            <circle cx="10" cy="8" r="2.4" />
            <circle cx="14" cy="8" r="2.4" />
            <circle cx="18" cy="11" r="2.2" />
          </g>

          {/* Paw Step 2 (Trail Middle - Center - Medium) */}
          <g transform="translate(16, 15) rotate(10) scale(0.75)" fill="url(#pawGradient)" opacity="0.85">
            {/* Main Pad */}
            <path d="M 12 14 C 7 14 5 18 8 21 C 10 23 14 23 16 21 C 19 18 17 14 12 14 Z" />
            {/* 4 Toe Beans */}
            <circle cx="6" cy="11" r="2.2" />
            <circle cx="10" cy="8" r="2.4" />
            <circle cx="14" cy="8" r="2.4" />
            <circle cx="18" cy="11" r="2.2" />
          </g>

          {/* Paw Step 3 (Trail Lead - Top Right - Main Hero Paw) */}
          <g transform="translate(24, 2) rotate(-15) scale(1)" fill="url(#pawGradient)">
            {/* Main Pad */}
            <path d="M 12 14 C 6 14 4 19 8 22 C 10 24 14 24 16 22 C 20 19 18 14 12 14 Z" />
            {/* 4 Toe Beans */}
            <circle cx="5" cy="11" r="2.5" />
            <circle cx="9.5" cy="7.5" r="2.7" />
            <circle cx="14.5" cy="7.5" r="2.7" />
            <circle cx="19" cy="11" r="2.5" />
          </g>
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent font-display ${dimensions.text}`}>
            PAWCARE-COMPLIANCE
          </span>
          <span className="text-[9px] font-bold text-cyan-400/90 tracking-widest uppercase mt-0.5 font-mono flex items-center gap-1">
            <span>PAW TRAIL AUDIT ENGINE</span>
          </span>
        </div>
      )}
    </div>
  );
};
