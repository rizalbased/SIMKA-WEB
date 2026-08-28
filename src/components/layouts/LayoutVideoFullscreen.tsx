import React, { useRef, useEffect } from 'react';
import { DisplayConfig } from '../../types';

interface LayoutVideoFullscreenProps {
  config?: DisplayConfig;
  videoUrl?: string;
  videoTitle?: string;
  loop?: boolean;
  onEnded?: () => void;
}

export const LayoutVideoFullscreen: React.FC<LayoutVideoFullscreenProps> = ({ 
  config, 
  videoUrl: customVideoUrl,
  videoTitle: customVideoTitle,
  loop = true,
  onEnded
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = customVideoUrl || config?.slots?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const videoTitle = customVideoTitle || config?.slots?.videoTitle || 'Video Kegiatan Siswa & Profil Sekolah';

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback: muted autoplay always works reliably
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [videoUrl]);

  return (
    <div 
      id="layout-video-fullscreen-canvas"
      className="w-full h-full bg-black overflow-hidden relative select-none flex items-center justify-center"
      style={{ margin: 0, padding: 0 }}
    >
      <video
        ref={videoRef}
        src={videoUrl || undefined}
        className="w-full h-full object-contain select-none bg-black"
        autoPlay
        loop={loop}
        muted
        playsInline
        controls={false}
        onEnded={onEnded}
      />
    </div>
  );
};
