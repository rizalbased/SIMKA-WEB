import React from 'react';
import { DisplayConfig } from '../../types';

interface LayoutSinglePosterProps {
  config?: DisplayConfig;
  posterUrl?: string;
  posterTitle?: string;
}

export const LayoutSinglePoster: React.FC<LayoutSinglePosterProps> = ({ 
  config, 
  posterUrl: customPosterUrl,
  posterTitle 
}) => {
  const posterUrl = customPosterUrl || config?.slots?.singlePosterUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80';

  return (
    <div 
      id="layout-single-poster-canvas"
      className="w-full h-full bg-[#050C16] flex items-center justify-center p-4 relative overflow-hidden select-none"
      style={{ margin: 0 }}
    >
      {/* Blurred atmospheric backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 filter blur-2xl scale-110"
        style={{ backgroundImage: `url(${posterUrl})` }}
      />

      {/* Main Single Poster centered */}
      <div className="relative z-10 max-w-full max-h-full flex items-center justify-center">
        <img
          src={posterUrl || undefined}
          alt={posterTitle || "Poster Pengumuman Tunggal"}
          className="max-w-full max-h-[92vh] object-contain shadow-2xl rounded border border-white/20"
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>
    </div>
  );
};
