import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-16 h-16 rounded-2xl'
  };

  const svgPadding = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3.5'
  };

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 32
  };

  if (!imgError) {
    return (
      <img
        src="/logo.jpg"
        alt="Lupanulla Elimu Hub Logo"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${sizeClasses[size]} object-cover shadow-md border border-slate-800/10 ${className}`}
      />
    );
  }

  // Beautiful SVG Fallback when /logo.jpg fails to load
  return (
    <div 
      className={`${sizeClasses[size]} ${svgPadding[size]} bg-gradient-to-br from-cyan-500 via-teal-500 to-indigo-600 shadow-md border border-cyan-400/20 flex items-center justify-center relative overflow-hidden group ${className}`}
    >
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)] animate-pulse" />
      
      {/* Absolute peak craftsmanship Vector Emblem */}
      <GraduationCap 
        size={iconSizes[size]} 
        className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] relative z-10 transition-transform duration-300 group-hover:scale-110" 
      />
      
      {/* Rising Sun Glow */}
      <div className="absolute -bottom-1 -right-1 w-1/2 h-1/2 bg-amber-400 rounded-full blur-sm opacity-60 mix-blend-screen" />
    </div>
  );
}
