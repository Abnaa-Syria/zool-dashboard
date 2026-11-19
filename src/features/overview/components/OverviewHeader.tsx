import * as React from 'react';
import type { DateRangePreset } from '../../../components/ui/PageHeader';
import { DateRangeControl } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import type { SimulatedState } from '../../../services/overviewService';
import { SimpleTooltip } from '../../../components/ui/Tooltip';

export interface OverviewHeaderProps {
  dateRange: DateRangePreset;
  onDateRangeChange: (preset: DateRangePreset) => void;
  onRefresh: () => void;
  isFetching?: boolean;
  simulatedState: SimulatedState;
  onSimulatedStateChange: (state: SimulatedState) => void;
}

export const OverviewHeader: React.FC<OverviewHeaderProps> = ({
  dateRange,
  onDateRangeChange,
  onRefresh,
  isFetching,
  simulatedState,
  onSimulatedStateChange,
}) => {
  return (
    <div className="flex flex-col gap-space-md mb-space-lg">
      {/* Top Operations Live Notice Banner */}
      <div className="w-full bg-surface-container-high rounded-xl p-3 sm:p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm border border-outline-variant/30 shadow-card">
        <div className="flex items-center gap-space-sm w-full sm:w-auto">
          <div className="w-8 h-8 rounded-full bg-surface-container-lowest text-secondary flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[18px]">sync</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-on-surface">
              مزامنة العمليات اللحظية مع خطوط النقل ووكلاء التذاكر
            </span>
            <span className="text-[11px] text-on-surface-variant">
              تحديث آلي لبيانات المحافظ والرحلات المباشرة عبر ولايات السودان
            </span>
          </div>
        </div>

        {/* Development State Inspector Toolbar */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-1 flex items-center gap-1 shadow-xs">
            <span className="text-[10px] font-bold text-outline px-1.5 hidden md:inline">
              حالة العرض (Dev):
            </span>
            {(['populated', 'loading', 'empty', 'error'] as SimulatedState[]).map((state) => {
              const labels: Record<SimulatedState, string> = {
                populated: 'مكتملة',
                loading: 'تحميل (Skeleton)',
                empty: 'فارغة',
                error: 'خطأ',
              };
              const isActive = simulatedState === state;

              return (
                <button
                  key={state}
                  type="button"
                  onClick={() => onSimulatedStateChange(state)}
                  className={`px-2 py-1 text-[11px] rounded font-medium transition-all ${
                    isActive
                      ? 'bg-secondary text-on-secondary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {labels[state]}
                </button>
              );
            })}
          </div>

          <SimpleTooltip content="تحديث البيانات">
            <Button
              variant="outline"
              size="sm"
              icon="refresh"
              isLoading={isFetching}
              onClick={onRefresh}
              className="h-8"
            >
              تحديث
            </Button>
          </SimpleTooltip>
        </div>
      </div>

      {/* Main Page Title & Date Range Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md text-right">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">نظرة عامة</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
              لوحة التحكم المركزية
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            مؤشرات الأداء التشغيلي، حركة المحافظ المسبقة الدفع، ومتابعة حجوزات المسافرين والوكلاء
          </p>
        </div>

        {/* Date Range Control */}
        <DateRangeControl selected={dateRange} onSelect={onDateRangeChange} />
      </div>
    </div>
  );
};
