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
  const posterUrl = customPosterUrl || config?.slots?.singlePosterUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1920&q=80';

  return (
    <div 
      id="layout-single-poster-canvas"
      className="w-full h-full bg-black flex items-center justify-center overflow-hidden select-none relative"
      style={{
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        maxWidth: 'none',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <img
        src={posterUrl || undefined}
        alt={posterTitle || "Poster Pengumuman Tunggal"}
        className="w-full h-auto max-w-full block"
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '100%',
          margin: 0,
          padding: 0,
          display: 'block',
          objectFit: 'contain',
          objectPosition: 'center'
        }}
        referrerPolicy="no-referrer"
        loading="eager"
      />
    </div>
  );
};
