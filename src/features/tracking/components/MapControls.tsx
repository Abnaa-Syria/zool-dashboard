import * as React from 'react';
import { useMap } from 'react-leaflet';

export interface MapControlsProps {
  onFitAll: () => void;
  fitTitle: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const floatingButton =
  'w-10 h-10 bg-surface-container-lowest/95 backdrop-blur-md text-on-surface hover:bg-surface-container rounded-xl shadow-card border border-outline-variant/30 flex items-center justify-center transition-colors';

/** Floating zoom / fit / fullscreen controls (rendered inside a MapContainer). */
export const MapControls: React.FC<MapControlsProps> = ({ onFitAll, fitTitle, isFullscreen, onToggleFullscreen }) => {
  const map = useMap();

  return (
    <div className="absolute right-4 top-4 z-[400] flex flex-col gap-2 pointer-events-auto">
      <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-xl shadow-card border border-outline-variant/30 p-1 flex flex-col items-center">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          title="تكبير الخريطة"
          aria-label="تكبير الخريطة"
          className="w-9 h-9 flex items-center justify-center text-on-surface hover:bg-surface-container rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
        <div className="w-6 h-px bg-outline-variant/30 my-0.5" />
        <button
          type="button"
          onClick={() => map.zoomOut()}
          title="تصغير الخريطة"
          aria-label="تصغير الخريطة"
          className="w-9 h-9 flex items-center justify-center text-on-surface hover:bg-surface-container rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">remove</span>
        </button>
      </div>

      <button type="button" onClick={onFitAll} title={fitTitle} aria-label={fitTitle} className={floatingButton}>
        <span className="material-symbols-outlined text-[20px] text-secondary">crop_free</span>
      </button>

      <button
        type="button"
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'إنهاء وضع ملء الشاشة' : 'ملء الشاشة'}
        aria-label="ملء الشاشة"
        className={floatingButton}
      >
        <span className="material-symbols-outlined text-[20px]">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
      </button>
    </div>
  );
};
