import * as React from 'react';
import { useMap } from 'react-leaflet';

export interface MapControlsProps {
  isFollowing: boolean;
  onToggleFollow: () => void;
  hasSelectedBus: boolean;
  onFitAll: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  isFollowing,
  onToggleFollow,
  hasSelectedBus,
  onFitAll,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  // Re-center on Sudan transit network center
  const handleResetCenter = () => {
    onFitAll();
  };

  return (
    <div className="absolute right-4 top-4 z-[400] flex flex-col gap-2 pointer-events-auto">
      {/* Zoom In & Out */}
      <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-xl shadow-card border border-outline-variant/30 p-1 flex flex-col items-center">
        <button
          type="button"
          onClick={handleZoomIn}
          title="تكبير الخريطة"
          aria-label="تكبير الخريطة"
          className="w-9 h-9 flex items-center justify-center text-on-surface hover:bg-surface-container rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
        <div className="w-6 h-px bg-outline-variant/30 my-0.5" />
        <button
          type="button"
          onClick={handleZoomOut}
          title="تصغير الخريطة"
          aria-label="تصغير الخريطة"
          className="w-9 h-9 flex items-center justify-center text-on-surface hover:bg-surface-container rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">remove</span>
        </button>
      </div>

      {/* Fit All Buses */}
      <button
        type="button"
        onClick={handleResetCenter}
        title="عرض جميع الحافلات النشطة على الخريطة"
        aria-label="عرض جميع الحافلات النشطة"
        className="w-10 h-10 bg-surface-container-lowest/95 backdrop-blur-md text-on-surface hover:bg-surface-container rounded-xl shadow-card border border-outline-variant/30 flex items-center justify-center transition-colors"
      >
        <span className="material-symbols-outlined text-[20px] text-secondary">crop_free</span>
      </button>

      {/* Follow Selected Bus Mode */}
      {hasSelectedBus && (
        <button
          type="button"
          onClick={onToggleFollow}
          title={isFollowing ? 'إلغاء وضع المتابعة التلقائية' : 'تفعيل متابعة الحافلة المختارة'}
          aria-label="متابعة الحافلة"
          className={`w-10 h-10 backdrop-blur-md rounded-xl shadow-card border transition-all flex items-center justify-center ${
            isFollowing
              ? 'bg-secondary text-on-secondary border-secondary ring-2 ring-secondary/30 animate-pulse'
              : 'bg-surface-container-lowest/95 text-on-surface hover:bg-surface-container border-outline-variant/30'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isFollowing ? 'near_me' : 'near_me_disabled'}
          </span>
        </button>
      )}

      {/* Fullscreen Toggle */}
      <button
        type="button"
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'إنهاء وضع ملء الشاشة' : 'ملء الشاشة'}
        aria-label="ملء الشاشة"
        className="w-10 h-10 bg-surface-container-lowest/95 backdrop-blur-md text-on-surface hover:bg-surface-container rounded-xl shadow-card border border-outline-variant/30 flex items-center justify-center transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">
          {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
        </span>
      </button>
    </div>
  );
};
