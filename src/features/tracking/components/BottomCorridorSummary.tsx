import * as React from 'react';

export const BottomCorridorSummary: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 select-none" dir="rtl">
      {/* 1. Cellular Network Coverage */}
      <div className="p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-on-surface-variant font-medium">محطات التغطية الخلوية</span>
          <span className="text-sm font-bold text-on-surface leading-tight mt-0.5">100% متصلة</span>
          <span className="text-[10px] text-secondary font-medium">زين / سوداني 4G شريان الشمال</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-secondary-container text-secondary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">cell_tower</span>
        </div>
      </div>

      {/* 2. Emergency Alerts */}
      <div className="p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-on-surface-variant font-medium">بلاغات الطوارئ النشطة</span>
          <span className="text-sm font-bold text-secondary leading-tight mt-0.5">0 بلاغ</span>
          <span className="text-[10px] text-on-surface-variant font-medium">كافة الرحلات تسير بسلامة تامة</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-surface-container-high text-secondary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
        </div>
      </div>

      {/* 3. Schedule Discipline Rate */}
      <div className="p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-on-surface-variant font-medium">معدل الانضباط الزمني اليوم</span>
          <span className="text-sm font-bold text-on-surface font-tabular-stat leading-tight mt-0.5">96.4%</span>
          <span className="text-[10px] text-secondary font-semibold">+1.8% تحسن عن الأسبوع الماضي</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">schedule</span>
        </div>
      </div>

      {/* 4. Approved Checkpoints & Rest Stops */}
      <div className="p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-on-surface-variant font-medium">استراحات التزود المعتمدة</span>
          <span className="text-sm font-bold text-on-surface leading-tight mt-0.5">14 نقطة تفتيش</span>
          <span className="text-[10px] text-on-surface-variant font-medium">شندي • الدامر • مروي • هيا</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">local_gas_station</span>
        </div>
      </div>
    </div>
  );
};
