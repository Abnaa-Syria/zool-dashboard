import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import type { SalesChannelShare } from '../types/reports';

interface SalesChannelDonutChartProps {
  channels: SalesChannelShare[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as SalesChannelShare;
    return (
      <div className="bg-surface-container-lowest p-2.5 rounded-lg shadow-md border border-surface-container-high text-right">
        <div className="font-bold text-xs text-on-surface">{data.name}</div>
        <div className="text-xs font-tabular-stat text-secondary font-bold mt-1">
          {data.amountSdg.toLocaleString('en-US')} ج.س
        </div>
        <div className="text-[11px] text-on-surface-variant font-mono">
          {data.percentage}% من إجمالي المبيعات
        </div>
      </div>
    );
  }
  return null;
};

export const SalesChannelDonutChart: React.FC<SalesChannelDonutChartProps> = ({ channels }) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-high space-y-space-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            توزيع قنوات البيع والتحصيل
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            حصة المبيعات حسب نقطة الحجز
          </p>
        </div>
        <span className="material-symbols-outlined text-secondary text-[20px]">pie_chart</span>
      </div>

      {/* Donut Container */}
      <div className="flex items-center justify-center py-1">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channels}
                dataKey="percentage"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={54}
                outerRadius={74}
                paddingAngle={3}
              >
                {channels.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute text-center pointer-events-none">
            <span className="block font-tabular-stat text-headline-lg font-bold text-on-surface">
              100%
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant">
              قنوات نشطة
            </span>
          </div>
        </div>
      </div>

      {/* Channel Breakdown List */}
      <div className="space-y-2.5 pt-1">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high/60"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-md shrink-0"
                style={{ backgroundColor: channel.color }}
              ></span>
              <div>
                <div className="font-label-lg text-label-lg text-on-surface font-semibold">
                  {channel.name}
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant font-tabular-stat">
                  {channel.amountSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
                </div>
              </div>
            </div>
            <span className="font-tabular-stat text-headline-sm text-secondary font-bold">
              {channel.percentage}%
            </span>
          </div>
        ))}
      </div>

      {/* Summary Note */}
      <div className="p-3 rounded-lg bg-secondary-container/30 text-on-secondary-container flex items-start gap-2 border border-secondary-container/40">
        <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5 text-secondary">
          verified_user
        </span>
        <p className="font-body-sm text-body-sm leading-relaxed">
          حصة مكاتب الوكلاء تحقق أعلى استقرار في السيولة مع تدفق الإيداعات المسبقة بنسبة تغطية تأمينية كاملة.
        </p>
      </div>
    </div>
  );
};
