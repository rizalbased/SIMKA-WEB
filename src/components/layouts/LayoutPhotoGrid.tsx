import React from 'react';
import { DisplayConfig } from '../../types';

interface LayoutPhotoGridProps {
  config?: DisplayConfig;
  photos?: [string, string, string, string];
}

export const LayoutPhotoGrid: React.FC<LayoutPhotoGridProps> = ({ config, photos: customPhotos }) => {
  const photos = customPhotos || config?.slots?.gridPhotos || [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80'
  ];

  return (
    <div 
      id="layout-photo-grid-canvas"
      className="w-full h-full grid grid-cols-2 grid-rows-2 bg-black overflow-hidden select-none"
      style={{ margin: 0, padding: 0 }}
    >
      {photos.map((src, index) => (
        <div 
          key={index}
          className="relative w-full h-full overflow-hidden border border-black/40 flex items-center justify-center bg-black"
        >
          <img
            src={src || undefined}
            alt={`Dokumentasi Grid ${index + 1}`}
            className="w-full h-full object-contain select-none transition-transform duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
            loading="eager"
          />
        </div>
      ))}
    </div>
  );
};
