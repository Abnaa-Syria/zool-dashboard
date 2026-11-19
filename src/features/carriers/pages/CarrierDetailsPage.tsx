import * as React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useCarrier, useAssignBrokerToCarrier } from '../hooks/useCarriers';
import { CarrierOverviewTab } from '../components/CarrierOverviewTab';
import { CarrierRoutesFleetTab } from '../components/CarrierRoutesFleetTab';
import { CarrierBrokersCommissionsTab } from '../components/CarrierBrokersCommissionsTab';

export const CarrierDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const { data: carrier, isLoading, isError } = useCarrier(id);
  const assignBrokerMutation = useAssignBrokerToCarrier();

  const handleSelectTab = (tab: 'overview' | 'routes' | 'brokers') => {
    setSearchParams({ tab });
  };

  const handleAssignBroker = async (params: {
    brokerId: string;
    brokerName: string;
    commissionRatePercent: number;
    authorizedRoutesCount: number;
  }) => {
    if (!carrier) return;
    await assignBrokerMutation.mutateAsync({
      carrierId: carrier.id,
      assignment: {
        brokerId: params.brokerId,
        brokerName: params.brokerName,
        brokerBranch: 'الخرطوم — الميناء البري',
        commissionRatePercent: params.commissionRatePercent,
        authorizedRoutesCount: params.authorizedRoutesCount,
        status: 'active',
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-[1560px] mx-auto w-full text-center py-24 text-slate-500" dir="rtl">
        <span className="material-symbols-outlined text-[36px] animate-spin text-emerald-700">
          sync
        </span>
        <p className="text-xs mt-2 font-medium">جارٍ تحميل بيانات شركة النقل المعتمدة...</p>
      </div>
    );
  }

  if (isError || !carrier) {
    return (
      <div className="p-8 max-w-[1560px] mx-auto w-full text-center py-20 text-slate-600" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#8E1B32] flex items-center justify-center mx-auto mb-3">
          <span className="material-symbols-outlined text-[32px]">domain_disabled</span>
        </div>
        <h2 className="text-base font-bold text-slate-900">لم يتم العثور على شركة النقل</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          قد يكون معرّف الشركة غير صحيح أو تم تعليق تسجيلها في المنظومة.
        </p>
        <Link
          to="/companies"
          className="px-4 py-2 bg-[#003B27] text-white text-xs font-semibold rounded-lg hover:bg-[#002B1D] inline-flex items-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          <span>العودة إلى دليل شركات النقل</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1560px] mx-auto w-full space-y-6 text-right" dir="rtl">
      {/* Breadcrumb & Top Indicator */}
      <div className="flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Link
            to="/companies"
            className="hover:text-emerald-800 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">directions_bus</span>
            <span>شركات النقل</span>
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_left</span>
          <span className="text-slate-900 font-bold">
            {carrier.name} ({carrier.code})
          </span>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full text-xs font-semibold text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>بث الإشارات الميدانية: مستقر</span>
        </div>
      </div>

      {/* Master Header Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 relative z-10">
          {/* Identity Block */}
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-16 h-16 rounded-xl bg-[#003B27] flex-shrink-0 flex items-center justify-center text-white shadow-md relative">
              <span className="material-symbols-outlined text-[36px]">water_drop</span>
              <span className="absolute -bottom-1 -right-1 bg-emerald-700 text-white text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                {carrier.code}
              </span>
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{carrier.name}</h1>
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>{carrier.statusLabel}</span>
                </span>
                <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {carrier.operatingCorridors.join(' • ')}
                </span>
              </div>

              <p className="text-xs text-slate-500 truncate">
                {carrier.commercialName}{' '}
                <span className="text-slate-300 px-1">|</span> السجل التجاري:{' '}
                <span className="font-mono font-semibold text-slate-800">
                  {carrier.commercialRegistrationNumber}
                </span>{' '}
                <span className="text-slate-300 px-1">|</span> الرقم الضريبي:{' '}
                <span className="font-mono font-semibold text-slate-800">
                  {carrier.taxIdentificationNumber}
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">badge</span>
                  معرّف النظام: <strong className="text-slate-800 font-mono">{carrier.code}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  المقر: <span className="text-slate-800 font-medium">{carrier.city}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  <span className="font-mono text-slate-800" dir="ltr">{carrier.phone}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Control Group */}
          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-start xl:justify-end">
            <button
              type="button"
              onClick={() => handleSelectTab('routes')}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">alt_route</span>
              <span>عرض المسارات والأسطول ({carrier.totalFleetCount})</span>
            </button>

            <Link
              to={`/tracking?carrier=${encodeURIComponent(carrier.code)}`}
              className="bg-[#003B27] hover:bg-[#002B1D] text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">fmd_good</span>
              <span>عرض الحافلات على الخريطة ({carrier.activeGpsBusesCount} حية)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Central Navigation Tabs Bar */}
      <div className="bg-white rounded-xl p-1.5 shadow-sm border border-slate-100 overflow-x-auto">
        <nav className="flex items-center gap-1 min-w-max">
          <button
            onClick={() => handleSelectTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTab === 'overview'
                ? 'bg-[#003B27] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>نظرة عامة والاعتماد</span>
          </button>

          <button
            onClick={() => handleSelectTab('routes')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTab === 'routes'
                ? 'bg-[#003B27] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">alt_route</span>
            <span>المسارات والأسطول المباشر</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {carrier.totalRoutesCount}
            </span>
          </button>

          <button
            onClick={() => handleSelectTab('brokers')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTab === 'brokers'
                ? 'bg-[#003B27] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">handshake</span>
            <span>الوسطاء والعمولات</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {carrier.linkedBrokersCount} مكتب
            </span>
          </button>

          <Link
            to={`/bookings?carrier=${encodeURIComponent(carrier.name)}`}
            className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
            <span>الحجوزات والتذاكر الصادرة</span>
          </Link>
        </nav>
      </div>

      {/* Render Active Tab */}
      {currentTab === 'overview' && (
        <CarrierOverviewTab
          carrier={carrier}
          onSelectTab={(tabId) => handleSelectTab(tabId)}
        />
      )}

      {currentTab === 'routes' && <CarrierRoutesFleetTab carrier={carrier} />}

      {currentTab === 'brokers' && (
        <CarrierBrokersCommissionsTab
          carrier={carrier}
          onAssignBroker={handleAssignBroker}
        />
      )}
    </div>
  );
};
