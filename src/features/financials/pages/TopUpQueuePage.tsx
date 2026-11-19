import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTopUpQueue, useWallets } from '../hooks/useFinancials';
import { WalletDepositModal } from '../components/WalletDepositModal';
import type { TopUpRequest } from '../types/financials';

export const TopUpQueuePage: React.FC = () => {
  const { queue, approveRequest, rejectRequest, refresh } = useTopUpQueue();
  const { recordTopUp, wallets } = useWallets();

  const [selectedRequest, setSelectedRequest] = useState<TopUpRequest | null>(
    queue.find((q) => q.status === 'pending') || queue[0] || null
  );
  const [filterText, setFilterText] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const pendingRequests = queue.filter((r) => r.status === 'pending');
  const filteredQueue = queue.filter((r) => {
    if (!filterText) return true;
    const lower = filterText.toLowerCase();
    return (
      r.brokerName.toLowerCase().includes(lower) ||
      r.brokerId.toLowerCase().includes(lower) ||
      r.bankReferenceNumber.toLowerCase().includes(lower) ||
      r.id.toLowerCase().includes(lower)
    );
  });

  const handleApprove = (req: TopUpRequest) => {
    approveRequest(req.id, 'أحمد السر');
    setActionSuccessMessage(`تم اعتماد شحن رصيد ${req.brokerName} بنجاح بمبلغ ${req.amountSdg.toLocaleString()} ج.س`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
    // select next pending if available
    const nextPending = pendingRequests.find((p) => p.id !== req.id);
    setSelectedRequest(nextPending || null);
  };

  const handleConfirmReject = () => {
    if (!selectedRequest) return;
    rejectRequest(selectedRequest.id, rejectReason || 'عدم تطابق إشعار التحويل البنكي');
    setIsRejectModalOpen(false);
    setRejectReason('');
    setActionSuccessMessage(`تم رفض طلب شحن ${selectedRequest.brokerName}`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
    const nextPending = pendingRequests.find((p) => p.id !== selectedRequest.id);
    setSelectedRequest(nextPending || null);
  };

  const getChannelBadge = (channel: TopUpRequest['channel']) => {
    switch (channel) {
      case 'bankak':
        return (
          <div className="flex items-center gap-1.5 text-on-surface">
            <span className="material-symbols-outlined text-secondary text-[18px]">account_balance</span>
            <span className="font-medium">تحويل بنكك</span>
          </div>
        );
      case 'sadad':
        return (
          <div className="flex items-center gap-1.5 text-on-surface">
            <span className="material-symbols-outlined text-tertiary text-[18px]">credit_card</span>
            <span className="font-medium">سداد الإلكتروني</span>
          </div>
        );
      case 'fauwr':
        return (
          <div className="flex items-center gap-1.5 text-on-surface">
            <span className="material-symbols-outlined text-primary text-[18px]">flash_on</span>
            <span className="font-medium">فوري المصرفي</span>
          </div>
        );
      case 'cash_deposit':
        return (
          <div className="flex items-center gap-1.5 text-on-surface">
            <span className="material-symbols-outlined text-tertiary text-[18px]">payments</span>
            <span className="font-medium">إيداع نقدي مباشر</span>
          </div>
        );
      default:
        return <span>{channel}</span>;
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg p-space-lg">
      {/* 1. Breadcrumbs & Header */}
      <div className="flex flex-col gap-space-xs">
        <nav className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
          <Link to="/overview" className="hover:text-secondary transition-colors">
            الرئيسية والعمليات
          </Link>
          <span className="material-symbols-outlined text-[14px] text-outline rotate-180">
            chevron_left
          </span>
          <Link to="/financials/wallets" className="hover:text-secondary transition-colors">
            المالية والتسويات
          </Link>
          <span className="material-symbols-outlined text-[14px] text-outline rotate-180">
            chevron_left
          </span>
          <Link to="/financials/wallets" className="hover:text-secondary transition-colors">
            المحافظ والمعاملات المالية
          </Link>
          <span className="material-symbols-outlined text-[14px] text-outline rotate-180">
            chevron_left
          </span>
          <span className="text-tertiary font-bold">طابور مراجعة الحوالات البنكية</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-space-md mt-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display-md text-display-md text-on-surface tracking-tight font-bold">
              طلبات شحن المحافظ والتحقق البنكي
            </h1>
            <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span>{pendingRequests.length} طلبات بانتظار المطابقة</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refresh()}
              className="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-secondary hover:bg-surface-container-low transition-colors font-label-lg text-label-lg shadow-sm border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-[18px]">cached</span>
              <span>تحديث طابور المراجعة</span>
            </button>
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors font-label-lg text-label-lg shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ تسجيل إيداع يدوي فوري</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="p-3 bg-secondary-fixed/50 text-secondary border border-secondary rounded-xl flex items-center gap-2 font-label-lg text-label-lg animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* 2. Metric Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between border border-surface-container-high">
          <div className="flex flex-col gap-1">
            <span className="font-label-md text-label-md text-on-surface-variant">طلبات قيد الانتظار</span>
            <div className="flex items-baseline gap-2">
              <span className="font-tabular-stat text-tabular-stat text-primary font-bold">
                {pendingRequests.length}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">
                (إجمالي: 85,000 ج.س)
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
              تتطلب مطابقة الإشعار البنكي
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
            <span className="material-symbols-outlined text-[24px]">pending_actions</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between border border-surface-container-high">
          <div className="flex flex-col gap-1">
            <span className="font-label-md text-label-md text-on-surface-variant">حوالات معتمدة اليوم</span>
            <div className="flex items-baseline gap-2">
              <span className="font-tabular-stat text-tabular-stat text-tertiary font-bold">28</span>
              <span className="font-label-md text-label-md text-secondary">+14.2% عن الأمس</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              القيمة: 1,420,500 ج.س
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between border border-surface-container-high">
          <div className="flex flex-col gap-1">
            <span className="font-label-md text-label-md text-on-surface-variant">حوالات مرفوضة</span>
            <div className="flex items-baseline gap-2">
              <span className="font-tabular-stat text-tabular-stat text-on-surface font-bold">0</span>
              <span className="font-label-md text-label-md text-secondary">سجل نظيف اليوم</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              انعدام محاولات الاحتيال
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-[24px]">cancel</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between border border-surface-container-high">
          <div className="flex flex-col gap-1">
            <span className="font-label-md text-label-md text-on-surface-variant">متوسط وقت المراجعة</span>
            <div className="flex items-baseline gap-2">
              <span className="font-tabular-stat text-tabular-stat text-tertiary font-bold">8 دقائق</span>
              <span className="font-label-md text-label-md text-secondary">-3 دقائق تحسن</span>
            </div>
            <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              تفعيل المطابقة التلقائية API
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
            <span className="material-symbols-outlined text-[24px]">timer</span>
          </div>
        </div>
      </div>

      {/* 3. Main Workflow Workspace (Split View with Drawer Active) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start relative w-full">
        {/* Queue Data Table (8 Cols) */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden min-w-0 border border-surface-container-high">
          {/* Table Filters & Toolbar */}
          <div className="p-space-md bg-surface-container-low flex flex-wrap items-center justify-between gap-space-md border-b border-surface-container-high">
            <div className="flex items-center gap-space-sm flex-1 max-w-md">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  filter_list
                </span>
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="تصفية حسب اسم الوكالة أو رقم الإشعار..."
                  className="w-full h-9 pr-9 pl-4 bg-surface-container-lowest rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container-high"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 font-label-md text-label-md">
              <span className="text-on-surface-variant">ترتيب: الأحدث أولاً</span>
            </div>
          </div>

          {/* High-density Queue Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">
                  <th className="py-3 px-space-md font-medium">اسم الوكيل والكود</th>
                  <th className="py-3 px-space-md font-medium">المبلغ المطلوب</th>
                  <th className="py-3 px-space-md font-medium">قناة الإيداع</th>
                  <th className="py-3 px-space-md font-medium">الرقم المرجعي للإشعار</th>
                  <th className="py-3 px-space-md font-medium">حالة المراجعة</th>
                  <th className="py-3 px-space-md font-medium text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low font-body-md text-body-md">
                {filteredQueue.map((req) => {
                  const isSelected = selectedRequest?.id === req.id;
                  const isPending = req.status === 'pending';
                  return (
                    <tr
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-secondary-fixed/30 hover:bg-secondary-fixed/40'
                          : 'hover:bg-surface-container-low/60'
                      }`}
                    >
                      <td className="py-3.5 px-space-md">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-tertiary text-on-tertiary flex items-center justify-center font-bold text-label-sm">
                            {req.brokerName.slice(0, 1)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-label-lg text-label-lg text-tertiary font-bold">
                              {req.brokerName}
                            </span>
                            <span className="font-body-sm text-body-sm text-secondary font-mono">
                              {req.brokerId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-space-md font-tabular-stat text-tabular-stat text-on-surface font-bold">
                        {req.amountSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                        <span className="font-label-md text-label-md text-on-surface-variant font-normal">
                          ج.س
                        </span>
                      </td>
                      <td className="py-3.5 px-space-md">{getChannelBadge(req.channel)}</td>
                      <td className="py-3.5 px-space-md font-mono text-body-sm text-tertiary font-semibold">
                        {req.bankReferenceNumber}
                      </td>
                      <td className="py-3.5 px-space-md">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-md text-xs bg-primary-fixed text-on-primary-fixed font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            بانتظار المطابقة
                          </span>
                        ) : req.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-md text-xs bg-secondary-fixed text-on-secondary-fixed font-medium">
                            <span className="material-symbols-outlined text-[14px]">check</span>
                            معتمد
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-md text-xs bg-error-container text-on-error-container font-medium">
                            مرفوض
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-space-md text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(req);
                          }}
                          className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"
                        >
                          فحص الإشعار
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Inspector Drawer (4 Cols) */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high flex flex-col gap-space-md sticky top-20">
          {selectedRequest ? (
            <>
              <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">
                    fact_check
                  </span>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    فحص إشعار التحويل البنكي
                  </h3>
                </div>
                <span className="font-mono text-xs text-outline">
                  {selectedRequest.id}
                </span>
              </div>

              {/* Broker Brief */}
              <div className="bg-surface-container-low p-3 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-label-lg text-label-lg font-bold text-tertiary">
                    {selectedRequest.brokerName}
                  </div>
                  <div className="font-body-sm text-body-sm text-outline font-mono">
                    الكود: {selectedRequest.brokerId}
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-label-md text-label-md text-on-surface-variant">المبلغ</div>
                  <div className="font-tabular-stat text-label-lg font-bold text-secondary">
                    {selectedRequest.amountSdg.toLocaleString()} ج.س
                  </div>
                </div>
              </div>

              {/* Slip Visual Simulation */}
              <div className="border-2 border-dashed border-secondary/40 bg-surface rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-secondary font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">receipt</span>
                    إشعار عملية إلكترونية
                  </span>
                  <span className="font-mono text-xs text-outline">BOK Transfer</span>
                </div>

                <div className="space-y-1.5 font-mono text-xs text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>المرجع البنكي:</span>
                    <span className="font-bold text-on-surface">
                      {selectedRequest.bankReferenceNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>الحساب المحول منه:</span>
                    <span>184****92</span>
                  </div>
                  <div className="flex justify-between">
                    <span>حساب ZoolGo المركزي:</span>
                    <span>3049102 (BOK)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>توقيت التحويل:</span>
                    <span>اليوم 10:14 ص</span>
                  </div>
                </div>

                <div className="p-2 bg-secondary-fixed/40 rounded text-center text-xs text-secondary font-semibold">
                  ✓ تم التحقق الآلي من رقم العملية لدى البنك
                </div>
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === 'pending' ? (
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleApprove(selectedRequest)}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-label-lg text-label-lg font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>اعتماد وشحن المحفظة</span>
                  </button>

                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    className="py-2.5 px-3 rounded-lg bg-error-container hover:bg-error/20 text-on-error-container font-label-lg text-label-lg font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                    <span>رفض</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-surface-container rounded-lg text-center text-on-surface-variant text-body-sm">
                  هذا الطلب تمت مراجعته مسبقاً (
                  <span className="font-bold">
                    {selectedRequest.status === 'approved' ? 'معتمد' : 'مرفوض'}
                  </span>
                  ).
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-outline">
              اختر طلباً من الجدول لعرض بيانات الإشعار
            </div>
          )}
        </div>
      </div>

      {/* Reject Reason Dialog */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xl max-w-md w-full border border-surface-container-high flex flex-col gap-4">
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h3 className="font-headline-sm text-headline-sm font-bold">
                تأكيد رفض طلب شحن الرصيد
              </h3>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              يرجى كتابة سبب رفض إشعار التحويل البنكي الخاص بـ{' '}
              <span className="font-bold text-on-surface">
                {selectedRequest.brokerName}
              </span>
              :
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="مثال: رقم العملية غير متطابق مع كشف حساب البنك، أو الإشعار مكرر..."
              rows={3}
              className="w-full p-3 rounded-lg bg-surface-container-low border border-surface-container-high font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-error/20"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high font-label-md text-on-surface"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg bg-error text-on-error hover:bg-error/90 font-label-md font-bold"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Deposit Modal Dialog */}
      <WalletDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        wallets={wallets}
        onConfirmDeposit={(brokerId, amount, channel, refNum, notes) => {
          recordTopUp(brokerId, amount, channel, refNum, notes);
          setIsDepositModalOpen(false);
        }}
      />
    </div>
  );
};
