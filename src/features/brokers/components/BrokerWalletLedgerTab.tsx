import * as React from 'react';
import type { BrokerOffice, BrokerWalletTransaction } from '../types/broker';

interface BrokerWalletLedgerTabProps {
  broker: BrokerOffice;
  onTopUpClick: () => void;
}

export const BrokerWalletLedgerTab: React.FC<BrokerWalletLedgerTabProps> = ({
  broker,
  onTopUpClick,
}) => {
  const [filterType, setFilterType] = React.useState<string>('all');
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  const transactions = broker.walletLedger || [];

  const filteredTransactions = transactions.filter((txn) => {
    if (filterType !== 'all' && txn.type !== filterType) {
      return false;
    }
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase().trim();
      return (
        txn.id.toLowerCase().includes(q) ||
        (txn.relatedReference && txn.relatedReference.toLowerCase().includes(q)) ||
        txn.executedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* CRITICAL FINANCIAL SEPARATION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Available Float Balance Card */}
        <div className="lg:col-span-6 bg-[#003B27] text-white rounded-xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded bg-white/10 text-emerald-200">
                  <span className="material-symbols-outlined text-[18px]">
                    account_balance_wallet
                  </span>
                </span>
                <span className="text-xs font-semibold text-emerald-200">
                  رصيد المحفظة الفعلي المتاح (Available Float)
                </span>
              </div>
              <span className="text-[11px] text-emerald-300">
                المبلغ النقدي المودع مسبقاً لخصم قيمة التذاكر لحظياً
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 text-[10px] font-semibold">
              رصيد تشغيلي مباشر
            </span>
          </div>

          <div className="my-3 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold tracking-tight">
                {broker.walletBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-sm font-semibold text-emerald-200">ج.س</span>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-200 relative z-10">
            <span>حد التنبيه للرصيد الأدنى: 500.00 ج.س</span>
            <button
              onClick={onTopUpClick}
              className="px-3.5 py-1.5 rounded-lg bg-[#8E1B32] hover:bg-[#6D001E] text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>شحن فوري</span>
            </button>
          </div>
        </div>

        {/* Unsettled Accumulated Broker Commission Card */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded bg-emerald-50 text-emerald-800">
                  <span className="material-symbols-outlined text-[18px]">percent</span>
                </span>
                <span className="text-xs font-semibold text-slate-900">
                  العمولة التراكمية غير المسواة (Accrued Commission)
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                إجمالي استحقاقات عمولة التذاكر المصدرة خلال الدورة الجارية
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
              {broker.activeSettlementCycle}
            </span>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-bold text-emerald-700">
                +{broker.unsettledAccruedCommissionSdg.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-xs text-slate-400 font-semibold">ج.س</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>تُسوّى آلياً بإشعار أسبوعي إلى حساب الوكالة البنكي</span>
            <span className="text-emerald-700 font-medium">غير مدمجة في الرصيد التشغيلي</span>
          </div>
        </div>
      </div>

      {/* High-Density Ledger Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#003B27] rounded-full" />
            <h2 className="text-sm font-bold text-slate-900">
              دفتر أستاذ المحفظة المالية وسجل الحركات اللحظية
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث برقم الحركة، الحجز، أو المنفذ..."
                className="w-56 h-9 pr-8 pl-3 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-700"
              />
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                search
              </span>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-9 px-3 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-700 cursor-pointer"
            >
              <option value="all">كافة أنواع الحركات</option>
              <option value="booking_debit">خصم حجز تذكرة</option>
              <option value="prepaid_topup">إيداع وشحن رصيد</option>
              <option value="refund_credit">استرداد حجز ملغي</option>
              <option value="commission_payout">صرف عمولة دورية</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">رقم الحركة</th>
                <th className="py-3 px-4">التاريخ والوقت</th>
                <th className="py-3 px-4">نوع الحركة</th>
                <th className="py-3 px-4">المبلغ (ج.س)</th>
                <th className="py-3 px-4">الرصيد بعد الحركة</th>
                <th className="py-3 px-4">المرجع المرتبط</th>
                <th className="py-3 px-4">المنفّذ المسؤول</th>
                <th className="py-3 px-4">ملاحظات وبيان العملية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    لا توجد حركات مالية مطابقة للبحث المحدد
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn: BrokerWalletTransaction) => {
                  const isCredit = txn.direction === 'credit';

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{txn.id}</td>
                      <td className="py-3 px-4 text-slate-600">{txn.timestamp}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            txn.type === 'prepaid_topup'
                              ? 'bg-emerald-100 text-emerald-800'
                              : txn.type === 'booking_debit'
                                ? 'bg-slate-100 text-slate-800'
                                : txn.type === 'refund_credit'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCredit ? 'bg-emerald-600' : 'bg-slate-600'
                            }`}
                          />
                          <span>{txn.typeLabel}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isCredit ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isCredit ? '+' : '-'}
                          {txn.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {txn.balanceAfter.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {txn.relatedReference || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{txn.executedBy}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{txn.notes || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
