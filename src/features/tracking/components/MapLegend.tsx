import * as React from 'react';

export const MapLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div className="absolute right-4 bottom-8 z-[400] max-w-xs pointer-events-auto select-none" dir="rtl">
      <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-xl shadow-card border border-outline-variant/30 overflow-hidden transition-all">
        {/* Header Toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-on-surface hover:bg-surface-container/60 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-secondary">legend_toggle</span>
            <span>دليل دلالات الخريطة</span>
          </span>
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant transition-transform">
            {isExpanded ? 'expand_more' : 'chevron_left'}
          </span>
        </button>

        {isExpanded && (
          <div className="px-3 pb-3 pt-1 space-y-2 text-[11px] font-medium border-t border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#003b27] ring-1 ring-[#226a4b]" />
                <span className="text-on-surface">في رحلة ومطابق للجدول</span>
              </div>
              <span className="font-bold text-secondary">26</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#b45309]" />
                <span className="text-on-surface">متوقفة بالمحطة / تفتيش</span>
              </div>
              <span className="font-bold text-amber-700">7</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
                <span className="text-on-surface">متأخرة عن موعد الوصول</span>
              </div>
              <span className="font-bold text-yellow-700">3</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" />
                <span className="text-on-surface">تنبيه تشغيلي أو سلامة</span>
              </div>
              <span className="font-bold text-error">1</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b7172]" />
                <span className="text-on-surface">إشارة GPS منقطعة</span>
              </div>
              <span className="font-bold text-on-surface-variant">1</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
