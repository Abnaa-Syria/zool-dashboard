import * as React from 'react';
import { Link } from 'react-router-dom';
import type { TransportCarrier, CarriersFilterState } from '../types/carrier';

interface CarriersTableProps {
  carriers: TransportCarrier[];
  totalCount: number;
  filteredCount: number;
  filters: CarriersFilterState;
  onFilterChange: (newFilters: Partial<CarriersFilterState>) => void;
  isLoading?: boolean;
}

export const CarriersTable: React.FC<CarriersTableProps> = ({
  carriers,
  filteredCount,
  filters,
  onFilterChange,
  isLoading = false,
}) => {
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleOutsideClick = () => setOpenDropdownId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const totalPages = Math.max(1, Math.ceil(filteredCount / filters.pageSize));
  const currentPage = filters.page;

  const toggleSort = (field: CarriersFilterState['sortBy']) => {
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
                className="py-3 px-4 cursor-pointer hover:text-slate-900"
              >
                الشركة والاسم التجاري
              </th>
              <th className="py-3 px-4">المعرّف</th>
              <th className="py-3 px-4">نطاق التشغيل الرئيسي</th>
              <th
                onClick={() => toggleSort('routesCount')}
                className="py-3 px-4 text-center cursor-pointer hover:text-slate-900"
              >
                المسارات
              </th>
              <th
                onClick={() => toggleSort('activeTrips')}
                className="py-3 px-4 text-center cursor-pointer hover:text-slate-900"
              >
                الرحلات الجارية
              </th>
              <th
                onClick={() => toggleSort('fleetCount')}
                className="py-3 px-4 text-center cursor-pointer hover:text-slate-900"
              >
                الحافلات المتتبعة
              </th>
              <th className="py-3 px-4 text-center">الوسطاء</th>
              <th className="py-3 px-4 text-center">الحالة</th>
              <th className="py-3 px-4 text-left">الإجراءات</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-800">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={9} className="p-4">
                    <div className="h-6 bg-slate-100 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : carriers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  <span className="material-symbols-outlined text-3xl text-slate-300">departure_board</span>
                  <p className="mt-2 text-xs font-semibold">لم يتم العثور على شركات تطابق معايير البحث.</p>
                </td>
              </tr>
            ) : (
              carriers.map((carrier) => {
                const fleetRatio =
                  carrier.totalFleetCount > 0
                    ? Math.round((carrier.activeGpsBusesCount / carrier.totalFleetCount) * 100)
                    : 0;

                return (
                  <tr key={carrier.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Carrier Info & Logo */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-base shrink-0">
                          {carrier.logoSymbol}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Link
                            to={`/companies/${carrier.id}`}
                            className="font-bold text-slate-900 hover:text-emerald-800 hover:underline transition-colors text-sm"
                          >
                            {carrier.name}
                          </Link>
                          <span className="text-[11px] text-slate-500 truncate max-w-xs">
                            {carrier.commercialName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                        {carrier.code}
                      </span>
                    </td>

                    {/* Operating Corridors */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 flex-wrap max-w-xs">
                        {carrier.operatingCorridors.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Routes count */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                      {carrier.totalRoutesCount}
                    </td>

                    {/* Active Trips Now */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-[11px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        <span>{carrier.activeTripsNowCount} رحلة</span>
                      </span>
                    </td>

                    {/* Tracked Buses Ratio */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {carrier.activeGpsBusesCount}{' '}
                          <span className="text-slate-400 font-normal">/ {carrier.totalFleetCount}</span>
                        </span>
                        <div className="w-16 bg-slate-100 rounded-full h-1 mt-1">
                          <div
                            className="bg-emerald-600 h-1 rounded-full"
                            style={{ width: `${fleetRatio}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Linked Brokers */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs">
                        {carrier.linkedBrokersCount} مكتب
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          carrier.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : carrier.status === 'under_review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {carrier.statusLabel}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-left whitespace-nowrap relative">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/companies/${carrier.id}`}
                          className="px-3 py-1 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <span>عرض الملف</span>
                          <span className="material-symbols-outlined text-sm">arrow_back</span>
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === carrier.id ? null : carrier.id);
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                      </div>

                      {openDropdownId === carrier.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute left-4 top-10 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-30 text-right flex flex-col text-xs"
                        >
                          <Link
                            to={`/companies/${carrier.id}?tab=routes`}
                            className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                          >
                            <span className="material-symbols-outlined text-base text-emerald-700">alt_route</span>
                            <span>عرض المسارات والرحلات</span>
                          </Link>
                          <Link
                            to={`/tracking?carrier=${carrier.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                          >
                            <span className="material-symbols-outlined text-base text-emerald-700">fmd_good</span>
                            <span>الأسطول على الخريطة الحية</span>
                          </Link>
                          <Link
                            to={`/companies/${carrier.id}?tab=brokers`}
                            className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                          >
                            <span className="material-symbols-outlined text-base text-slate-500">storefront</span>
                            <span>الوسطاء ونسب العمولات</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(carrier.code);
                              setOpenDropdownId(null);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:bg-slate-50 w-full text-right"
                          >
                            <span className="material-symbols-outlined text-base">content_copy</span>
                            <span>نسخ رمز الشركة ({carrier.code})</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-500">
          عرض {carriers.length} من أصل {filteredCount} شركة ناقلة مسجلة
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onFilterChange({ page: currentPage - 1 })}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            السابق
          </button>
          <span className="px-3 py-1 font-semibold text-slate-800 font-mono">
            صفحة {currentPage} من {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onFilterChange({ page: currentPage + 1 })}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
};
