import * as React from 'react';
import { useCarriers } from '../hooks/useCarriers';
import { CarriersMetricsCards } from '../components/CarriersMetricsCards';
import { CarriersFiltersToolbar } from '../components/CarriersFiltersToolbar';
import { CarriersTable } from '../components/CarriersTable';
import { AddCarrierModal } from '../components/AddCarrierModal';
import { carrierService } from '../services/carrierService';
import { mockCarriersMetrics } from '../fixtures/carrierFixtures';
import type { TransportCarrier, CarriersFilterState } from '../types/carrier';

export const CarriersListPage: React.FC = () => {
  const [filters, setFilters] = React.useState<CarriersFilterState>({
    searchQuery: '',
    status: 'all',
    state: 'all',
    activeTripsOnly: false,
    linkedBrokersOnly: false,
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading, refetch } = useCarriers(filters);
  const carriers = data?.carriers || [];
  const totalCount = data?.totalCount || 0;
  const filteredCount = data?.filteredCount || 0;
  const metrics = data?.metrics || mockCarriersMetrics;

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const handleFilterChange = (newFilters: Partial<CarriersFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      status: 'all',
      state: 'all',
      activeTripsOnly: false,
      linkedBrokersOnly: false,
      sortBy: 'name',
      sortOrder: 'asc',
      page: 1,
      pageSize: 10,
    });
  };

  const handleExportCsv = () => {
    carrierService.exportCarriersCsv(carriers);
  };

  const handleAddCarrier = async (carrierData: Partial<TransportCarrier>) => {
    await carrierService.addCarrier(carrierData as any);
    refetch();
  };

  return (
    <div className="p-6 max-w-[1560px] mx-auto w-full space-y-6 text-right" dir="rtl">
      {/* 4 Summary Metrics (Bento Style Cards) */}
      <CarriersMetricsCards metrics={metrics} />

      {/* Search & Filters Segment */}
      <CarriersFiltersToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onExportCsv={handleExportCsv}
        onRefresh={() => refetch()}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Companies Data Table */}
      <CarriersTable
        carriers={carriers}
        totalCount={totalCount}
        filteredCount={filteredCount}
        filters={filters}
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
      />

      {/* Corridor Summary Strip & Pending Requirements Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Corridor Performance (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl p-5 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#003B27] rounded-full" />
              <h3 className="text-sm font-bold text-slate-900">
                مؤشرات أداء ممرات النقل الحيوية بين المدن
              </h3>
            </div>
            <span className="text-xs text-slate-500">حركة الأسطول اليومية</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  01
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    ممر شريان الشمال (الخرطوم — شندي — عطبرة — بورتسودان)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    6 شركات مرخصة • 64 رحلة جارية الآن
                  </span>
                </div>
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-emerald-700 block">تشغيل عالي الكثافة</span>
                <span className="text-[11px] text-slate-500">متوسط السرعة 82 كم/س</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                  02
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    ممر طريق التحدي والصادرات (الخرطوم — كوستي — الأبيض)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    4 شركات مرخصة • 38 رحلة جارية الآن
                  </span>
                </div>
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-emerald-700 block">تشغيل منتظم</span>
                <span className="text-[11px] text-slate-500">متوسط السرعة 76 كم/س</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                  03
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    الممر الشمالي الدولي (الخرطوم — مروي — حلفا — أسوان)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    4 شركات مرخصة • 14 رحلة جارية الآن
                  </span>
                </div>
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-slate-700 block">إجراءات حدودية اعتيادية</span>
                <span className="text-[11px] text-slate-500">تأخير مجدول 45 دقيقة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Accreditation Widget (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
              <span className="material-symbols-outlined text-[#8E1B32] text-[20px]">
                verified_user
              </span>
              <h3 className="text-sm font-bold text-slate-900">متطلبات الاعتماد المعلقة</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              شركات تقدمت بطلب ترخيص أسطول جديد وتنتظر استكمال التحقق من وثائق التأمين والسجل التجاري.
            </p>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">شركة الأمانة لنقل الركاب</span>
                  <span className="text-[11px] text-slate-500">
                    فحص رخص قيادة الأسطول (14 حافلة)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-[#8E1B32] font-semibold text-[10px]">
                  بانتظار التأمين
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">مؤسسة الصحراء ترانس</span>
                  <span className="text-[11px] text-slate-500">معايرة أجهزة التتبع GPS</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold text-[10px]">
                  مراجعة تقنية
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">checklist</span>
              <span>الانتقال إلى سجل التراخيص والاعتماد (6)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Governance Note */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-start gap-3 text-xs">
        <span className="material-symbols-outlined text-emerald-800 text-[22px] shrink-0 mt-0.5">
          policy
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-900">
            إشعار حوكمة إدارة الكيانات التشغيلية في منصة ZoolGo
          </span>
          <p className="text-slate-600 leading-relaxed">
            تخضع كافة شركات النقل المسجلة في النظام للائحة السلامة والربط الرقمي الإلزامي لأجهزة
            التتبع عبر الأقمار الصناعية (AVL/GPS) وربط المحافظ الإلكترونية المباشرة لتسوية رسوم العبور
            والعمولات مع مكاتب الوسطاء والمسافرين. يتم تعليق صلاحيات إصدار التذاكر آلياً لأي أسطول
            يتوقف بث إشاراته الحية لأكثر من 3 ساعات متواصلة أثناء الرحلة.
          </p>
        </div>
      </div>

      {/* Add Carrier Modal */}
      <AddCarrierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCarrier}
      />
    </div>
  );
};
