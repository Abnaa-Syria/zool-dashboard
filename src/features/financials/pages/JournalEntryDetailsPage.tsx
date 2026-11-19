import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJournalEntryDetails } from '../hooks/useFinancials';
import { DoubleEntryBreakdownCard } from '../components/DoubleEntryBreakdownCard';

export const JournalEntryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { entry } = useJournalEntryDetails(id || '');
  const [copiedHash, setCopiedHash] = useState(false);

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-space-lg text-center">
        <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px]">error</span>
        </div>
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
          القيد المحاسبي غير موجود
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
          لم يتم العثور على القيد المالي بالرقم المرجعي المطلوب ({id}). قد يكون المعرف غير صحيح أو تم حذفه من قاعدة البيانات التجريبية.
        </p>
        <Link
          to="/financials/ledger"
          className="px-4 py-2 rounded-lg bg-tertiary text-on-tertiary font-label-lg text-label-lg hover:bg-tertiary/90 transition-colors"
        >
          العودة لسجل القيود العام
        </Link>
      </div>
    );
  }

  const handleCopyHash = () => {
    navigator.clipboard.writeText(entry.sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isDebit = entry.amountSdg < 0;
  const absAmount = Math.abs(entry.amountSdg);

  // Derive prior balance for visualization
  const priorBalance = isDebit
    ? entry.postBalanceSdg + absAmount
    : entry.postBalanceSdg - absAmount;

  return (
    <div className="flex flex-col w-full gap-space-lg p-space-lg">
      {/* 1. Breadcrumbs */}
      <div className="flex flex-col gap-space-xs">
        <nav className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
          <Link to="/overview" className="hover:text-secondary transition-colors">
            الرئيسية والعمليات
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline rotate-180">
            chevron_left
          </span>
          <Link to="/financials/wallets" className="hover:text-secondary transition-colors">
            المالية والتسويات
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline rotate-180">
            chevron_left
          </span>
          <Link to="/financials/ledger" className="hover:text-secondary transition-colors">
            المحافظ والمعاملات المالية
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline rotate-180">
            chevron_left
          </span>
          <span className="text-tertiary font-bold">
            تفاصيل المعاملة {entry.id}
          </span>
        </nav>

        {/* Action & Identification Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high mt-1">
          <div className="flex flex-col gap-space-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                تفاصيل المعاملة المالية — {entry.id}
              </span>
              <span className="px-2.5 py-1 rounded-full font-label-md text-label-md bg-surface-container text-tertiary font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                {entry.typeLabel}
              </span>
              <span className="px-2.5 py-1 rounded-full font-label-md text-label-md bg-secondary-fixed text-on-secondary-fixed font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                مقيد ومطابق بنكياً
              </span>
              <span className="px-2.5 py-1 rounded-full font-label-md text-label-md bg-surface-container-high text-on-surface-variant font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                غير قابل للتعديل (Immutable)
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              سجل قيد محاسبي مركزي صادر عن محرك الدفع والتسوية لشبكة خطوط ZoolGo الإقليمية
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/financials/ledger"
              className="flex items-center gap-1.5 px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-colors border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              <span>العودة لسجل القيود</span>
            </Link>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-space-md py-2.5 rounded-lg bg-surface-container-low text-secondary hover:bg-secondary-container transition-colors font-label-lg text-label-lg shadow-sm border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span>تنزيل سند القيد (PDF)</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-space-md py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>طباعة سند القيد المحاسبي</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Stat Summary Strip (4 Core Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* Stat 1: Amount */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md border border-surface-container-high">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[26px]">payments</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              مبلغ المعاملة الصافي
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className={`font-tabular-stat text-tabular-stat font-bold ${
                  isDebit ? 'text-primary' : 'text-secondary'
                }`}
              >
                {absAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                ج.س
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">check_circle</span>
              {isDebit ? 'خصم فوري مباشر' : 'إيداع معتمد فوري'}
            </span>
          </div>
        </div>

        {/* Stat 2: Executing Party */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md border border-surface-container-high">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-tertiary shrink-0">
            <span className="material-symbols-outlined text-[26px]">point_of_sale</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              الطرف المنفذ للعملية
            </span>
            <span
              className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate mt-0.5"
              title={entry.brokerName || entry.partyDescription}
            >
              {entry.brokerName || entry.partyDescription}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
              {entry.executingClerk ? `الكاشير: ${entry.executingClerk}` : 'النظام الآلي المركزي'}
            </span>
          </div>
        </div>

        {/* Stat 3: Execution Timestamp */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md border border-surface-container-high">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-[26px]">schedule</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              تاريخ ووقت المعاملة
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-0.5">
              {entry.dateStr}
            </span>
            <span className="font-body-sm text-body-sm text-secondary font-mono">
              {entry.timeStr} (GMT+2)
            </span>
          </div>
        </div>

        {/* Stat 4: Account Impacted */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md border border-surface-container-high">
          <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
            <span className="material-symbols-outlined text-[26px]">account_balance_wallet</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              الحساب المتأثر بالحركة
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate mt-0.5">
              {entry.paymentChannelLabel}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              الرصيد بعد الحركة:{' '}
              <b className="text-tertiary">
                {entry.postBalanceSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                ج.س
              </b>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Multi-Column Ledger Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Right Main Column (8 Cols in RTL) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Card 1: Double-Entry Ledger Details */}
          <DoubleEntryBreakdownCard
            legs={entry.doubleEntryLegs}
            transactionId={entry.id}
          />

          {/* Card 2: Linked Ticket & Route Manifest Information */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container-high">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 rounded bg-secondary inline-block"></span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  الوثيقة المرتبطة وبيانات الرحلة المصدرة
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full font-label-md text-label-md bg-surface-container font-semibold text-secondary">
                {entry.bookingReference ? 'تذكرة مؤكدة وسارية' : 'إشعار شحن معتمد'}
              </span>
            </div>

            {/* Ticket Card Mosaic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="p-space-md bg-surface rounded-xl flex flex-col justify-between border border-surface-container-high">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    رقم التذكرة والرحلة
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-headline-sm text-headline-sm text-primary font-bold font-mono">
                      {entry.bookingReference || 'ZL-854921-1'}
                    </span>
                    <span className="px-2 py-0.5 rounded font-label-md text-label-md bg-secondary text-on-secondary">
                      سابتكو VIP
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-tertiary font-bold font-headline-sm text-headline-sm">
                    <span>الخرطوم</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_left_alt</span>
                    <span>مروي</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    مقعد رقم #14 (نافذة يمين) — انطلاق 24 أكتوبر 2024 (11:00 ص)
                  </span>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container-high">
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    المسافر المحجوز له:
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="font-label-lg text-label-lg font-bold text-on-surface">
                      حسن عبدالله
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant font-mono" dir="ltr">
                      +249 912 345 678
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-space-md bg-surface rounded-xl flex flex-col justify-between border border-surface-container-high">
                <div className="flex flex-col gap-space-sm">
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    بيانات نقطة البيع والعمولة التعاقدية
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md text-on-surface">
                      محطة البيع (POS Terminal):
                    </span>
                    <span className="font-label-lg text-label-lg text-tertiary font-mono">
                      #KRT-04 (الميناء البري)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md text-on-surface">
                      نسبة عمولة الوكيل:
                    </span>
                    <span className="font-label-lg text-label-lg text-secondary font-bold">
                      10% (35.00 ج.س)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md text-on-surface">
                      دورة التسوية المالية:
                    </span>
                    <span className="px-2 py-0.5 rounded font-label-md text-label-md bg-surface-container font-mono text-tertiary">
                      Cycle: W-44 (مستحقة 31 أكتوبر)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md text-on-surface">
                      المطابقة الضريبية:
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      معفاة طبقاً للائحة النقل بين الولايات
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container-high">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    مفتاح الربط المرجعي:
                  </span>
                  <span className="font-body-sm text-body-sm font-mono text-primary font-bold">
                    REF-BUS-KRT-MRW-9921
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Lifecycle Audit Timeline */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container-high">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 rounded bg-tertiary inline-block"></span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  الخط الزمني المالي وتدقيق المراحل (Lifecycle Timeline)
                </h2>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant font-mono">
                مدة التنفيذ الإجمالية: 5 ثوانٍ
              </span>
            </div>

            {/* Vertical Timeline Nodes */}
            <div className="relative pr-6 flex flex-col gap-6 before:content-[''] before:absolute before:right-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-highest">
              {/* Event 1 */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -right-6 top-1.5 w-3 h-3 rounded-full bg-secondary ring-4 ring-surface-container-lowest"></div>
                <div className="flex items-center justify-between">
                  <span className="font-label-lg text-label-lg text-tertiary font-bold">
                    بدء طلب الحجز والتحقق من رصيد محفظة الوكيل
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                    09:20:10 ص
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  تم فحص المحفظة من خلال النظام المصرفي لـ ZoolGo. رصيد الوكيل كان كافياً بإجمالي{' '}
                  {priorBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س قبل الخصم، مع رخصة سارية بدون إيقاف مؤقت.
                </p>
              </div>

              {/* Event 2 */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -right-6 top-1.5 w-3 h-3 rounded-full bg-secondary ring-4 ring-surface-container-lowest"></div>
                <div className="flex items-center justify-between">
                  <span className="font-label-lg text-label-lg text-tertiary font-bold">
                    حجز المقعد المؤقت وتجميد المبلغ (Authorization Hold)
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                    09:20:12 ص
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  تم حجز المقعد رقم 14 في جدول باص سابتكو وتجميد مبلغ {absAmount.toFixed(2)} ج.س بنجاح لتجنب الحجز المزدوج.
                </p>
              </div>

              {/* Event 3 */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -right-6 top-1.5 w-3.5 h-3.5 rounded-full bg-primary-container ring-4 ring-surface-container-lowest"></div>
                <div className="flex items-center justify-between">
                  <span className="font-label-lg text-label-lg text-primary font-bold">
                    خصم المبلغ نهائياً وتوليد قيد الخصم {entry.id}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                    {entry.timeStr}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  تم تأكيد الخصم المالي الفعلي من رصيد محفظة الوكيل وتحديث الرصيد الصافي إلى{' '}
                  {entry.postBalanceSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س مع إدراج الطرف المدين لصالح المشغل.
                </p>
              </div>

              {/* Event 4 */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -right-6 top-1.5 w-3 h-3 rounded-full bg-secondary ring-4 ring-surface-container-lowest"></div>
                <div className="flex items-center justify-between">
                  <span className="font-label-lg text-label-lg text-secondary font-bold">
                    إصدار التذكرة الرقمية وإشعار العميل عبر SMS
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                    09:20:15 ص
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  تم توليد الباركود وتذكرة الصعود ZL-854921 وإرسال رسالة نصية بالرابط المباشر إلى هاتف الراكب عبر بوابة الرسائل المعتمدة.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Left Audit, Security & Governance Sidebar (4 Cols in RTL) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Card 1: Security Hash & Ledger Block */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container-high">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">fingerprint</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                التوقيع الرقمي والتدقيق الأمني
              </h3>
            </div>
            <div className="bg-surface p-space-md rounded-lg flex flex-col gap-space-sm border border-surface-container-high">
              <div className="flex items-center justify-between text-body-sm font-body-sm">
                <span className="text-on-surface-variant">كتلة السجل العام (Ledger Block):</span>
                <span className="font-mono font-bold text-tertiary">#849,201</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-body-sm font-body-sm">
                  <span className="text-on-surface-variant">بصمة التشفير (SHA-256 Hash):</span>
                  <button
                    onClick={handleCopyHash}
                    className="text-secondary text-xs hover:underline flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedHash ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedHash ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
                <div className="bg-surface-container-lowest p-2 rounded text-[11px] font-mono text-on-surface-variant break-all select-all leading-tight border border-surface-container">
                  {entry.sha256Hash}
                </div>
              </div>
              <div className="flex items-center gap-1.5 pt-1 text-secondary font-label-md text-label-md">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>بصمة متطابقة 100% مع السجل العام</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-body-sm font-body-sm px-1">
              <span className="text-on-surface-variant">خادم التوثيق المركزي:</span>
              <span className="font-mono text-tertiary text-xs">sec-node-krt-01.zoolgo.sd</span>
            </div>
          </div>

          {/* Card 2: Wallet Balance Movement Visual */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container-high">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                رصيد محفظة الوكيل
              </h3>
              <span className="px-2 py-0.5 rounded font-label-md text-label-md bg-secondary-fixed text-on-secondary-fixed">
                حساب نشط
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {/* Step 1: Prior */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low text-body-md font-body-md">
                <span className="text-on-surface-variant">الرصيد السابق للحركة:</span>
                <span className="font-tabular-stat text-tabular-stat text-on-surface font-bold">
                  {priorBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
                </span>
              </div>
              {/* Step 2: Movement */}
              <div
                className={`flex items-center justify-between p-2.5 rounded-lg text-body-md font-body-md ${
                  isDebit ? 'bg-primary-fixed' : 'bg-secondary-fixed'
                }`}
              >
                <span className="font-medium">
                  {isDebit ? 'قيمة الخصم المنفذ:' : 'قيمة الإيداع المنفذ:'}
                </span>
                <span
                  className={`font-tabular-stat text-tabular-stat font-bold ${
                    isDebit ? 'text-primary' : 'text-secondary'
                  }`}
                  dir="ltr"
                >
                  {isDebit ? `- ${absAmount.toFixed(2)}` : `+ ${absAmount.toFixed(2)}`} ج.س
                </span>
              </div>
              {/* Step 3: Current Result */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-tertiary text-on-tertiary">
                <div className="flex flex-col">
                  <span className="text-body-sm font-body-sm text-on-tertiary-container">
                    الرصيد المحاسبي الفعلي:
                  </span>
                  <span className="font-display-md text-display-md font-bold leading-tight">
                    {entry.postBalanceSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <span className="font-label-lg text-label-lg bg-surface-container-lowest/20 px-2.5 py-1 rounded">
                  ج.س
                </span>
              </div>
            </div>
            {/* Safe Buffer Indicator Bar */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex items-center justify-between text-body-sm font-body-sm">
                <span className="text-on-surface-variant">حد الأمان الموصى به (2,000 ج.س):</span>
                <span className="text-secondary font-bold">مغطى بنسبة 757%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: '88%' }}></div>
              </div>
              <span className="text-[11px] text-on-surface-variant">
                الوكيل يتمتع بملاءة مالية كافية لتمرير المزيد من الحجوزات دون انقطاع.
              </span>
            </div>
          </div>

          {/* Card 3: Exceptional Governance & Admin Controls */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container-high">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">
                admin_panel_settings
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                إجراءات الحوكمة الاستثنائية
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant -mt-1">
              خيارات مقتصرة على المشرف العام (Super Admin). يتطلب تفعيل أي خيار توثيق سبب الطلب في سجل الرقابة المالي.
            </p>
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={() => alert('تم تسجيل طلب المراجعة التدقيقية في سجل الرقابة المالي المركزي.')}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-surface-container-high hover:bg-surface-dim text-on-surface font-label-lg text-label-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-outline">fact_check</span>
                <span>طلب مراجعة تدقيق مالي للقيد</span>
              </button>
              <button
                onClick={() => alert('تم فتح مسار الاسترداد المالي ويجري التحقق مع شركة النقل المشغلة.')}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-primary-fixed hover:bg-primary-container hover:text-on-primary text-primary font-label-lg text-label-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
                <span>بدء إجراءات استرداد التذكرة (Refund Flow)</span>
              </button>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-surface text-on-surface-variant text-body-sm font-body-sm mt-1 border border-surface-container-high">
              <span className="material-symbols-outlined text-[16px] text-outline">info</span>
              <span>لا يمكن إلغاء القيد دون موافقة الإدارة المالية لشركة النقل المشغلة.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
