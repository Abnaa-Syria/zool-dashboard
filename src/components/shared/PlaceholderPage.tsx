import * as React from 'react';
import { Breadcrumbs } from '../../app/shell/Breadcrumbs';
import { Card } from '../ui/Card';
import { Link } from 'react-router-dom';

export interface PlaceholderPageProps {
  moduleName: string;
  moduleEnglish: string;
  icon: string;
  stageName: string;
  plannedFeatures: string[];
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  moduleName,
  moduleEnglish,
  icon,
  stageName,
  plannedFeatures,
}) => {
  return (
    <div className="flex flex-col w-full pb-space-xl text-right">
      <Breadcrumbs items={[{ label: 'الرئيسية والعمليات', path: '/overview' }, { label: moduleName }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-lg">
        <div className="flex items-center gap-space-sm">
          <div className="w-12 h-12 rounded-xl bg-surface-container text-secondary flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[26px]">{icon}</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-on-surface">{moduleName}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold">
                {moduleEnglish}
              </span>
            </div>
            <span className="text-xs text-on-surface-variant mt-0.5">
              مكون قيد التطوير المجدول — غير مفعل بالكامل في المرحلة الحالية
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface text-xs font-bold w-fit border border-outline-variant/30">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span>مجدول للتسليم في: {stageName}</span>
        </div>
      </div>

      <Card className="p-space-lg max-w-2xl border border-outline-variant/40 shadow-card">
        <div className="flex items-center gap-2 pb-space-xs border-b border-outline-variant/20 mb-space-sm">
          <span className="material-symbols-outlined text-secondary text-[20px]">construction</span>
          <h2 className="text-sm font-bold text-on-surface">محتويات الوحدة المخططة وفق وثائق التصميم</h2>
        </div>

        <p className="text-xs text-on-surface-variant mb-space-md leading-relaxed">
          تم تصميم شاشات هذه الوحدة بالكامل في ملفات Stitch ووثائق التحليل. سيتم تفعيلها تدريجياً في المراحل القادمة لربطها بالبيانات المشتركة ونظام التتبع.
        </p>

        <ul className="space-y-2 mb-space-lg">
          {plannedFeatures.map((feat, idx) => (
            <li key={idx} className="flex items-center gap-2 text-xs text-on-surface font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        <div className="pt-space-sm border-t border-outline-variant/20 flex items-center justify-between">
          <span className="text-[11px] text-outline">حالة الشاشة: نموذج نائب (Placeholder)</span>
          <Link
            to="/overview"
            className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
          >
            <span>العودة للوحة التحكم المركزية</span>
            <span className="material-symbols-outlined text-[14px]">chevron_left</span>
          </Link>
        </div>
      </Card>
    </div>
  );
};
