import React from 'react';
import type { DoubleEntryLeg } from '../types/financials';

interface DoubleEntryBreakdownCardProps {
  legs: DoubleEntryLeg[];
  transactionId: string;
}

export const DoubleEntryBreakdownCard: React.FC<DoubleEntryBreakdownCardProps> = ({
  legs,
}) => {
  const debitLegs = legs.filter((l) => l.type === 'debit');
  const creditLegs = legs.filter((l) => l.type === 'credit');

  const totalDebit = debitLegs.reduce((sum, l) => sum + l.amountSdg, 0);
  const totalCredit = creditLegs.reduce((sum, l) => sum + l.amountSdg, 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.001;

  const formatSdg = (val: number) => {
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container-high">
      {/* Header */}
      <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 rounded bg-primary-container inline-block"></span>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
            بيانات القيد المزدوج والمطابقة المحاسبية (Double-Entry Breakdown)
          </h2>
        </div>
        <span
          className={`px-3 py-1 rounded-full font-label-md text-label-md font-bold ${
            isBalanced
              ? 'bg-secondary-fixed text-on-secondary-fixed'
              : 'bg-error-container text-on-error-container'
          }`}
        >
          {isBalanced ? 'متطابق آلياً بنسبة 100%' : 'يوجد فارق تسوية!'}
        </span>
      </div>

      <p className="font-body-md text-body-md text-on-surface-variant -mt-2">
        التوزيع المالي للعملية مع تطبيق شروط دورة المقاصة المباشرة بين حساب شركة النقل، عمولة الوكالة، والخصم المباشر.
      </p>

      {/* Double Entry Table */}
      <div className="overflow-x-auto rounded-lg bg-surface-container-low/60 p-1 border border-surface-container-high">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-md text-label-md">
              <th className="py-3 px-space-md rounded-r-md">الحساب العام / الدليل المحاسبي</th>
              <th className="py-3 px-space-md">التصنيف التشغيلي</th>
              <th className="py-3 px-space-md text-left">الطرف المدين (Debit)</th>
              <th className="py-3 px-space-md text-left rounded-l-md">الطرف الدائن (Credit)</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md text-on-surface divide-y divide-surface-container">
            {legs.map((leg, index) => {
              const isDebit = leg.type === 'debit';
              return (
                <tr
                  key={`${leg.accountCode}-${index}`}
                  className="hover:bg-surface-container-lowest transition-colors"
                >
                  <td className="py-3.5 px-space-md">
                    <div className="flex flex-col">
                      <span
                        className={`font-semibold ${
                          isDebit ? 'text-secondary' : 'text-primary'
                        }`}
                      >
                        {leg.accountName}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                        {leg.accountCode}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-space-md">
                    <span
                      className={`px-2 py-0.5 rounded font-label-md text-label-md ${
                        isDebit
                          ? 'bg-surface-container text-on-surface-variant'
                          : 'bg-primary-fixed text-on-primary-fixed'
                      }`}
                    >
                      {leg.description}
                    </span>
                  </td>
                  <td
                    className="py-3.5 px-space-md text-left font-tabular-stat text-tabular-stat text-secondary font-bold"
                    dir="ltr"
                  >
                    {isDebit ? `+ ${formatSdg(leg.amountSdg)} ج.س` : '—'}
                  </td>
                  <td
                    className="py-3.5 px-space-md text-left font-tabular-stat text-tabular-stat text-primary font-bold"
                    dir="ltr"
                  >
                    {!isDebit ? `- ${formatSdg(leg.amountSdg)} ج.س` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-surface-container font-headline-sm text-headline-sm text-on-surface font-bold">
              <td className="py-3 px-space-md rounded-r-md" colSpan={2}>
                إجمالي المطابقة والتوازن المحاسبي
              </td>
              <td
                className="py-3 px-space-md text-left font-tabular-stat text-tabular-stat text-secondary"
                dir="ltr"
              >
                {formatSdg(totalDebit)} ج.س
              </td>
              <td
                className="py-3 px-space-md text-left font-tabular-stat text-tabular-stat text-primary"
                dir="ltr"
              >
                {formatSdg(totalCredit)} ج.س
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Parity confirmation box */}
      <div
        className={`flex items-center justify-between p-space-md rounded-lg ${
          isBalanced
            ? 'bg-secondary-fixed/30 text-secondary'
            : 'bg-error-container text-error'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">
            {isBalanced ? 'task_alt' : 'error'}
          </span>
          <span className="font-label-lg text-label-lg font-bold">
            الفارق الحسابي المحقق: {formatSdg(difference)} ج.س
          </span>
        </div>
        <span className="font-body-sm text-body-sm font-medium">
          {isBalanced
            ? 'تم تطبيق خوارزمية التدقيق المزدوج بالتزامن مع كود القيد المركزي'
            : 'تنبيه: يوجد اختلال في توازن القيد المحاسبي يتطلب تدقيق المراقب'}
        </span>
      </div>
    </div>
  );
};
