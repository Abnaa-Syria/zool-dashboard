import * as React from 'react';
import { Card } from '../../../components/ui/Card';
import type { BookingChannelSplit, BookingStatusDistribution } from '../../../types/overview';
import { formatCurrency, formatNumber } from '../../../lib/utils';

export interface BookingDistributionChartsProps {
  channelSplit: BookingChannelSplit[];
  statusDistribution: BookingStatusDistribution[];
}

export const BookingDistributionCharts: React.FC<BookingDistributionChartsProps> = ({
  channelSplit,
  statusDistribution,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md mb-space-lg text-right">
      {/* Chart 1: Channels Split (Direct Customer vs Broker Office) */}
      <Card className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30 mb-space-md">
            <div>
              <h3 className="text-sm font-bold text-on-surface">مصادر وقنوات الحجوزات</h3>
              <p className="text-[11px] text-on-surface-variant">
                مقارنة حجم التذاكر الصادرة عبر مكاتب الوكلاء وتطبيق المسافر
              </p>
            </div>
            <span className="material-symbols-outlined text-secondary text-[20px]">donut_large</span>
          </div>

          <div className="space-y-space-md">
            {channelSplit.map((channel) => {
              const isBroker = channel.channel === 'broker_office';
              return (
                <div key={channel.channel} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          isBroker ? 'bg-primary-container' : 'bg-secondary'
                        }`}
                      />
                      <span className="font-semibold text-on-surface">{channel.label}</span>
                    </div>
                    <div className="flex items-baseline gap-2 tabular-nums">
                      <span className="font-bold text-on-surface">
                        {formatNumber(channel.count)} تذكرة
                      </span>
                      <span className="text-on-surface-variant text-[11px]">
                        ({channel.percentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBroker ? 'bg-primary-container' : 'bg-secondary'
                      }`}
                      style={{ width: `${channel.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-outline">
                    <span>قيمة المبيعات:</span>
                    <span className="font-semibold tabular-nums text-on-surface-variant">
                      {formatCurrency(channel.volume)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-space-md p-2.5 rounded-lg bg-surface-container-low text-[11px] text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[16px]">info</span>
          <span>
            تشكل مبيعات مكاتب الوكلاء النسبة الأكبر وتعتمد آلية الخصم الفوري من المحفظة المسبقة الدفع.
          </span>
        </div>
      </Card>

      {/* Chart 2: Status Breakdown */}
      <Card className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30 mb-space-md">
            <div>
              <h3 className="text-sm font-bold text-on-surface">توزيع حالات الحجوزات</h3>
              <p className="text-[11px] text-on-surface-variant">
                موقف التذاكر الصادرة تشغيلياً على شبكة النقل
              </p>
            </div>
            <span className="material-symbols-outlined text-secondary text-[20px]">pie_chart</span>
          </div>

          <div className="space-y-space-sm">
            {statusDistribution.map((item) => {
              const colors: Record<string, { bg: string; text: string }> = {
                confirmed: { bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]' },
                on_route: { bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
                pending: { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' },
                cancelled: { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]' },
              };
              const color = colors[item.status] || { bg: 'bg-surface-container', text: 'text-on-surface' };

              return (
                <div
                  key={item.status}
                  className="p-2.5 rounded-lg bg-surface-container-low/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${color.bg} ${color.text}`}>
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 tabular-nums">
                    <span className="font-bold text-on-surface text-sm">
                      {formatNumber(item.count)}
                    </span>
                    <span className="text-[11px] text-outline">({item.percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-space-md pt-space-xs border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
          <span>معدل الالتزام والانتظام:</span>
          <span className="font-bold text-secondary tabular-nums">92% رحلات مجدولة في موعدها</span>
        </div>
      </Card>
    </div>
  );
};
