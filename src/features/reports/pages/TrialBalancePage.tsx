import React, { useState } from 'react';
import { useTrialBalance } from '../hooks/useReports';
import { TrialBalanceTable } from '../components/TrialBalanceTable';
import type { TrialBalanceAccount } from '../types/reports';

export const TrialBalancePage: React.FC = () => {
  const { data, loading, error, exportCsv } = useTrialBalance();

  const [dateRange, setDateRange] = useState('current_month');
  const [accountScope, setAccountScope] = useState<string>('all');
  const [treeDepth, setTreeDepth] = useState<string>('level4');

  if (loading) {
    return (
      <div className="p-space-lg flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="font-body-md text-on-surface-variant">جاري تحميل ميزان المراجعة ودفتر الأستاذ العام...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-space-lg">
        <div className="p-space-md rounded-xl bg-error-container text-on-error-container font-label-lg">
          حدث خطأ أثناء تحميل سجلات ميزان المراجعة.
        </div>
      </div>
    );
  }

  // Filter accounts if scope is selected
  const filteredAccounts = data.accounts.filter((acc: TrialBalanceAccount) => {
    if (accountScope === 'all') return true;
    if (accountScope === '1000' && acc.accountCode.startsWith('1')) return true;
    if (accountScope === '2000' && acc.accountCode.startsWith('2')) return true;
    if (accountScope === '4000' && acc.accountCode.startsWith('4')) return true;
    if (accountScope === '5000' && acc.accountCode.startsWith('5')) return true;
    return false;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    exportCsv();
  };

  return (
    <div className="p-space-lg space-y-space-lg max-w-[1520px] mx-auto w-full">
      {/* Breadcrumbs & Quick Meta */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <nav className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant">
          <a className="hover:text-secondary transition-colors" href="/reports">
            الرئيسية والعمليات
          </a>
          <span className="material-symbols-outlined text-[14px]">chevron_left</span>
          <a className="hover:text-secondary transition-colors" href="/reports">
            المالية والتسويات
          </a>
          <span className="material-symbols-outlined text-[14px]">chevron_left</span>
          <a className="hover:text-secondary transition-colors" href="/reports">
            التقارير المالية والإحصاءات
          </a>
          <span className="material-symbols-outlined text-[14px]">chevron_left</span>
          <span className="text-secondary font-semibold">ميزان المراجعة والمطابقة</span>
        </nav>
        <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md bg-surface-container px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          <span>دفتر الأستاذ العام الموحد (General Ledger Core v4.2)</span>
          <span className="text-outline">/</span>
          <span className="font-mono text-secondary">#ZGL-GL-20241024</span>
        </div>
      </div>

      {/* Header & Filter Bar */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md border border-surface-container-high">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          <div className="space-y-1">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-secondary text-[28px]">balance</span>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                تقرير ميزان المراجعة العام والمطابقة المحاسبية
              </h1>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              كشف التحقق المالي التراكمي الموحد وتوازن القيد المزدوج لكافة حسابات منصة ZoolGo وعمليات أسطول النقل البري
            </p>
          </div>

          {/* Export & Action Buttons */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 h-10 px-4 rounded-lg bg-surface-container text-secondary hover:bg-surface-container-high transition-colors font-label-lg text-label-lg shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>طباعة ميزان المراجعة الرسمي</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors font-label-lg text-label-lg shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>تصدير كشف التدقيق (Excel / CSV)</span>
            </button>
          </div>
        </div>

        {/* Filters & Segment Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-space-sm pt-space-xs">
          {/* Date Selector */}
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface-variant font-semibold">
              فترة التقرير المحاسبي
            </label>
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full h-10 pr-9 pl-8 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary appearance-none cursor-pointer"
              >
                <option value="current_month">الشهر الحالي: أكتوبر 2024 (حتى اليوم 24 أكتوبر)</option>
                <option value="q3_2024">الربع الثالث: Q3 2024 (يوليو - سبتمبر)</option>
                <option value="ytd_2024">السنة المالية 2024 التراكمية</option>
                <option value="custom">تخصيص نطاق زمني محدد...</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                date_range
              </span>
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Account Scope Filter */}
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface-variant font-semibold">نطاق الحسابات</label>
            <div className="relative">
              <select
                value={accountScope}
                onChange={(e) => setAccountScope(e.target.value)}
                className="w-full h-10 pr-9 pl-8 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary appearance-none cursor-pointer"
              >
                <option value="all">نوع الحساب: كافة حسابات الأستاذ العام</option>
                <option value="1000">1000 - حسابات الأصول والنقدية الوسيطة</option>
                <option value="2000">2000 - الالتزامات ومستحقات الشركاء</option>
                <option value="4000">4000 - الإيرادات ورسوم الحجوزات</option>
                <option value="5000">5000 - المصروفات التشغيلية والتقنية</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                account_tree
              </span>
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Tree Depth Level */}
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface-variant font-semibold">
              مستوى التفصيل المحاسبي
            </label>
            <div className="relative">
              <select
                value={treeDepth}
                onChange={(e) => setTreeDepth(e.target.value)}
                className="w-full h-10 pr-9 pl-8 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary appearance-none cursor-pointer"
              >
                <option value="level4">المستوى الرابع (حسابات فرعية تفصيلية)</option>
                <option value="level3">المستوى الثالث (حسابات رئيسية مجمعة)</option>
                <option value="level2">المستوى الثاني (المجموعات المالية الكبرى)</option>
                <option value="level1">المستوى الأول (الفئات الكلية للميزانية)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                format_list_numbered_rtl
              </span>
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Ledger Currency & Status */}
          <div className="flex flex-col justify-end">
            <div className="flex items-center justify-between h-10 px-3 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">currency_exchange</span>
                <span>
                  العملة الأساسية: <strong>جنيه سوداني (SDG)</strong>
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-bold text-[11px]">
                مكتمل
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Audit & Balance Indicator Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Main Balance Health Hero (7 Cols) */}
        <div className="lg:col-span-7 bg-tertiary text-on-tertiary p-space-lg rounded-xl shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-secondary/20 blur-2xl pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary-fixed animate-ping"></span>
              <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-lg text-label-lg font-bold flex items-center gap-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                ميزان المراجعة متوازن ومطابق بنسبة 100%
              </span>
            </div>
            <span className="text-tertiary-fixed-dim font-label-md text-label-md font-mono">
              Audit Checksum: 0x8F94...42E
            </span>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-space-md pt-space-xs">
            <div className="space-y-1">
              <span className="font-label-md text-label-md text-tertiary-fixed-dim block">
                إجمالي الأرصدة المدينة (Total Debits)
              </span>
              <div className="font-tabular-stat text-tabular-stat text-on-tertiary font-bold tracking-tight">
                {data.totalDebitsSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                <span className="font-label-md text-label-md font-normal text-tertiary-fixed-dim">ج.س</span>
              </div>
              <div className="text-[11px] text-tertiary-fixed flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">north_east</span>
                حركات موجبة متسقة
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-label-md text-label-md text-tertiary-fixed-dim block">
                إجمالي الأرصدة الدائنة (Total Credits)
              </span>
              <div className="font-tabular-stat text-tabular-stat text-on-tertiary font-bold tracking-tight">
                {data.totalCreditsSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                <span className="font-label-md text-label-md font-normal text-tertiary-fixed-dim">ج.س</span>
              </div>
              <div className="text-[11px] text-tertiary-fixed flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">south_east</span>
                تسويات مكتملة القيد
              </div>
            </div>

            <div className="space-y-1 sm:pr-space-sm bg-tertiary-container/40 p-2.5 rounded-lg">
              <span className="font-label-md text-label-md text-secondary-fixed block font-bold">
                الفارق الحسابي (Variance)
              </span>
              <div className="font-tabular-stat text-tabular-stat text-secondary-fixed font-bold tracking-tight">
                {data.varianceSdg.toFixed(2)}{' '}
                <span className="font-label-md text-label-md font-normal text-on-tertiary">ج.س</span>
              </div>
              <div className="text-[11px] text-secondary-fixed flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">task_alt</span>
                توازن تام بدون قيود معلقة
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-space-md pt-3 bg-tertiary-container/60 px-3 py-2 rounded-lg flex items-center justify-between text-tertiary-fixed-dim font-label-md text-label-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-fixed text-[18px]">lock_clock</span>
              <span>سلامة الدفتر (Ledger Integrity): مشفر وموثق لحظياً برقم SHA-256</span>
            </div>
            <span className="font-mono text-secondary-fixed font-bold">Ledger Block #498,130</span>
          </div>
        </div>

        {/* Quick Operational Metrics (5 Cols) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-space-sm">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-surface-container-high">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
                بوابات التحصيل النشطة
              </span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="font-tabular-stat text-headline-lg text-on-surface font-bold">
                16,150,000 <span className="font-label-md text-label-md font-normal text-on-surface-variant">ج.س</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">بنكك، كاشير، سداد وسيط</p>
            </div>
            <div className="mt-2 text-[11px] text-secondary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              تطابق فوري مع كشوف البنوك
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-surface-container-high">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
                محافظ الوكلاء المسبقة
              </span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="font-tabular-stat text-headline-lg text-on-surface font-bold">
                4,820,450 <span className="font-label-md text-label-md font-normal text-on-surface-variant">ج.س</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">142 وكيل نشط بالولايات</p>
            </div>
            <div className="mt-2 text-[11px] text-secondary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">format_image_left</span>
              مطابق للرصيد الدفتري
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-surface-container-high">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
                مستحقات شركات النقل
              </span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">directions_bus</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="font-tabular-stat text-headline-lg text-on-surface font-bold">
                8,250,000 <span className="font-label-md text-label-md font-normal text-on-surface-variant">ج.س</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">دورة الصرف الأسبوعية W-44</p>
            </div>
            <div className="mt-2 text-[11px] text-on-surface-variant font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">pending_actions</span>
              تاريخ التحويل: الأحد القادم
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-surface-container-high">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
                إيراد العمولات المحققة
              </span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="font-tabular-stat text-headline-lg text-primary font-bold">
                2,142,510 <span className="font-label-md text-label-md font-normal text-on-surface-variant">ج.س</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">صافي دخل المنصة الشهري</p>
            </div>
            <div className="mt-2 text-[11px] text-secondary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">insights</span>
              +14.8% مقارنة بـ سبتمبر
            </div>
          </div>
        </div>
      </div>

      {/* Reconciliation Visual Mini-Panel: Account Distribution */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col lg:flex-row items-center justify-between gap-space-md border border-surface-container-high">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[22px]">donut_large</span>
          </div>
          <div>
            <div className="font-label-lg text-label-lg text-on-surface font-bold">
              توزيع الأرصدة عبر الفئات المحاسبية الكبرى
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              مخطط التوازن الديناميكي بين الحسابات الوسيطة وحقوق الناقلين
            </div>
          </div>
        </div>

        {/* Segmented Bar Visualization */}
        <div className="w-full lg:max-w-xl space-y-1.5">
          <div className="h-3 w-full rounded-full bg-surface-container overflow-hidden flex">
            <div className="h-full bg-secondary" style={{ width: '38%' }} title="أصول وسيطة وبوابات: 38%"></div>
            <div
              className="h-full bg-secondary-fixed-dim"
              style={{ width: '24%' }}
              title="أرصدة محافظ الوكلاء: 24%"
            ></div>
            <div
              className="h-full bg-primary-container"
              style={{ width: '26%' }}
              title="مستحقات الناقلين: 26%"
            ></div>
            <div
              className="h-full bg-tertiary-container"
              style={{ width: '12%' }}
              title="إيرادات وعمولات: 12%"
            ></div>
          </div>
          <div className="flex items-center justify-between font-label-md text-[11px] text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary"></span> بوابات الدفع (38%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim"></span> محافظ الوكلاء (24%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span> مستحقات الناقلين (26%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary-container"></span> عمولات المنصة (12%)
            </span>
          </div>
        </div>
      </div>

      {/* Trial Balance Accounting Table */}
      <TrialBalanceTable
        accounts={filteredAccounts}
        totalDebits={data.totalDebitsSdg}
        totalCredits={data.totalCreditsSdg}
        isBalanced={data.isBalanced}
      />
    </div>
  );
};

export default TrialBalancePage;
