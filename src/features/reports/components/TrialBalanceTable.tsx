import React from 'react';
import type { TrialBalanceAccount } from '../types/reports';

interface TrialBalanceTableProps {
  accounts: TrialBalanceAccount[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
}

export const TrialBalanceTable: React.FC<TrialBalanceTableProps> = ({
  accounts,
  totalDebits,
  totalCredits,
  isBalanced,
}) => {
  const formatSdg = (val: number) => {
    if (val === 0) return '—';
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getStatusBadge = (status: TrialBalanceAccount['status'], label: string) => {
    switch (status) {
      case 'automated_match':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-bold">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            {label}
          </span>
        );
      case 'ledger_verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-xs font-bold">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            {label}
          </span>
        );
      case 'pending_cycle':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-secondary font-label-md text-xs font-bold">
            <span className="material-symbols-outlined text-[15px]">schedule</span>
            {label}
          </span>
        );
      case 'audited':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-xs font-bold">
            <span className="material-symbols-outlined text-[15px]">verified_user</span>
            {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-md text-xs">
            {label}
          </span>
        );
    }
  };

  const getCategoryBadge = (category: TrialBalanceAccount['category'], label: string) => {
    switch (category) {
      case 'current_assets':
        return (
          <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-[11px] font-semibold">
            {label}
          </span>
        );
      case 'intermediary_liabilities':
        return (
          <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-md text-[11px] font-semibold">
            {label}
          </span>
        );
      case 'operational_liabilities':
        return (
          <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-[11px] font-semibold">
            {label}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-md text-[11px] font-semibold">
            {label}
          </span>
        );
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container-high">
      {/* Top Toolbar */}
      <div className="p-space-md bg-surface-container-low flex flex-wrap items-center justify-between gap-space-sm border-b border-surface-container-high">
        <div className="flex items-center gap-space-sm">
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
            جدول ميزان المراجعة الموحد
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-md text-label-md font-mono">
            {accounts.length} حسابات رئيسية
          </span>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-[18px] text-secondary">
            lock
          </span>
          <span>توازن القيد المزدوج مدقق آلياً بنسبة 100%</span>
        </div>
      </div>

      {/* High Density Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">
              <th className="py-3 px-4 font-bold" rowSpan={2}>
                رمز الدليل
              </th>
              <th className="py-3 px-4 font-bold" rowSpan={2}>
                اسم الحساب العام / الفرعي
              </th>
              <th className="py-3 px-3 font-bold" rowSpan={2}>
                التصنيف المحاسبي
              </th>
              <th
                className="py-2 px-3 font-bold text-center bg-surface-container-high border-x border-surface-container"
                colSpan={2}
              >
                الرصيد الافتتاحي
              </th>
              <th
                className="py-2 px-3 font-bold text-center bg-surface-container border-x border-surface-container-high"
                colSpan={2}
              >
                حركات الفترة الحالية
              </th>
              <th
                className="py-2 px-3 font-bold text-center bg-surface-container-high border-x border-surface-container"
                colSpan={2}
              >
                الرصيد الختامي الصافي
              </th>
              <th className="py-3 px-4 font-bold text-center" rowSpan={2}>
                حالة المطابقة والتدقيق
              </th>
            </tr>
            <tr className="bg-surface-container text-on-surface-variant font-label-md text-[11px] uppercase tracking-wider border-b border-surface-container-high">
              <th className="py-1.5 px-3 text-left font-semibold bg-surface-container-high">
                مدين (ج.س)
              </th>
              <th className="py-1.5 px-3 text-left font-semibold bg-surface-container-high border-l border-surface-container">
                دائن (ج.س)
              </th>
              <th className="py-1.5 px-3 text-left font-semibold bg-surface-container">
                مدين (ج.س)
              </th>
              <th className="py-1.5 px-3 text-left font-semibold bg-surface-container border-l border-surface-container-high">
                دائن (ج.س)
              </th>
              <th className="py-1.5 px-3 text-left font-semibold bg-surface-container-high">
                مدين (ج.س)
              </th>
              <th className="py-1.5 px-3 text-left font-semibold bg-surface-container-high border-l border-surface-container">
                دائن (ج.س)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high text-on-surface font-body-sm text-body-sm">
            {accounts.map((acc) => (
              <tr
                key={acc.accountCode}
                className="hover:bg-surface-container-low transition-colors"
              >
                <td className="py-3.5 px-4 font-mono font-bold text-secondary text-left" dir="ltr">
                  {acc.accountCode}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-label-lg text-label-lg font-bold text-on-surface">
                    {acc.accountName}
                  </div>
                  <div className="text-[11px] text-on-surface-variant font-mono">
                    {acc.englishSubtext}
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  {getCategoryBadge(acc.category, acc.categoryLabel)}
                </td>
                <td className="py-3.5 px-3 font-mono font-bold text-left text-on-surface bg-surface-container-low/40">
                  {formatSdg(acc.openingDebitSdg)}
                </td>
                <td className="py-3.5 px-3 font-mono text-left text-outline-variant bg-surface-container-low/40 border-l border-surface-container-high">
                  {formatSdg(acc.openingCreditSdg)}
                </td>
                <td className="py-3.5 px-3 font-mono text-left text-secondary font-bold">
                  {acc.periodDebitSdg > 0 ? `+${formatSdg(acc.periodDebitSdg)}` : '—'}
                </td>
                <td className="py-3.5 px-3 font-mono text-left text-primary font-bold border-l border-surface-container-high">
                  {acc.periodCreditSdg > 0 ? `-${formatSdg(acc.periodCreditSdg)}` : '—'}
                </td>
                <td className="py-3.5 px-3 font-mono font-bold text-left text-secondary bg-surface-container-high/40">
                  {formatSdg(acc.closingDebitSdg)}
                </td>
                <td className="py-3.5 px-3 font-mono font-bold text-left text-on-surface bg-surface-container-high/40 border-l border-surface-container-high">
                  {formatSdg(acc.closingCreditSdg)}
                </td>
                <td className="py-3.5 px-4 text-center">
                  {getStatusBadge(acc.status, acc.statusLabel)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-surface-container font-headline-sm text-headline-sm text-on-surface font-bold border-t-2 border-surface-container-high">
              <td className="py-4 px-4 text-right" colSpan={3}>
                إجمالي التوازن المحاسبي النهائي (Grand Total)
              </td>
              <td className="py-4 px-3 text-left font-mono text-secondary bg-surface-container-high/40">
                —
              </td>
              <td className="py-4 px-3 text-left font-mono text-secondary bg-surface-container-high/40 border-l border-surface-container-high">
                —
              </td>
              <td className="py-4 px-3 text-left font-mono text-secondary">
                —
              </td>
              <td className="py-4 px-3 text-left font-mono text-primary border-l border-surface-container-high">
                —
              </td>
              <td className="py-4 px-3 text-left font-mono font-bold text-secondary bg-surface-container-high">
                {totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
              </td>
              <td className="py-4 px-3 text-left font-mono font-bold text-primary bg-surface-container-high border-l border-surface-container-high">
                {totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
              </td>
              <td className="py-4 px-4 text-center">
                <span
                  className={`px-3 py-1 rounded-full font-label-md text-label-md font-bold ${
                    isBalanced
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-error text-on-error'
                  }`}
                >
                  {isBalanced ? 'تطابق تام (0.00)' : 'فارق تسوية'}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
