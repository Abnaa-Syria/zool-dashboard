import React from 'react';
import { Link } from 'react-router-dom';
import type { Traveler } from '../types/traveler';

interface TravelersTableProps {
  travelers: Traveler[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  onOpenQuickDrawer: (traveler: Traveler) => void;
}

export const TravelersTable: React.FC<TravelersTableProps> = ({
  travelers,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onOpenQuickDrawer,
}) => {
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse select-text">
          <thead>
            <tr className="bg-surface-subtle text-primary-dark text-xs font-bold tracking-wider border-b border-border">
              <th className="py-3.5 px-4" scope="col">
                المسافر
              </th>
              <th className="py-3.5 px-3" scope="col">
                المعرف
              </th>
              <th className="py-3.5 px-3" scope="col">
                رقم الهاتف
              </th>
              <th className="py-3.5 px-3" scope="col">
                حالة توثيق الهوية
              </th>
              <th className="py-3.5 px-3" scope="col">
                إجمالي الرحلات
              </th>
              <th className="py-3.5 px-3 text-left" scope="col">
                إجمالي الإنفاق
              </th>
              <th className="py-3.5 px-3" scope="col">
                تاريخ التسجيل
              </th>
              <th className="py-3.5 px-3" scope="col">
                آخر نشاط
              </th>
              <th className="py-3.5 px-3 text-center" scope="col">
                حالة الحساب
              </th>
              <th className="py-3.5 px-4 text-left" scope="col">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm text-text-primary">
            {travelers.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-text-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[36px] text-text-muted">
                      group_off
                    </span>
                    <span className="font-semibold">لا توجد سجلات مطابقة للبحث أو الفلترة</span>
                    <span className="text-xs">جرب تعديل كلمات البحث أو مسح الفلاتر المحددة.</span>
                  </div>
                </td>
              </tr>
            ) : (
              travelers.map((traveler) => {
                const isSuspended = traveler.accountStatus === 'suspended';
                const isVerified = traveler.verificationStatus === 'verified';
                const isPending = traveler.verificationStatus === 'pending';
                const isRejected = traveler.verificationStatus === 'rejected';

                return (
                  <tr
                    key={traveler.id}
                    className={`hover:bg-surface-subtle/70 transition-colors group ${
                      isSuspended ? 'bg-red-50/40' : ''
                    }`}
                  >
                    {/* Passenger Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                            isSuspended
                              ? 'bg-red-100 text-red-800'
                              : traveler.loyaltyTier === 'platinum'
                              ? 'bg-[#0E5C3E] text-white'
                              : 'bg-surface-subtle text-primary-dark'
                          }`}
                        >
                          {traveler.avatarText}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/travelers/${traveler.id}`}
                              className="font-bold text-primary-dark hover:text-emerald-700 hover:underline transition-colors text-sm"
                            >
                              {traveler.fullName}
                            </Link>
                            {traveler.isOnline && (
                              <span
                                className="w-2 h-2 rounded-full bg-emerald-500"
                                title="متصل الآن"
                              />
                            )}
                            {traveler.loyaltyTier === 'platinum' && (
                              <span className="px-1.5 py-0.2 rounded bg-[#ffdadb] text-[#8a182f] text-[10px] font-bold">
                                VIP
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-text-muted truncate">
                            {traveler.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-surface-subtle text-xs text-text-primary font-mono font-semibold border border-border/50">
                        {traveler.id}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-xs text-text-primary dir-ltr text-right">
                      {traveler.phone}
                    </td>

                    {/* KYC Verification */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold w-max">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            <span>
                              {traveler.documentType === 'national_id'
                                ? 'موثق بالرقم الوطني'
                                : 'موثق بجواز السفر'}
                            </span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold w-max">
                            <span className="material-symbols-outlined text-[14px]">pending</span>
                            <span>بانتظار المراجعة</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-semibold w-max">
                            <span className="material-symbols-outlined text-[14px]">report</span>
                            <span>تطابق بيانات مرفوض</span>
                          </span>
                        )}
                        {!isVerified && !isPending && !isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold w-max">
                            <span>غير مسجل</span>
                          </span>
                        )}
                        <span className="text-[11px] text-text-muted font-mono">
                          {traveler.maskedNationalId}
                        </span>
                      </div>
                    </td>

                    {/* Total Trips */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-primary">
                          {traveler.totalTrips} رحلة
                        </span>
                        <span className="text-[11px] text-primary-dark font-medium">
                          {traveler.completedTrips} مكتملة
                          {traveler.activeTrips > 0 && ` • ${traveler.activeTrips} جارية`}
                          {traveler.cancelledTrips > 0 && ` • ${traveler.cancelledTrips} ملغاة`}
                        </span>
                      </div>
                    </td>

                    {/* Spend */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-left font-bold text-primary-dark tabular-nums">
                      {traveler.totalSpendSdg.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      <span className="text-xs font-normal text-text-muted">ج.س</span>
                    </td>

                    {/* Registration Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-xs text-text-muted">
                      {traveler.registrationDate}
                    </td>

                    {/* Last Activity */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-primary-dark">
                          {traveler.lastActivity.timestamp}
                        </span>
                        <span className="text-[11px] text-text-muted truncate max-w-[140px]">
                          {traveler.lastActivity.description}
                        </span>
                      </div>
                    </td>

                    {/* Account Status Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-center">
                      {traveler.accountStatus === 'active' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          نشط وموثق
                        </span>
                      )}
                      {traveler.accountStatus === 'suspended' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-bold border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                          معلق مؤقتاً
                        </span>
                      )}
                      {traveler.accountStatus === 'review' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          قيد المراجعة
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenQuickDrawer(traveler)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-subtle hover:bg-emerald-700 hover:text-white text-primary-dark text-xs font-semibold transition-colors border border-border"
                          title="نظرة سريعة"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          <span>معاينة</span>
                        </button>

                        <Link
                          to={`/travelers/${traveler.id}`}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-dark hover:bg-emerald-900 text-white text-xs font-semibold transition-colors shadow-xs"
                        >
                          <span>عرض الملف</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
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
            <strong className="text-text-primary">{total}</strong> مسافر
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(1)}
            className="w-8 h-8 rounded-lg bg-white border border-border text-text-muted hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="الصفحة الأولى"
          >
            <span className="material-symbols-outlined text-[18px]">first_page</span>
          </button>
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
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(totalPages)}
            className="w-8 h-8 rounded-lg bg-white border border-border text-text-muted hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="الصفحة الأخيرة"
          >
            <span className="material-symbols-outlined text-[18px]">last_page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
