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
      style={{ margin: 0, padding: 0 }}
    >
      {/* 
        Single Poster Display:
        - Full width responsive rendering
        - Retains exact native aspect ratio without distortion or cropping
        - Centered horizontally & vertically
        - No object-fit cover (object-fit: contain)
      */}
      <img
        src={posterUrl || undefined}
        alt={posterTitle || "Poster Pengumuman Tunggal"}
        className="w-full h-auto max-w-full max-h-full object-contain object-center block"
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          objectPosition: 'center',
          display: 'block',
          margin: 0,
          padding: 0
        }}
        referrerPolicy="no-referrer"
        loading="eager"
      />
    </div>
  );
};
