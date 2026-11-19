import * as React from 'react';
import { MetricCard } from '../../../components/ui/Card';
import type { OverviewMetrics } from '../../../types/overview';
import { formatCurrency, formatNumber } from '../../../lib/utils';

export interface OverviewMetricsRowProps {
  metrics: OverviewMetrics;
}

export const OverviewMetricsRow: React.FC<OverviewMetricsRowProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-lg">
      {/* KPI 1: Gross Revenue */}
      <MetricCard
        title="إجمالي حجم التذاكر (GMV)"
        value={formatCurrency(metrics.totalRevenue)}
        subValue="حجم المبيعات الإجمالي للنطاق"
        trend={metrics.revenueTrend}
        icon="payments"
        iconBg="bg-primary-fixed text-on-primary-fixed"
        footer={
          <div className="flex items-center justify-between text-[11px]">
            <span>التسويات المحققة للشركات</span>
            <span className="font-semibold tabular-nums">
              {formatCurrency(metrics.financialSummary.settledThisCycle)}
            </span>
          </div>
        }
      />

      {/* KPI 2: Bookings Count */}
      <MetricCard
        title="حجم الحجوزات والتذاكر"
        value={`${formatNumber(metrics.totalBookings)} تذكرة`}
        subValue="التذاكر الصادرة عبر المنصة"
        trend={metrics.bookingsTrend}
        icon="confirmation_number"
        iconBg="bg-secondary-fixed text-on-secondary-fixed"
        footer={
          <div className="flex items-center justify-between text-[11px]">
            <span>تذاكر قيد المسار النشط</span>
            <span className="font-semibold text-secondary tabular-nums">
              {metrics.statusDistribution.find((s) => s.status === 'on_route')?.count || 0} تذكرة
            </span>
          </div>
        }
      />

      {/* KPI 3: Fleet Active on Corridors */}
      <MetricCard
        title="الأسطول النشط على الممرات"
        value={`${formatNumber(metrics.activeFleetCount)} حافلة`}
        subValue="حافلات متصلة بنظام التتبع اللحظي"
        icon="directions_bus"
        iconBg="bg-surface-container text-tertiary"
        footer={
          <div className="flex items-center justify-between text-[11px]">
            <span>متوسط نسبة إشغال المقاعد</span>
            <span className="font-semibold text-tertiary tabular-nums">
              {metrics.fleetOccupancyRate}% إشغال
            </span>
          </div>
        }
      />

      {/* KPI 4: Pending Actions */}
      <MetricCard
        title="عمليات تتطلب التدخل"
        value={`${metrics.pendingActionsCount} معلقة`}
        subValue="حوالات بنكية ونزاعات استرداد"
        icon="pending_actions"
        iconBg="bg-error-container text-on-error-container"
        badge={
          metrics.pendingActionsCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-error text-on-error text-[10px] font-bold animate-pulse">
              عاجل
            </span>
          ) : undefined
        }
        footer={
          <div className="flex items-center justify-between text-[11px]">
            <span>إيداعات بنكية بانتظار المطابقة</span>
            <span className="font-semibold text-error tabular-nums">
              {formatCurrency(metrics.financialSummary.pendingBankDeposits)}
            </span>
          </div>
        }
      />
    </div>
  );
};
