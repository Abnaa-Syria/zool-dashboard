import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { CashFlowWeekPoint } from '../types/reports';

interface CashFlowChartProps {
  data: CashFlowWeekPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const gmv = payload.find((p: any) => p.dataKey === 'gmvSdg')?.value || 0;
    const commissions = payload.find((p: any) => p.dataKey === 'agentCommissionsSdg')?.value || 0;
    const takeRate = payload.find((p: any) => p.dataKey === 'takeRateSdg')?.value || 0;
    const isPeak = payload[0]?.payload?.isPeak;

    return (
      <div className="bg-surface-container-lowest p-3 rounded-xl shadow-lg border border-surface-container-high text-right min-w-[200px]">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-surface-container">
          <span className="font-bold text-on-surface text-xs">{label}</span>
          {isPeak && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary text-on-primary font-bold">
              ذروة الموسم
            </span>
          )}
        </div>
        <div className="space-y-1 text-xs font-tabular-stat">
          <div className="flex items-center justify-between gap-4">
            <span className="text-secondary font-bold">
              {gmv.toLocaleString('en-US')} ج.س
            </span>
            <span className="text-on-surface-variant font-normal">حجم التداول:</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-secondary-fixed-dim font-bold">
              {commissions.toLocaleString('en-US')} ج.س
            </span>
            <span className="text-on-surface-variant font-normal">عمولات الوكلاء:</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-surface-container">
            <span className="text-primary font-bold">
              {takeRate.toLocaleString('en-US')} ج.س
            </span>
            <span className="text-on-surface-variant font-normal">صافي المنصة (5%):</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
  const formatSdgCompact = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(0)}k`;
    }
    return val.toString();
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-high">
      {/* Header & Legends */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-space-md border-b border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">
              ssid_chart
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              مخطط التدفقات النقدية وصافي الإيرادات الأسبوعي
            </h2>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            حجم التداول الكلي (GMV) بمواجهة صافي اقتطاع المنصة (Take Rate)
          </p>
        </div>

        {/* Legend Pills */}
        <div className="flex items-center gap-3 flex-wrap font-label-md text-label-md">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-secondary"></span>
            <span className="text-on-surface-variant">حجم التداول الكلي</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-secondary-fixed"></span>
            <span className="text-on-surface-variant">عمولات الوكلاء</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-primary"></span>
            <span className="text-on-surface-variant">صافي إيراد المنصة</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="#d5eee0" vertical={false} />
            <XAxis
              dataKey="weekLabel"
              tick={{ fill: '#0a1f17', fontSize: 11, fontFamily: 'IBM Plex Sans Arabic' }}
              axisLine={{ stroke: '#d0e8da' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatSdgCompact}
              tick={{ fill: '#574142', fontSize: 11, fontFamily: 'IBM Plex Sans Arabic' }}
              axisLine={false}
              tickLine={false}
              orientation="right"
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Bar 1: Commissions */}
            <Bar
              dataKey="agentCommissionsSdg"
              name="عمولات الوكلاء"
              fill="#a7efc7"
              radius={[4, 4, 0, 0]}
              barSize={28}
            />
            {/* Bar 2: Total GMV */}
            <Bar
              dataKey="gmvSdg"
              name="حجم التداول الكلي"
              fill="#226a4b"
              radius={[4, 4, 0, 0]}
              barSize={28}
            />
            {/* Overlay Line: Platform Take Rate */}
            <Line
              type="monotone"
              dataKey="takeRateSdg"
              name="صافي إيراد المنصة"
              stroke="#6d001e"
              strokeWidth={3}
              dot={{ r: 4, fill: '#ffffff', stroke: '#6d001e', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#6d001e', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Insight Footer Card */}
      <div className="mt-4 p-space-md rounded-lg bg-surface-container-low flex items-start gap-3 border border-surface-container-high">
        <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">
          insights
        </span>
        <div className="space-y-1">
          <span className="font-label-lg text-label-lg text-on-surface font-bold block">
            ملاحظة تحليلية للتدفقات النقدية:
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            ذروة المبيعات تحققت في الأسبوع <strong className="text-secondary font-bold">W-42</strong> بقيمة تداول تجاوزت 11,400,000 ج.س بالتزامن مع عطلة نهاية الأسبوع وموسم السفر الإقليمي للشمالية وبورتسودان. نسبة السيولة المجمعة عبر بنكك بلغت 58% في هذه الفترة دون تسجيل أي تأخير تسوية.
          </p>
        </div>
      </div>
    </div>
  );
};
