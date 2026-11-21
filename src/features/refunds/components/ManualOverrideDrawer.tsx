import React, { useState } from 'react';
import type { RefundChannel, RefundRequest } from '../types/refunds';

interface ManualOverrideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest: RefundRequest | null;
  onConfirmOverride: (params: {
    ticketNumber: string;
    refundPercent: number;
    customAmountSdg?: number;
    channel: RefundChannel;
    justification: string;
    notifySms: boolean;
  }) => void;
}

export const ManualOverrideDrawer: React.FC<ManualOverrideDrawerProps> = ({
  isOpen,
  onClose,
  selectedRequest,
  onConfirmOverride,
}) => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [reasonCategory, setReasonCategory] = useState(
    'ظرف قاهر خارج عن الإرادة (حادث مروري / تقرير طبي معتمد)'
  );
  const [justification, setJustification] = useState(
    'تم استلام التقرير الطبي المؤرخ بتاريخ اليوم الذي يثبت تعذر سفر المريض ومرافقه. يُعفى من غرامة الإلغاء ويُعتمد الرد الكامل لصالح حسابه البنكي.'
  );
  const [refundRatio, setRefundRatio] = useState<'100' | 'custom'>('100');
  const [customAmount, setCustomAmount] = useState<number | undefined>(undefined);
  const [bearingParty, setBearingParty] = useState<'fund' | 'carrier'>('fund');
  const [channel, setChannel] = useState<RefundChannel>('bankak');
  const [notifySms, setNotifySms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load the selected request into the form whenever the selection changes
  // (adjusted during render instead of in an effect).
  const [loadedRequest, setLoadedRequest] = useState<typeof selectedRequest | undefined>(undefined);
  if (loadedRequest !== selectedRequest) {
    setLoadedRequest(selectedRequest);
    if (selectedRequest) {
      setTicketNumber(selectedRequest.ticketNumber);
      if (selectedRequest.justificationNotes) {
        setJustification(selectedRequest.justificationNotes);
      }
    } else {
      setTicketNumber('ZL-854921');
    }
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmOverride({
        ticketNumber: ticketNumber || 'ZL-854921',
        refundPercent: refundRatio === '100' ? 100 : 85,
        customAmountSdg: refundRatio === 'custom' ? customAmount : undefined,
        channel,
        justification,
        notifySms,
      });
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-tertiary/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer (RTL: Anchored to LEFT) */}
      <aside className="fixed left-0 top-0 bottom-0 z-50 w-full sm:w-[570px] lg:w-[620px] max-w-[95vw] bg-surface-container-lowest shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-left duration-200">
        {/* Fixed Header */}
        <div className="p-space-lg bg-surface-container-low flex flex-col gap-space-sm shadow-sm relative border-b border-surface-container-high">
          <div className="flex items-start justify-between gap-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-headline-sm">gavel</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                    تنفيذ استرداد استثنائي فوري
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-xs font-bold tracking-tight">
                    Manual Override
                  </span>
                </div>
                <span className="font-label-md text-label-md text-secondary font-semibold mt-0.5">
                  بروتوكول الطوارئ الإداري #OVR-2024-91
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface-variant flex items-center justify-center transition-colors"
              title="إغلاق النافذة"
            >
              <span className="material-symbols-outlined text-headline-sm">close</span>
            </button>
          </div>

          <div className="p-2.5 rounded-lg bg-surface-container text-on-surface-variant text-body-sm font-body-sm flex items-start gap-2 leading-relaxed">
            <span className="material-symbols-outlined text-primary text-headline-sm shrink-0 mt-0.5">
              security_update_warning
            </span>
            <span>
              إجراء إداري مقيّد بموجب صلاحيات المشرف العام (Super Admin). يؤدي التنفيذ إلى إصدار إشعار فوري للبنك، وتوليد قيد مزدوج في سجل التدقيق المالي المركزي غير القابل للإلغاء.
            </span>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-space-lg space-y-space-lg">
          {/* STEP 1: Ticket Info */}
          <section className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-label-lg text-label-lg text-on-surface font-bold">
                <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary text-body-sm font-body-sm flex items-center justify-center">
                  ١
                </span>
                <span>بيانات الحجز والتذكرة المتعثرة</span>
              </label>
              <span className="text-secondary font-label-md text-label-md flex items-center gap-1">
                <span className="material-symbols-outlined text-base">verified</span>
                سجل تم التحقق منه
              </span>
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-headline-sm">
                confirmation_number
              </span>
              <input
                className="w-full h-11 pr-11 pl-4 rounded-lg bg-surface-container-high text-on-surface font-body-md text-body-md font-semibold cursor-not-allowed focus:outline-none"
                readOnly
                type="text"
                value={`${ticketNumber} (${selectedRequest?.passengerName || 'محمد أحمد سليمان'} - ${
                  selectedRequest?.routeText || 'الخرطوم ↔ مروي'
                })`}
              />
            </div>

            {/* Confirmed Ticket Card Overview */}
            <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col gap-space-xs relative overflow-hidden border border-surface-container-high">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  <span className="font-label-lg text-label-lg text-on-surface font-bold">
                    {selectedRequest?.carrierName || 'شركة النيل للنقل البري'}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-semibold">
                  حالة التذكرة: مؤكدة
                </span>
              </div>
              <div className="grid grid-cols-2 gap-space-sm pt-2 font-body-md text-body-md">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant font-body-sm text-body-sm">خط الرحلة والانطلاق</span>
                  <span className="text-on-surface font-semibold text-xs">
                    {selectedRequest?.routeText || 'الخرطوم (الميناء البري) ➔ مروي'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant font-body-sm text-body-sm">رقم المقعد والحافلة</span>
                  <span className="text-on-surface font-semibold font-tabular-stat text-xs">
                    المقعد: {selectedRequest?.seatNumber || 'A12'} ({selectedRequest?.tripCode || 'حافلة VIP 104'})
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant font-body-sm text-body-sm">قيمة التذكرة الأصلية</span>
                  <span className="font-tabular-stat text-sm text-secondary font-bold">
                    {(selectedRequest?.ticketFareSdg || 350).toFixed(2)} ج.س
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant font-body-sm text-body-sm">تاريخ وموعد السفر</span>
                  <span className="text-on-surface font-semibold text-xs">
                    {selectedRequest?.scheduledDeparture || '24 أكتوبر 2024 - 07:00 ص'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 2: Reason & Justification */}
          <section className="flex flex-col gap-space-sm">
            <label className="flex items-center gap-2 font-label-lg text-label-lg text-on-surface font-bold">
              <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary text-body-sm font-body-sm flex items-center justify-center">
                ٢
              </span>
              <span>تحديد سبب الاستثناء الإداري (Audit Justification)</span>
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-on-surface-variant font-body-sm text-body-sm">التصنيف الإداري للواقعة:</span>
              <div className="relative">
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className="w-full h-11 px-3 pl-10 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-sm font-medium border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-secondary/40"
                >
                  <option value="ظرف قاهر خارج عن الإرادة (حادث مروري / تقرير طبي معتمد)">
                    ظرف قاهر خارج عن الإرادة (حادث مروري / تقرير طبي معتمد)
                  </option>
                  <option value="خطأ تقني في حجز المقعد المزدوج من قبل الوكيل">
                    خطأ تقني في حجز المقعد المزدوج من قبل الوكيل
                  </option>
                  <option value="توجيه إداري رسمي من وزارة النقل وهيئة الطرق">
                    توجيه إداري رسمي من وزارة النقل وهيئة الطرق
                  </option>
                  <option value="تسوية نزاع ميداني معتمد بمحضر رسمي من محطة الركاب">
                    تسوية نزاع ميداني معتمد بمحضر رسمي من محطة الركاب
                  </option>
                  <option value="إلغاء الرحلة بالكامل من قبل المشغل البري دون بديل">
                    إلغاء الرحلة بالكامل من قبل المشغل البري دون بديل
                  </option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-body-sm text-body-sm">بيان التبرير المرفوع لسجل المراجعة:</span>
                <span className="text-on-surface-variant font-body-sm text-xs font-mono">{justification.length} حرفاً</span>
              </div>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="w-full p-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-sm border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-secondary/40 leading-relaxed resize-none"
                rows={3}
              />
            </div>
          </section>

          {/* STEP 3: Financial Calculations & Payout Channel */}
          <section className="flex flex-col gap-space-sm">
            <label className="flex items-center gap-2 font-label-lg text-label-lg text-on-surface font-bold">
              <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary text-body-sm font-body-sm flex items-center justify-center">
                ٣
              </span>
              <span>الحساب المالي ومسار الإرجاع المباشر</span>
            </label>

            {/* Ratio selection */}
            <div className="grid grid-cols-2 gap-space-sm">
              <label
                onClick={() => setRefundRatio('100')}
                className={`p-3 rounded-xl border flex items-start gap-2 cursor-pointer transition-colors ${
                  refundRatio === '100'
                    ? 'border-secondary bg-secondary-container/20 text-on-surface'
                    : 'border-surface-container-high bg-surface-container-lowest text-on-surface opacity-75'
                }`}
              >
                <input
                  type="radio"
                  name="refundRatio"
                  checked={refundRatio === '100'}
                  onChange={() => setRefundRatio('100')}
                  className="mt-1 accent-secondary"
                />
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg font-bold">استرداد كامل 100%</span>
                  <span className="font-tabular-stat text-sm text-secondary font-bold">
                    {(selectedRequest?.ticketFareSdg || 350).toFixed(2)} ج.س
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">إعفاء تام من رسوم البوابة</span>
                </div>
              </label>

              <label
                onClick={() => setRefundRatio('custom')}
                className={`p-3 rounded-xl border flex items-start gap-2 cursor-pointer transition-colors ${
                  refundRatio === 'custom'
                    ? 'border-secondary bg-secondary-container/20 text-on-surface'
                    : 'border-surface-container-high bg-surface-container-lowest text-on-surface opacity-75'
                }`}
              >
                <input
                  type="radio"
                  name="refundRatio"
                  checked={refundRatio === 'custom'}
                  onChange={() => setRefundRatio('custom')}
                  className="mt-1 accent-secondary"
                />
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg font-bold">استرداد مخصص بمبلغ</span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">خصم جزئي لرسوم التشغيل</span>
                  <div className="mt-1 flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="المبلغ..."
                      value={customAmount || ''}
                      onChange={(e) => setCustomAmount(Number(e.target.value))}
                      disabled={refundRatio !== 'custom'}
                      className="w-20 h-7 px-2 text-xs rounded bg-surface-container text-on-surface font-tabular-stat border border-surface-container-high"
                    />
                    <span className="text-xs text-on-surface-variant">ج.س</span>
                  </div>
                </div>
              </label>
            </div>

            {/* Bearing entity selection */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-on-surface-variant font-body-sm text-xs font-semibold">
                الجهة المتحملة لقيمة الاسترداد الاستثنائي:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label
                  onClick={() => setBearingParty('fund')}
                  className={`p-3 rounded-lg border flex items-center gap-2.5 cursor-pointer ${
                    bearingParty === 'fund'
                      ? 'border-secondary bg-surface-container'
                      : 'border-surface-container-high bg-surface-container-lowest'
                  }`}
                >
                  <input
                    type="radio"
                    name="bearingParty"
                    checked={bearingParty === 'fund'}
                    onChange={() => setBearingParty('fund')}
                    className="accent-secondary"
                  />
                  <div className="flex flex-col">
                    <span className="font-label-md text-xs text-on-surface font-semibold">
                      صندوق ZoolGo المالي للطوارئ
                    </span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">
                      تغطية كمسؤولية تشغيلية للمنصة
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setBearingParty('carrier')}
                  className={`p-3 rounded-lg border flex items-center gap-2.5 cursor-pointer ${
                    bearingParty === 'carrier'
                      ? 'border-secondary bg-surface-container'
                      : 'border-surface-container-high bg-surface-container-lowest'
                  }`}
                >
                  <input
                    type="radio"
                    name="bearingParty"
                    checked={bearingParty === 'carrier'}
                    onChange={() => setBearingParty('carrier')}
                    className="accent-secondary"
                  />
                  <div className="flex flex-col">
                    <span className="font-label-md text-xs text-on-surface font-semibold">
                      خصم من {selectedRequest?.carrierName || 'شركة النقل'}
                    </span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">
                      تسوية بالخصم من الدورة الأسبوعية
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Destination Payout Channel */}
            <div className="p-space-md rounded-xl bg-surface-container-high flex flex-col gap-space-xs border border-surface-container-highest">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">payments</span>
                  <span className="font-label-lg text-sm text-on-surface font-bold">
                    وجهة الرد المالي (Payout Destination)
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary font-label-md text-xs font-medium">
                  <span className="material-symbols-outlined text-sm">flash_on</span>
                  تحويل بنكي لحظي
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2">
                {(
                  [
                    { id: 'bankak', label: 'تطبيق بنكك (BOK)' },
                    { id: 'zoolgo_wallet', label: 'محفظة ZoolGo' },
                    { id: 'cash_voucher', label: 'قسيمة نقدية' },
                  ] as const
                ).map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all ${
                      channel === ch.id
                        ? 'border-secondary bg-secondary-container text-on-secondary-container shadow-xs'
                        : 'border-surface-container-highest bg-surface-container-lowest text-on-surface'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* STEP 4: Compliance & Digital Signature */}
          <section className="flex flex-col gap-space-sm pb-2">
            <label className="flex items-center gap-2 font-label-lg text-label-lg text-on-surface font-bold">
              <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary text-body-sm font-body-sm flex items-center justify-center">
                ٤
              </span>
              <span>المصادقة والتوقيع الرقمي المزدوج (SoD Compliance)</span>
            </label>

            <div className="p-3 rounded-lg bg-surface-container flex items-start gap-2.5 text-body-sm font-body-sm text-on-surface border border-surface-container-high">
              <span className="material-symbols-outlined text-primary text-headline-sm shrink-0">badge</span>
              <div>
                سيتم توقيع هذه المعاملة وتوثيقها باسم المشرف العام:
                <strong className="font-semibold text-primary"> أحمد السر (ADM-001) </strong>
                مع إرفاق البصمة التشفيرية لجلسة العمل الحالية.
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-on-surface">
              <input
                type="checkbox"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
                className="accent-secondary w-4 h-4 rounded"
              />
              <span>إرسال إشعار SMS ورسالة واتساب للمسافر والوكيل فوراً</span>
            </label>
          </section>

          {/* Footer Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-primary-container text-on-primary font-label-lg text-sm font-bold shadow-md hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-headline-sm">check_circle</span>
              <span>{isSubmitting ? 'جاري التنفيذ وتوليد القيد...' : 'اعتماد الاسترداد الاستثنائي الفوري'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-sm font-semibold transition-colors"
            >
              إلغاء والعودة للطابور
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};
