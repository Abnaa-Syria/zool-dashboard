import React, { useState } from 'react';
import { useCancellationPolicies } from '../hooks/useRefunds';
import { PolicyTierCard } from '../components/PolicyTierCard';

export const CancellationPoliciesPage: React.FC = () => {
  const { tiers, faultRules, updateTier, toggleFaultRule } = useCancellationPolicies();
  const [saveToast, setSaveToast] = useState(false);
  const [changelogModalOpen, setChangelogModalOpen] = useState(false);

  const handleSaveAll = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 4000);
  };

  return (
    <div className="p-space-lg space-y-space-lg max-w-[1520px] mx-auto w-full">
      {/* Toast */}
      {saveToast && (
        <div className="p-3 bg-secondary text-on-secondary rounded-xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-label-lg text-sm">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
            تم حفظ القواعد والسياسات المالية وتعميمها بنجاح على محرك الحجز المركزي.
          </div>
          <button onClick={() => setSaveToast(false)} className="text-on-secondary/80 hover:text-on-secondary">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Header & Context Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high">
        <div className="flex flex-col gap-space-xs">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
            <a className="hover:text-secondary transition-colors" href="/reports">
              الرئيسية والعمليات
            </a>
            <span className="material-symbols-outlined text-sm">chevron_left</span>
            <a className="hover:text-secondary transition-colors" href="/reports">
              المالية والتسويات
            </a>
            <span className="material-symbols-outlined text-sm">chevron_left</span>
            <a className="hover:text-secondary transition-colors" href="/refunds/queue">
              الإلغاءات والاسترداد
            </a>
            <span className="material-symbols-outlined text-sm">chevron_left</span>
            <span className="text-secondary font-medium">سياسات وقواعد الإلغاء</span>
          </nav>

          <div className="flex flex-wrap items-center gap-space-sm mt-1">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              محرك ضبط قواعد وسياسات الإلغاء والاسترداد
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span>الإصدار المالي v3.2 — معتمد بموجب لائحة تنظيم النقل البري</span>
            </div>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            تكوين النماذج الحسابية، فترات السماح الزمني، وتوزيع رسوم الإلغاء بين شركات النقل ومحفظة ZoolGo المركزية.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-space-sm self-start lg:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => setChangelogModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high text-secondary font-label-lg text-sm shadow-xs hover:bg-surface-container transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-headline-sm">history_edu</span>
            <span>سجل تعديل السياسات (Changelog)</span>
          </button>
          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-container text-on-primary font-label-lg text-sm font-bold shadow-md hover:bg-primary transition-all active:scale-[0.98]"
            type="button"
          >
            <span className="material-symbols-outlined text-headline-sm">verified_user</span>
            <span>حفظ وتطبيق القواعد العامة</span>
          </button>
        </div>
      </div>

      {/* Operational & Governance Banner */}
      <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container-high relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-secondary"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md pr-2">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-secondary-container/60 text-secondary flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-headline-md">shield_with_heart</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-lg text-label-lg text-on-surface font-bold">
                تنبيه الحوكمة والالتزام القانوني
              </span>
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5 leading-relaxed">
                أي تعديل في النسب المالية أو المهل الزمنية يطبق فورياً على الحجوزات الجديدة ولا يسري بأثر رجعي على التذاكر المصدرة مسبقاً لحماية المراكز القانونية للمسافرين وفق المعايير الوزارية.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg text-secondary font-label-md text-xs whitespace-nowrap self-end md:self-auto border border-surface-container-high">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>آخر مزامنة رسمية: اليوم 11:42 ص</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Tiered Time-Based Policy Matrix */}
      <div className="flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">tune</span>
              <span>مصفوفة الاسترداد حسب الفترات الزمنية للمسافر</span>
            </h2>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Tiered Time-Based Passenger Cancellation Policy — احتساب فوري تلقائي عند طلب الإلغاء عبر التطبيق أو الوكيل
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-md text-xs text-on-surface-variant">الوضع الحالي:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-semibold">
              مفعّل بنظام التوزيع الذكي
            </span>
          </div>
        </div>

        {/* 4 Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {tiers.map((tier) => (
            <PolicyTierCard key={tier.tierId} tier={tier} onUpdateTier={updateTier} />
          ))}
        </div>
      </div>

      {/* SECTION 2 & 3: Carrier Faults & Management Exceptions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* SECTION 2: Carrier Operational Faults (7 Cols) */}
        <div className="xl:col-span-7 flex flex-col gap-space-md bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-high">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">bus_alert</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  سياسات الأعطال والتعثر التشغيلي لشركات النقل
                </h2>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Carrier Operational Faults & Delay Protection — تفعيل حماية المسافر التلقائية
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-semibold">
              حماية مفعّلة 100%
            </span>
          </div>

          <div className="flex flex-col gap-space-md mt-1">
            {faultRules.map((rule) => (
              <div
                key={rule.id}
                className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs transition-colors hover:bg-surface-container border border-surface-container-high"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">
                      {rule.id === 'fault-cancellation'
                        ? 'cancel_presentation'
                        : rule.id === 'fault-delay'
                        ? 'running_with_errors'
                        : 'published_with_changes'}
                    </span>
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">
                      {rule.title}
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.isEnabled}
                      onChange={(e) => toggleFaultRule(rule.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] rtl:after:right-auto rtl:after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>

                <p className="font-body-md text-sm text-on-surface leading-relaxed pr-7">
                  {rule.description}
                </p>

                <div className="flex items-center gap-4 pr-7 pt-1 font-label-md text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                    الرد البنكي التلقائي: فوري
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                    إشعار SMS ورسالة واتساب
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: Management Overrides & Emergency Contingency (5 Cols) */}
        <div className="xl:col-span-5 flex flex-col gap-space-md bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-high">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-container-high">
            <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-headline-sm">security</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                صندوق الطوارئ وسلطة التجاوز الإداري
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Discretionary Contingency Governance
              </p>
            </div>
          </div>

          <div className="space-y-space-sm text-xs">
            {/* Fund Balance Overview */}
            <div className="p-3 bg-secondary-container/20 rounded-lg flex items-center justify-between border border-secondary/30">
              <div className="flex flex-col">
                <span className="font-semibold text-secondary">صندوق الطوارئ المتاح:</span>
                <span className="font-tabular-stat text-lg font-bold text-on-surface">
                  48,250.00 ج.س
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-bold text-[11px]">
                سيولة آمنة
              </span>
            </div>

            {/* Authority matrix */}
            <div className="space-y-2 pt-1">
              <span className="font-bold text-on-surface block">
                مصفوفة حدود صلاحية الصرف الفوري (Override Limits):
              </span>
              <div className="p-2.5 bg-surface-container-low rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-on-surface">المشرف العام (Super Admin)</div>
                  <div className="text-on-surface-variant text-[11px]">اعتماد كامل بدون سقف محدد للرحلة</div>
                </div>
                <span className="font-mono font-bold text-primary">غير محدود</span>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-on-surface">مدير العمليات الميدانية (Operations Lead)</div>
                  <div className="text-on-surface-variant text-[11px]">حتى 1,500.00 ج.س لكل تذكرة</div>
                </div>
                <span className="font-mono font-bold text-secondary">1,500 ج.س</span>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-on-surface">مشرف المحطة المناوب (Terminal Supervisor)</div>
                  <div className="text-on-surface-variant text-[11px]">إثبات الواقعة وتوليد محضر التحقيق فقط</div>
                </div>
                <span className="font-mono font-bold text-on-surface-variant">محضر فقط</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Changelog Modal */}
      {changelogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xl max-w-lg w-full border border-surface-container-high flex flex-col gap-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <h3 className="font-headline-sm font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary">history_edu</span>
                سجل تعديل السياسات المحاسبية (Audit Changelog)
              </h3>
              <button
                onClick={() => setChangelogModalOpen(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <div className="space-y-2 text-xs divide-y divide-surface-container-high max-h-72 overflow-y-auto">
              <div className="pt-2">
                <div className="flex justify-between font-bold text-on-surface">
                  <span>تعديل نسبة المستوى الثاني (T-2) إلى 85%</span>
                  <span className="font-mono text-secondary">2024-10-18</span>
                </div>
                <p className="text-on-surface-variant mt-0.5">
                  اعتماد خصم 15% تشغيلي لصالح الناقل والمنصة بدلاً من 20% لتشجيع الحجز المبكر.
                </p>
                <span className="text-[10px] text-outline font-mono">بواسطة: أحمد السر (Super Admin)</span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between font-bold text-on-surface">
                  <span>تفعيل الحماية من الأعطال الكبرى (Major Delay Protection)</span>
                  <span className="font-mono text-secondary">2024-10-01</span>
                </div>
                <p className="text-on-surface-variant mt-0.5">
                  إلزام الناقل بالاسترداد 100% في حال تجاوز التأخير 120 دقيقة.
                </p>
                <span className="text-[10px] text-outline font-mono">بواسطة: النظام المالي المركزي</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancellationPoliciesPage;
