import * as React from 'react';
import { MetricCard } from '../../../components/ui/Card';
import { DELAY_THRESHOLD_MINUTES, type LiveMetrics } from '../liveState';

const fmt = (n: number) => n.toLocaleString('en-US');

/** KPI row for the live board, computed from the polled trips. */
export const TrackingMetricsHeader: React.FC<{ metrics: LiveMetrics }> = ({ metrics: m }) => (
  <div className="grid gap-space-md grid-cols-2 lg:grid-cols-5">
    <MetricCard title="رحلات نشطة" subValue={`${fmt(m.onMap)} على الخريطة`} value={fmt(m.total)} icon="directions_bus" />
    <MetricCard title="صعود الركاب" value={fmt(m.boarding)} icon="hail" iconBg="bg-[#FEF3C7] text-[#B45309]" />
    <MetricCard title="في الطريق" value={fmt(m.inProgress)} icon="route" iconBg="bg-[#DCFCE7] text-[#15803D]" />
    <MetricCard
      title="رحلات متأخرة"
      subValue={`أكثر من ${DELAY_THRESHOLD_MINUTES} دقيقة`}
      value={fmt(m.delayed)}
      icon="schedule"
      iconBg={m.delayed > 0 ? 'bg-[#FEE2E2] text-[#B91C1C]' : undefined}
    />
    <MetricCard
      title="بدون إشارة حديثة"
      subValue="لا موقع أو آخر إشارة أقدم من دقيقتين"
      value={fmt(m.withoutFreshFix)}
      icon="location_disabled"
      iconBg={m.withoutFreshFix > 0 ? 'bg-surface-container-high text-on-surface-variant' : undefined}
    />
  </div>
);
