import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { CarrierPerformanceSummary } from '../types/reports';

interface CarrierShareBarChartProps {
  carriers: CarrierPerformanceSummary[];
}

export const CarrierShareBarChart: React.FC<CarrierShareBarChartProps> = ({ carriers }) => {
  const chartData = carriers.map((c) => ({
    name: c.carrierName.replace('شركة ', '').replace(' للنقل الجماعي', '').replace(' للنقل البري المتميز', ''),
    fullName: c.carrierName,
    salesM: Number((c.totalTicketSalesSdg / 1000000).toFixed(2)),
    netPayableM: Number((c.netPayableSdg / 1000000).toFixed(2)),
    commissionM: Number((c.platformCommissionSdg / 1000000).toFixed(2)),
    marketShare: c.marketSharePercent,
    occupancy: c.occupancyRatePercent,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-surface-container-lowest p-3 rounded-xl shadow-lg border border-surface-container-high text-right min-w-[220px]">
          <div className="font-bold text-xs text-on-surface mb-2 pb-1 border-b border-surface-container">
            {item.fullName}
          </div>
          <div className="space-y-1 text-xs font-tabular-stat">
            <div className="flex justify-between">
              <span className="font-bold text-secondary">{item.salesM}M ج.س</span>
              <span className="text-on-surface-variant">مبيعات التذاكر:</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-on-surface">{item.netPayableM}M ج.س</span>
              <span className="text-on-surface-variant">صافي المستحق:</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-primary">{item.commissionM}M ج.س</span>
              <span className="text-on-surface-variant">عمولة المنصة:</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-surface-container">
              <span className="font-bold text-secondary font-mono">{item.marketShare}%</span>
              <span className="text-on-surface-variant">الحصة السوقية:</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-high space-y-space-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-space-sm border-b border-surface-container-high">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
            مقارنة الإيرادات وحصص الناقلين (مليون ج.س)
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            إجمالي المبيعات المحققة مقابل صافي المستحق المحول للناقل بعد اقتطاع العمولة
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-label-md">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-secondary"></span>
            <span className="text-on-surface-variant">إجمالي المبيعات</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-secondary-fixed"></span>
            <span className="text-on-surface-variant">صافي المستحق للناقل</span>
          </div>
        </div>
      </div>

      <div className="w-full h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="#d5eee0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#0a1f17', fontSize: 11, fontFamily: 'IBM Plex Sans Arabic' }}
              axisLine={{ stroke: '#d0e8da' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${v}M`}
              tick={{ fill: '#574142', fontSize: 11, fontFamily: 'IBM Plex Sans Arabic' }}
              axisLine={false}
              tickLine={false}
              orientation="right"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="salesM"
              name="مبيعات التذاكر"
              fill="#226a4b"
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
            <Bar
              dataKey="netPayableM"
              name="صافي المستحق للناقل"
              fill="#a7efc7"
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
