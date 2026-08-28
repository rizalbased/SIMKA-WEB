import React from 'react';
import { DisplayConfig } from '../../types';

interface LayoutThreePhotosProps {
  config?: DisplayConfig;
  photos?: [string, string, string];
}

export const LayoutThreePhotos: React.FC<LayoutThreePhotosProps> = ({ config, photos: customPhotos }) => {
  const photos = customPhotos || config?.slots?.threePhotos || [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80'
  ];

  return (
    <div 
      id="layout-three-photos-canvas"
      className="w-full h-full bg-[#080E1A] flex items-center justify-center overflow-hidden select-none"
      style={{ margin: 0, padding: 0 }}
    >
      <div className="w-full max-w-[1920px] grid grid-cols-3 gap-0">
        {/* COLUMN 1: Foto 1 (640px) */}
        <div className="relative w-full flex items-center justify-center border-r border-black/30 bg-black" style={{ aspectRatio: '2/3' }}>
          <img
            src={photos[0] || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80'}
            alt="Foto 1"
            className="w-full h-full object-contain select-none transition-transform duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
            loading="eager"
          />
        </div>

        {/* COLUMN 2: Foto 2 (640px) */}
        <div className="relative w-full flex items-center justify-center border-r border-black/30 bg-black" style={{ aspectRatio: '2/3' }}>
          <img
            src={photos[1] || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80'}
            alt="Foto 2"
            className="w-full h-full object-contain select-none transition-transform duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
            loading="eager"
          />
        </div>

        {/* COLUMN 3: Foto 3 (640px) */}
        <div className="relative w-full flex items-center justify-center bg-black" style={{ aspectRatio: '2/3' }}>
          <img
            src={photos[2] || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80'}
            alt="Foto 3"
            className="w-full h-full object-contain select-none transition-transform duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
};
