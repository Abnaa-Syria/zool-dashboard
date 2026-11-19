import * as React from 'react';
import { Link } from 'react-router-dom';
import type { BrokerOffice, BrokersFilterState } from '../types/broker';

interface BrokersTableProps {
  brokers: BrokerOffice[];
  totalCount: number;
  filteredCount: number;
  filters: BrokersFilterState;
  onFilterChange: (newFilters: Partial<BrokersFilterState>) => void;
  onTopUpClick?: (broker: BrokerOffice) => void;
  isLoading?: boolean;
}

export const BrokersTable: React.FC<BrokersTableProps> = ({
  brokers,
  filteredCount,
  filters,
  onFilterChange,
  onTopUpClick,
  isLoading = false,
}) => {
  const totalPages = Math.max(1, Math.ceil(filteredCount / filters.pageSize));
  const currentPage = filters.page;

  const toggleSort = (field: BrokersFilterState['sortBy']) => {
    if (filters.sortBy === field) {
      onFilterChange({
        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
        page: 1,
      });
    } else {
      onFilterChange({
        sortBy: field,
        sortOrder: 'desc',
        page: 1,
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      <div className="overflow-x-auto min-h-[360px]">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <th
                onClick={() => toggleSort('name')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
              >
                مكتب الوكيل المعتمد والفرع
              </th>
              <th className="py-3.5 px-4">رمز الاعتماد</th>
              <th
                onClick={() => toggleSort('walletBalance')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
              >
                رصيد المحفظة الفعلي
              </th>
              <th className="py-3.5 px-4">العمولة غير المسواة (#W-44)</th>
              <th
                onClick={() => toggleSort('todaySales')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
              >
                مبيعات اليوم
              </th>
              <th className="py-3.5 px-4">الشركات المصرحة</th>
              <th
                onClick={() => toggleSort('clerksCount')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 text-center"
              >
                الموظفون و POS
              </th>
              <th className="py-3.5 px-4">الحالة</th>
              <th className="py-3.5 px-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-slate-400">
                  <span className="material-symbols-outlined text-[28px] animate-spin text-emerald-700">
                    sync
                  </span>
                  <p className="mt-2 text-xs font-medium">جارٍ تحميل بيانات مكاتب الوسطاء...</p>
                </td>
              </tr>
            ) : brokers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-slate-400">
                  <span className="material-symbols-outlined text-[36px] text-slate-300">
                    storefront
                  </span>
                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    لا توجد مكاتب وسطاء مطابقة لمعايير البحث
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    جرّب تعديل الفلاتر أو مسح معايير البحث
                  </p>
                </td>
              </tr>
            ) : (
              brokers.map((broker) => {
                const isLowBalance = broker.isLowBalanceAlert || broker.walletBalance < 500;

                return (
                  <tr
                    key={broker.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isLowBalance ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    {/* Office Name & Branch */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isLowBalance
                              ? 'bg-rose-100 text-[#8E1B32]'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">storefront</span>
                        </div>
                        <div>
                          <Link
                            to={`/brokers/${broker.id}`}
                            className="font-bold text-slate-900 hover:text-emerald-800 block hover:underline"
                          >
                            {broker.name}
                          </Link>
                          <span className="text-[11px] text-slate-500">
                            {broker.branchName} • {broker.city}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Accreditation Code */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded">
                        {broker.code}
                      </span>
                    </td>

                    {/* Available Wallet Balance */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`font-mono text-sm font-bold ${
                            isLowBalance ? 'text-[#8E1B32]' : 'text-slate-900'
                          }`}
                        >
                          {broker.walletBalance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400">ج.س</span>
                      </div>
                      {isLowBalance && (
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-[#8E1B32] mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8E1B32] animate-ping" />
                          <span>تنبيه رصيد منخفض (&lt; 500)</span>
                        </div>
                      )}
                    </td>

                    {/* Unsettled Commission */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-xs font-bold text-emerald-700">
                          +{broker.unsettledAccruedCommissionSdg.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">ج.س</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {broker.activeSettlementCycle}
                      </span>
                    </td>

                    {/* Today's Sales */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        {broker.todaySalesSdg.toLocaleString()} ج.س
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {broker.todayTicketsCount} تذكرة
                      </span>
                    </td>

                    {/* Authorized Carriers */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 flex-wrap max-w-[180px]">
                        {broker.carrierLinks.slice(0, 2).map((link) => (
                          <span
                            key={link.carrierId}
                            className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium truncate max-w-[90px]"
                            title={link.carrierName}
                          >
                            {link.carrierName}
                          </span>
                        ))}
                        {broker.carrierLinks.length > 2 && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                            +{broker.carrierLinks.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Staff & POS */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-800 text-xs">
                        {broker.clerksCount}
                      </span>{' '}
                      <span className="text-slate-400 text-[10px]">موظفين</span>
                      <span className="text-slate-300 mx-1">|</span>
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        {broker.posCount}
                      </span>{' '}
                      <span className="text-slate-400 text-[10px]">POS</span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          broker.status === 'active'
                            ? isLowBalance
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            broker.status === 'active'
                              ? isLowBalance
                                ? 'bg-amber-600'
                                : 'bg-emerald-600'
                              : 'bg-slate-500'
                          }`}
                        />
                        <span>
                          {broker.status === 'active'
                            ? isLowBalance
                              ? 'يحتاج شحن'
                              : 'معتمد ونشط'
                            : 'موقوف مؤقتاً'}
                        </span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {onTopUpClick && (
                          <button
                            type="button"
                            onClick={() => onTopUpClick(broker)}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="شحن فوري للمحفظة"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              add_card
                            </span>
                          </button>
                        )}
                        <Link
                          to={`/brokers/${broker.id}`}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <span>عرض</span>
                          <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                        </Link>
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
      <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          إظهار <strong>{brokers.length}</strong> من إجمالي <strong>{filteredCount}</strong> مكتب
          وسيط
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onFilterChange({ page: Math.max(1, currentPage - 1) })}
            disabled={currentPage <= 1}
            className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>

          <span className="px-2 font-mono text-xs">
            صفحة {currentPage} من {totalPages}
          </span>

          <button
            onClick={() => onFilterChange({ page: Math.min(totalPages, currentPage + 1) })}
            disabled={currentPage >= totalPages}
            className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
        </div>
      </div>
    </div>
  );
};
