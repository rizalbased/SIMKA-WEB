import React from 'react';
import { DisplayConfig } from '../../types';

interface LayoutThreePostersProps {
  config?: DisplayConfig;
  posters?: [string, string, string];
}

export const LayoutThreePosters: React.FC<LayoutThreePostersProps> = ({ config, posters: customPosters }) => {
  const posters = customPosters || config?.slots?.threePosters || [
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80'
  ];

  return (
    <div 
      id="layout-three-posters-canvas"
      className="w-full h-full bg-[#080E1A] flex items-center justify-center overflow-hidden select-none"
      style={{ margin: 0, padding: 0 }}
    >
      <div className="w-full max-w-[1920px] grid grid-cols-3 gap-0">
        {/* POSTER 1 */}
        <div className="relative w-full flex items-center justify-center border-r border-white/10 bg-[#070D18] p-4" style={{ aspectRatio: '2/3' }}>
          <img
            src={posters[0] || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80'}
            alt="Poster 1"
            className="w-full h-full object-contain shadow-2xl rounded-sm transition-transform duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
            loading="eager"
          />
        </div>

        {/* POSTER 2 */}
        <div className="relative w-full flex items-center justify-center border-r border-white/10 bg-[#0A1424] p-4" style={{ aspectRatio: '2/3' }}>
          <img
            src={posters[1] || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
            alt="Poster 2"
            className="w-full h-full object-contain shadow-2xl rounded-sm transition-transform duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
            loading="eager"
          />
        </div>

        {/* POSTER 3 */}
        <div className="relative w-full flex items-center justify-center bg-[#070D18] p-4" style={{ aspectRatio: '2/3' }}>
          <img
            src={posters[2] || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80'}
            alt="Poster 3"
            className="w-full h-full object-contain shadow-2xl rounded-sm transition-transform duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
};
