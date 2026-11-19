import React from 'react';
import { Link } from 'react-router-dom';
import type { BrokerWalletSummary } from '../types/financials';

interface WalletsTableProps {
  wallets: BrokerWalletSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  onOpenDepositModal: (wallet: BrokerWalletSummary) => void;
}

export const WalletsTable: React.FC<WalletsTableProps> = ({
  wallets,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onOpenDepositModal,
}) => {
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse select-text">
          <thead>
            <tr className="bg-surface-subtle text-primary-dark text-xs font-bold tracking-wider border-b border-border">
              <th className="py-3 px-4" scope="col">
                مكتب السفر والوكيل
              </th>
              <th className="py-3 px-3" scope="col">
                رمز الاعتماد
              </th>
              <th className="py-3 px-3" scope="col">
                المدينة والمقر
              </th>
              <th className="py-3 px-3" scope="col">
                رصيد المحفظة الفعلي
              </th>
              <th className="py-3 px-3" scope="col">
                حالة حد الأمان
              </th>
              <th className="py-3 px-3" scope="col">
                متوسط السحب اليومي
              </th>
              <th className="py-3 px-3" scope="col">
                تذاكر اليوم
              </th>
              <th className="py-3 px-3" scope="col">
                آخر شحن رصيد
              </th>
              <th className="py-3 px-4 text-center" scope="col">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs text-text-primary">
            {wallets.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-text-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[36px] text-text-muted">
                      account_balance_wallet
                    </span>
                    <span className="font-semibold text-sm">لا توجد محافظ مطابقة للبحث أو الفلترة</span>
                    <span className="text-xs">جرب تعديل شروط الفلترة أو إعادة ضبط الفلاتر.</span>
                  </div>
                </td>
              </tr>
            ) : (
              wallets.map((wallet) => {
                const isCritical = wallet.status === 'critical';
                const isHalted = wallet.status === 'halted';

                return (
                  <tr
                    key={wallet.brokerId}
                    className={`hover:bg-surface-subtle/70 transition-colors ${
                      isHalted ? 'bg-red-50/60' : isCritical ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    {/* Agency & Account */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                            isHalted
                              ? 'bg-red-100 text-red-800'
                              : isCritical
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-primary-dark'
                          }`}
                        >
                          {wallet.brokerName[0]}
                        </div>
                        <div className="flex flex-col">
                          <Link
                            to={`/brokers/${wallet.brokerId}`}
                            className="font-bold text-primary-dark hover:underline text-xs"
                          >
                            {wallet.brokerName}
                          </Link>
                          <span className="text-[11px] text-text-muted font-mono">
                            {wallet.bankAccountRef}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-mono font-bold text-text-primary border border-border/50">
                        {wallet.brokerId}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-text-muted">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span>{wallet.locationArea}</span>
                      </div>
                    </td>

                    {/* Current Balance */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-primary-dark tabular-nums">
                          {wallet.currentBalanceSdg.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          <span className="text-xs font-normal text-text-muted">ج.س</span>
                        </span>
                        <span className="text-[10px] text-text-muted">
                          سقف السحب:{' '}
                          {wallet.creditLimitSdg.toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                          })}{' '}
                          ج.س
                        </span>
                      </div>
                    </td>

                    {/* Safety Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {wallet.status === 'safe' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          آمن ومستقر
                        </span>
                      )}
                      {wallet.status === 'critical' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                          خط الخطر (&lt; 500)
                        </span>
                      )}
                      {wallet.status === 'halted' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-800 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                          حجز متوقف
                        </span>
                      )}
                    </td>

                    {/* Daily Avg Spend */}
                    <td className="py-3 px-3 whitespace-nowrap tabular-nums text-text-muted">
                      {wallet.dailyAvgSpendSdg.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      ج.س
                    </td>

                    {/* Today Tickets */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-bold text-primary-dark">
                        <span className="tabular-nums">{wallet.todayTicketsCount}</span>
                        <span className="text-[10px] font-normal text-text-muted">تذكرة</span>
                      </div>
                    </td>

                    {/* Last Top Up */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{wallet.lastTopUpDate}</span>
                        <span className="text-[11px] text-emerald-700 font-mono font-bold">
                          +{wallet.lastTopUpAmountSdg.toLocaleString('en-US')} ج.س
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          to={`/financials/ledger?brokerId=${wallet.brokerId}`}
                          className="px-2.5 py-1 rounded-lg bg-surface-subtle text-primary-dark hover:bg-emerald-50 transition-colors font-semibold border border-border"
                          title="فحص كشف الحساب والقيود المالية"
                        >
                          فحص القيود
                        </Link>
                        <button
                          type="button"
                          onClick={() => onOpenDepositModal(wallet)}
                          className="px-2.5 py-1 rounded-lg bg-primary-dark text-white hover:bg-emerald-900 transition-colors font-semibold shadow-xs"
                          title="إيداع وشحن رصيد استثنائي"
                        >
                          شحن رصيد
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-4 bg-surface-subtle flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border text-xs text-text-muted">
        <div className="flex items-center gap-3">
          <span>عدد السجلات لكل صفحة:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 px-2 rounded-lg bg-white text-text-primary border border-border focus:outline-none focus:ring-1 focus:ring-primary-dark cursor-pointer font-semibold"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span className="text-border">|</span>
          <span>
            عرض <strong className="text-text-primary">{startIdx} - {endIdx}</strong> من إجمالي{' '}
            <strong className="text-text-primary">{total}</strong> محفظة
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="w-8 h-8 rounded-lg bg-white border border-border text-text-muted hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="السابق"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>

          <span className="px-3 py-1 bg-primary-dark text-white font-bold rounded-lg text-xs">
            {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="w-8 h-8 rounded-lg bg-white border border-border text-text-muted hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="التالي"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
        </div>
      </div>
    </div>
  );
};
