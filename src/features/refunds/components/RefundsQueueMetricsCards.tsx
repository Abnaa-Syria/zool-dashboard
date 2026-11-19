import React from 'react';
import type { RefundsQueueMetrics } from '../types/refunds';

interface RefundsQueueMetricsCardsProps {
  metrics: RefundsQueueMetrics;
}

export const RefundsQueueMetricsCards: React.FC<RefundsQueueMetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
      {/* Metric 1 */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-surface-container-high">
        <span className="font-label-md text-label-md text-on-surface-variant">الطلبات المعلقة اليوم</span>
        <div className="flex items-baseline justify-between mt-space-xs">
          <span className="font-display-md text-display-md text-on-surface font-bold">
            {metrics.pendingRequestsToday}
          </span>
          <span className="text-secondary font-label-md text-label-md flex items-center">
            {metrics.processedTodayDiff}
          </span>
        </div>
      </div>

      {/* Metric 2 */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-surface-container-high">
        <span className="font-label-md text-label-md text-on-surface-variant">إجمالي المبالغ المستردة</span>
        <div className="flex items-baseline justify-between mt-space-xs">
          <span className="font-display-md text-display-md text-on-surface font-bold">
            {metrics.totalRefundedTodaySdg.toLocaleString()}{' '}
            <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">ج.س</span>
          </span>
          <span className="text-on-surface-variant font-label-md text-label-md">آخر 24 ساعة</span>
        </div>
      </div>

      {/* Metric 3 */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-surface-container-high">
        <span className="font-label-md text-label-md text-on-surface-variant">معدل الإلغاء الفوري التلقائي</span>
        <div className="flex items-baseline justify-between mt-space-xs">
          <span className="font-display-md text-display-md text-secondary font-bold">
            {metrics.autoCancellationRatePercent}%
          </span>
          <span className="text-secondary font-label-md text-label-md">ضمن البروتوكول المالي</span>
        </div>
      </div>

      {/* Metric 4 */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-surface-container-high">
        <span className="font-label-md text-label-md text-on-surface-variant">
          عمليات التجاوز الإداري (Override)
        </span>
        <div className="flex items-baseline justify-between mt-space-xs">
          <span className="font-display-md text-display-md text-primary font-bold">
            {metrics.manualOverrideCount}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md font-bold">
            تتطلب تدقيق
          </span>
        </div>
      </div>
    </div>
  );
};
