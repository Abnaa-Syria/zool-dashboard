import * as React from 'react';
import type { Booking, FinancialLedgerEntry } from '../types/booking';

interface FinancialLedgerTableProps {
  booking: Booking;
  entries: FinancialLedgerEntry[];
}

export const FinancialLedgerTable: React.FC<FinancialLedgerTableProps> = ({
  booking,
  entries,
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between gap-5">
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">account_balance</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">جدول التدقيق المالي للحركات</h2>
              <span className="text-xs text-slate-500">القيود المحاسبية الدائنة والمدينة المباشرة</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500">العملة: ج.س (SDG)</span>
        </div>

        {/* Financial Trace Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">نوع الحركة</th>
                <th className="py-2.5 px-2 text-center">الرقم المرجعي</th>
                <th className="py-2.5 px-2 text-left">الاتجاه والمبلغ</th>
                <th className="py-2.5 px-3 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => {
                const isDebit = entry.direction === 'debit';
                const isAccrual = entry.direction === 'accrual';

                return (
                  <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{entry.typeLabel}</div>
                      <div className="text-[11px] text-slate-500">{entry.accountHead}</div>
                    </td>

                    <td className="py-3 px-2 text-center">
                      <span className="font-mono text-xs font-bold text-slate-800 select-all">
                        {entry.referenceNumber}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-left" dir="ltr">
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-mono text-sm font-bold ${
                            isDebit
                              ? 'text-[#8E1B32]'
                              : isAccrual
                              ? 'text-emerald-700'
                              : 'text-slate-900'
                          }`}
                        >
                          {isDebit ? '-' : isAccrual ? '+' : ''}
                          {entry.amount.toFixed(2)} ج.س
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isDebit
                            ? 'مدين (خصم قطعي)'
                            : isAccrual
                            ? 'دائن (تجميع استحقاق)'
                            : 'دائن (إيداع)'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          entry.status === 'settled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : entry.status === 'accrued_pending_settlement'
                            ? 'bg-amber-100 text-amber-800'
                            : entry.status === 'pending'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-blue-50 text-blue-800'
                        }`}
                      >
                        {entry.status === 'settled'
                          ? 'مكتملة ومثبتة'
                          : entry.status === 'accrued_pending_settlement'
                          ? 'قيد التجميع'
                          : entry.status === 'pending'
                          ? 'معلقة'
                          : 'معتمدة'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Micro Settlement Breakdown Matrix (Matching Stitch _8) */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2.5 text-xs">
        <span className="font-bold text-slate-900 text-xs">ملخص تسوية الرحلة الصافية</span>

        <div className="flex items-center justify-between text-slate-600">
          <span>إجمالي ما سدده المسافر نقداً / إلكترونياً:</span>
          <span className="font-mono font-bold text-slate-900">
            {booking.totalAmount.toFixed(2)} ج.س
          </span>
        </div>

        {booking.source === 'broker_office' && booking.brokerMeta && (
          <>
            <div className="flex items-center justify-between text-slate-600">
              <span>الخصم الفعلي من محفظة الوكيل الإلكترونية:</span>
              <span className="font-mono font-bold text-[#8E1B32]">
                -{booking.brokerMeta.walletDebitAmount.toFixed(2)} ج.س
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>صافي نصيب شركة النقل الموردة:</span>
              <span className="font-mono font-bold text-slate-900">
                {(booking.totalAmount - booking.brokerMeta.accruedCommissionAmount).toFixed(2)} ج.س
              </span>
            </div>

            <div className="flex items-center justify-between text-emerald-800 font-semibold pt-1 border-t border-slate-200">
              <span>عمولة الوكيل التراكمية المستحقة (#W-44):</span>
              <span className="font-mono font-bold text-emerald-700">
                +{booking.brokerMeta.accruedCommissionAmount.toFixed(2)} ج.س
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
