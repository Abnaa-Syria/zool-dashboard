import * as React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useBroker, useTopUpBrokerWallet } from '../hooks/useBrokers';
import { BrokerOverviewTab } from '../components/BrokerOverviewTab';
import { BrokerCarriersStaffTab } from '../components/BrokerCarriersStaffTab';
import { BrokerWalletLedgerTab } from '../components/BrokerWalletLedgerTab';
import { TopUpWalletModal } from '../components/TopUpWalletModal';

export const BrokerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const { data: broker, isLoading, isError } = useBroker(id);
  const topUpMutation = useTopUpBrokerWallet();

  const [isTopUpOpen, setIsTopUpOpen] = React.useState(false);

  const handleSelectTab = (tab: 'overview' | 'staff' | 'ledger') => {
    setSearchParams({ tab });
  };

  const handleTopUpConfirm = async (
    amount: number,
    _paymentMethod: string,
    reference: string,
    notes?: string
  ) => {
    if (!broker) return;
    await topUpMutation.mutateAsync({
      brokerId: broker.id,
      amount,
      transactionRef: reference,
      notes,
    });
    setIsTopUpOpen(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-[1560px] mx-auto w-full text-center py-24 text-slate-500" dir="rtl">
        <span className="material-symbols-outlined text-[36px] animate-spin text-emerald-700">
          sync
        </span>
        <p className="text-xs mt-2 font-medium">جارٍ تحميل بيانات مكتب الوكيل المعتمد...</p>
      </div>
    );
  }

  if (isError || !broker) {
    return (
      <div className="p-8 max-w-[1560px] mx-auto w-full text-center py-20 text-slate-600" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#8E1B32] flex items-center justify-center mx-auto mb-3">
          <span className="material-symbols-outlined text-[32px]">storefront</span>
        </div>
        <h2 className="text-base font-bold text-slate-900">لم يتم العثور على مكتب الوكيل</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          قد يكون معرّف المكتب غير صحيح أو تم إلغاء اعتماده في المنظومة.
        </p>
        <Link
          to="/brokers"
          className="px-4 py-2 bg-[#003B27] text-white text-xs font-semibold rounded-lg hover:bg-[#002B1D] inline-flex items-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          <span>العودة إلى دليل مكاتب الوكلاء</span>
        </Link>
      </div>
    );
  }

  const isLowBalance = broker.isLowBalanceAlert || broker.walletBalance < 500;

  return (
    <div className="p-6 max-w-[1560px] mx-auto w-full space-y-6 text-right" dir="rtl">
      {/* Breadcrumb & Top Indicator */}
      <div className="flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Link
            to="/brokers"
            className="hover:text-emerald-800 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            <span>مكاتب الوكلاء</span>
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_left</span>
          <span className="text-slate-900 font-bold">
            {broker.name} ({broker.code})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
              isLowBalance
                ? 'bg-rose-50 text-[#8E1B32] border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLowBalance ? 'bg-[#8E1B32] animate-ping' : 'bg-emerald-600'
              }`}
            />
            <span>
              {isLowBalance ? 'تنبيه: رصيد المحفظة حرج (< 500 ج.س)' : 'حالة المحفظة: نشطة ومستقرة'}
            </span>
          </span>
        </div>
      </div>

      {/* Master Header Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 relative z-10">
          {/* Identity Block */}
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-16 h-16 rounded-xl bg-[#003B27] flex-shrink-0 flex items-center justify-center text-white shadow-md relative">
              <span className="material-symbols-outlined text-[36px]">storefront</span>
              <span className="absolute -bottom-1 -right-1 bg-emerald-700 text-white text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                {broker.code}
              </span>
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{broker.name}</h1>
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>{broker.statusLabel}</span>
                </span>
                <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {broker.branchName}
                </span>
              </div>

              <p className="text-xs text-slate-500 truncate">
                ترخيص: <span className="font-mono text-slate-800">{broker.licenseNumber}</span>{' '}
                <span className="text-slate-300 px-1">|</span> السجل التجاري:{' '}
                <span className="font-mono text-slate-800">
                  {broker.commercialRegistrationNumber}
                </span>{' '}
                <span className="text-slate-300 px-1">|</span> المدينة:{' '}
                <span className="text-slate-800 font-medium">
                  {broker.city} — {broker.state}
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">
                    person
                  </span>
                  المدير المسؤول: <strong className="text-slate-800">{broker.managerName}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  <span className="font-mono text-slate-800" dir="ltr">
                    {broker.managerPhone}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
                  نقاط البيع:{' '}
                  <span className="font-mono font-bold text-slate-800">{broker.posCount} POS</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Control Group */}
          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-start xl:justify-end">
            <button
              type="button"
              onClick={() => setIsTopUpOpen(true)}
              className="bg-[#8E1B32] hover:bg-[#6D001E] text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add_card</span>
              <span>شحن فوري للمحفظة</span>
            </button>
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
            onClick={() => handleSelectTab('staff')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTab === 'staff'
                ? 'bg-[#003B27] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">group</span>
            <span>الشركات والموظفون (POS)</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {broker.carrierLinks.length} شركات
            </span>
          </button>

          <button
            onClick={() => handleSelectTab('ledger')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTab === 'ledger'
                ? 'bg-[#003B27] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            <span>دفتر أستاذ المحفظة والعمولات</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {broker.walletBalance.toLocaleString()} ج.س
            </span>
          </button>

          <Link
            to={`/bookings?broker=${encodeURIComponent(broker.name)}`}
            className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
            <span>الحجوزات الصادرة للمكتب</span>
          </Link>
        </nav>
      </div>

      {/* Render Active Tab */}
      {currentTab === 'overview' && (
        <BrokerOverviewTab
          broker={broker}
          onTopUpClick={() => setIsTopUpOpen(true)}
          onSelectTab={handleSelectTab}
        />
      )}

      {currentTab === 'staff' && <BrokerCarriersStaffTab broker={broker} />}

      {currentTab === 'ledger' && (
        <BrokerWalletLedgerTab
          broker={broker}
          onTopUpClick={() => setIsTopUpOpen(true)}
        />
      )}

      {/* TopUp Modal */}
      <TopUpWalletModal
        isOpen={isTopUpOpen}
        broker={broker}
        onClose={() => setIsTopUpOpen(false)}
        onTopUp={handleTopUpConfirm}
      />
    </div>
  );
};
