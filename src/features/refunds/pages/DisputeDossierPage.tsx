import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDisputeDetails } from '../hooks/useRefunds';
import type { RefundDecision } from '../types/refunds';

export const DisputeDossierPage: React.FC = () => {
  const { ticketId = 'ZL-902144' } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { dispute, submitDecision } = useDisputeDetails(ticketId);

  const [selectedDecision, setSelectedDecision] = useState<RefundDecision>('full_refund');
  const [justificationNotes, setJustificationNotes] = useState(
    'تم التحقق من تقرير العمليات الميداني وتأكيد تعطل الحافلة في نقطة التجهيز. يُعتمد الاسترداد الفوري بنسبة 100% لحماية سمعة المنصة وحقوق المسافر.'
  );
  const [notifySms, setNotifySms] = useState(true);
  const [postLedger, setPostLedger] = useState(true);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  if (!dispute) {
    return (
      <div className="p-space-lg max-w-[1520px] mx-auto w-full">
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high text-center py-12">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-2">search_off</span>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">لم يتم العثور على ملف النزاع المطلوب</h2>
          <p className="font-body-md text-on-surface-variant mt-1">تأكد من رقم التذكرة أو عد إلى طابور الاسترداد.</p>
          <button
            onClick={() => navigate('/refunds/queue')}
            className="mt-4 px-4 py-2 rounded-lg bg-secondary text-on-secondary font-label-md text-sm font-semibold"
          >
            العودة لطابور الاسترداد
          </button>
        </div>
      </div>
    );
  }

  const handleExecute = (overrideDecision?: RefundDecision) => {
    const decisionToUse = overrideDecision || selectedDecision;
    submitDecision({
      decision: decisionToUse,
      justification: justificationNotes,
      notifySms,
      postLedger,
    });

    const msg =
      decisionToUse === 'full_refund'
        ? 'تم اعتماد الاسترداد الكامل 100% بنجاح وتوليد القيد المزدوج في دفتر الأستاذ العام.'
        : decisionToUse === 'partial_refund'
        ? 'تم اعتماد الاسترداد الجزئي (85%) بنجاح.'
        : decisionToUse === 'voucher'
        ? 'تم إصدار قسيمة سفر تعويضية وإرسالها للمسافر.'
        : 'تم رفض طلب الاسترداد وإغلاق ملف النزاع.';

    setActionSuccessToast(msg);
    setTimeout(() => {
      setActionSuccessToast(null);
    }, 4000);
  };

  return (
    <div className="p-space-lg space-y-space-lg max-w-[1520px] mx-auto w-full">
      {/* Toast Alert */}
      {actionSuccessToast && (
        <div className="p-3 bg-secondary text-on-secondary rounded-xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-label-lg text-sm">
            <span className="material-symbols-outlined text-[20px]">verified</span>
            {actionSuccessToast}
          </div>
          <button onClick={() => setActionSuccessToast(null)} className="text-on-secondary/80 hover:text-on-secondary">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Top Navigation & Breadcrumbs Bar */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
          <a className="hover:text-secondary transition-colors" href="/reports">
            المالية والتسويات
          </a>
          <span className="material-symbols-outlined text-body-sm text-outline">chevron_left</span>
          <a className="hover:text-secondary transition-colors" href="/refunds/queue">
            الإلغاءات والاسترداد
          </a>
          <span className="material-symbols-outlined text-body-sm text-outline">chevron_left</span>
          <span className="text-secondary font-semibold">ملف النزاع #{dispute.id}</span>
        </div>

        {/* Header Action Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-space-sm">
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                معالجة ملف الاسترداد: تذكرة #{dispute.ticketNumber}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-md text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                {dispute.statusLabel}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              المسافر: <strong className="text-on-surface">{dispute.passengerName}</strong> • تاريخ القيد: {dispute.requestedAt} • الناقل: {dispute.carrierName}
            </p>
          </div>

          <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-secondary font-label-lg text-xs font-medium shadow-sm hover:bg-surface-container-high transition-colors border border-surface-container-high"
              type="button"
            >
              <span className="material-symbols-outlined text-headline-sm">print</span>
              <span>طباعة تقرير النزاع</span>
            </button>
            <button
              onClick={() => navigate('/financials/ledger')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-lg text-xs font-medium hover:bg-surface-container-highest transition-colors border border-surface-container-high"
              type="button"
            >
              <span className="material-symbols-outlined text-headline-sm">history_edu</span>
              <span>سجل التدقيق المحاسبي (Audit Log)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operational Metrics Flash Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between border border-surface-container-high">
          <div className="flex flex-col">
            <span className="text-on-surface-variant font-label-md text-xs">إجمالي المبلغ المطالب به</span>
            <span className="font-tabular-stat text-tabular-stat text-primary font-bold mt-1">
              {dispute.ticketFareSdg.toFixed(2)}{' '}
              <span className="text-xs font-normal text-on-surface-variant">ج.س</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">payments</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between border border-surface-container-high">
          <div className="flex flex-col">
            <span className="text-on-surface-variant font-label-md text-xs">نسبة الاسترداد المستحقة</span>
            <span className="font-tabular-stat text-tabular-stat text-secondary font-bold mt-1">
              100% <span className="text-xs font-normal text-secondary">(إعفاء كامل)</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <span className="material-symbols-outlined">verified</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between border border-surface-container-high">
          <div className="flex flex-col">
            <span className="text-on-surface-variant font-label-md text-xs">زمن تأخر الحافلة عن الموعد</span>
            <span className="font-tabular-stat text-tabular-stat text-error font-bold mt-1">
              {dispute.telemetryEvidence?.delayHours || '+3:15 ساعات'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center text-error">
            <span className="material-symbols-outlined">running_with_errors</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between border border-surface-container-high">
          <div className="flex flex-col">
            <span className="text-on-surface-variant font-label-md text-xs">مستوى النزاع التشغيلي</span>
            <span className="font-headline-sm text-sm text-primary-container font-bold mt-1">
              عطل مثبت (GPS)
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">gps_fixed</span>
          </div>
        </div>
      </div>

      {/* Main Asymmetric 2-Column Grid (65% Right Dossier / 35% Left Decision) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* RIGHT COLUMN: Case Dossier & Evidence (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Card 1: Original Ticket & Trip Manifest */}
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container-high overflow-hidden">
            <div className="flex items-center justify-between pb-space-sm mb-space-md bg-surface-container-low -mx-space-lg -mt-space-lg px-space-lg py-3 rounded-t-xl border-b border-surface-container-high">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary">confirmation_number</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  بيانات الرحلة والتذكرة الأصلية
                </h2>
              </div>
              <span className="font-label-md text-xs px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-mono">
                حجز رقم: #{dispute.bookingId}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-space-md">
              <div className="flex flex-col p-3 rounded-lg bg-surface-container-low">
                <span className="text-on-surface-variant font-label-md text-xs">رقم التذكرة الإلكترونية</span>
                <span className="font-tabular-stat text-sm font-bold text-on-surface mt-1">
                  {dispute.ticketNumber}
                </span>
              </div>
              <div className="flex flex-col p-3 rounded-lg bg-surface-container-low">
                <span className="text-on-surface-variant font-label-md text-xs">رمز الرحلة والشركة</span>
                <span className="font-headline-sm text-sm font-semibold text-secondary mt-1">
                  {dispute.tripCode} ({dispute.carrierName.replace('شركة ', '').replace(' للنقل الجماعي', '')})
                </span>
              </div>
              <div className="flex flex-col p-3 rounded-lg bg-surface-container-low">
                <span className="text-on-surface-variant font-label-md text-xs">رقم المقعد وفئته</span>
                <span className="font-headline-sm text-sm font-bold text-primary-container mt-1">
                  {dispute.seatNumber} (درجة {dispute.seatClass})
                </span>
              </div>
              <div className="flex flex-col p-3 rounded-lg bg-surface-container-low">
                <span className="text-on-surface-variant font-label-md text-xs">مسار الرحلة المعتمد</span>
                <span className="font-body-md text-xs font-semibold text-on-surface mt-1">
                  {dispute.routeText}
                </span>
              </div>
              <div className="flex flex-col p-3 rounded-lg bg-surface-container-low">
                <span className="text-on-surface-variant font-label-md text-xs">موعد الانطلاق المجدول</span>
                <span className="font-body-md text-xs font-medium text-on-surface mt-1">
                  {dispute.scheduledDeparture}
                </span>
              </div>
              <div className="flex flex-col p-3 rounded-lg bg-surface-container-low">
                <span className="text-on-surface-variant font-label-md text-xs">سعر التذكرة الإجمالي</span>
                <span className="font-tabular-stat text-sm font-bold text-secondary mt-1">
                  {dispute.ticketFareSdg.toFixed(2)} ج.س
                </span>
              </div>
            </div>

            <div className="mt-space-md p-space-sm rounded-lg bg-error-container/30 flex items-start gap-space-sm text-on-surface border border-error-container">
              <span className="material-symbols-outlined text-error shrink-0 mt-0.5">timer_off</span>
              <div className="flex flex-col">
                <span className="font-label-lg text-xs font-semibold text-error">
                  ملاحظة التوقيت الزمني لبلاغ الإلغاء:
                </span>
                <span className="font-body-md text-xs text-on-surface-variant mt-0.5">
                  {dispute.reasonDescription}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Incident Investigation & Field Evidence */}
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container-high overflow-hidden">
            <div className="flex items-center justify-between pb-space-sm mb-space-md bg-surface-container-low -mx-space-lg -mt-space-lg px-space-lg py-3 rounded-t-xl border-b border-surface-container-high">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary">policy</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  تحقيق الواقعة وتقرير المشرف الميداني (Incident Investigation)
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-xs font-semibold">
                موثق بالنظام المركزي
              </span>
            </div>

            {/* Telemetry & GPS Tracking Record */}
            {dispute.telemetryEvidence && (
              <div className="p-space-md rounded-xl bg-surface-container-high mb-space-md border border-surface-container-highest">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">fmd_good</span>
                    <span className="font-label-lg text-sm text-on-surface font-bold">
                      بيانات التتبع اللحظي للأسطول (ZoolGo IoT Gateway)
                    </span>
                  </div>
                  <span className="font-label-md text-xs text-on-surface-variant font-mono">
                    كود المركبة: {dispute.telemetryEvidence.vehicleCode}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                    <span>
                      الحالة الفنية: <strong>{dispute.telemetryEvidence.technicalIssue}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <span>
                      الإحداثيات المسجلة: <strong>{dispute.telemetryEvidence.gpsCoordinates}</strong>
                    </span>
                  </div>
                </div>

                {/* Decorative Mini Telemetry Graph */}
                <div className="mt-space-sm pt-space-xs bg-surface-container-lowest rounded-lg p-3 border border-surface-container">
                  <div className="flex justify-between items-center text-xs text-on-surface-variant mb-1">
                    <span>معدل سرعة الحافلة خلال 4 ساعات ماضية</span>
                    <span className="font-tabular-stat text-error font-bold">
                      {dispute.telemetryEvidence.speedLast4Hours}
                    </span>
                  </div>
                  <svg className="w-full h-8 text-error" preserveAspectRatio="none" viewBox="0 0 400 30">
                    <path
                      d="M0,25 L80,25 L85,15 L95,25 L160,25 L165,10 L175,25 L400,25"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                    ></path>
                  </svg>
                </div>
              </div>
            )}

            {/* Terminal Station Supervisor Report */}
            {dispute.supervisorReport && (
              <div className="p-space-md rounded-xl bg-surface-container-low mb-space-md border border-surface-container-high">
                <div className="flex items-start gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 font-bold text-sm">
                    م ك
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-label-lg text-sm text-on-surface font-bold">
                        {dispute.supervisorReport.supervisorName} — {dispute.supervisorReport.supervisorRole}
                      </span>
                      <span className="text-on-surface-variant font-label-md text-xs">
                        {dispute.supervisorReport.reportedAt}
                      </span>
                    </div>
                    <p className="font-body-md text-xs text-on-surface mt-2 leading-relaxed bg-surface-container-lowest p-3 rounded-lg shadow-xs border border-surface-container-high">
                      &quot;{dispute.supervisorReport.statement}&quot;
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Evidence Attachment Previews */}
            {dispute.attachments && (
              <div className="flex flex-col gap-2">
                <span className="font-label-lg text-xs text-on-surface font-semibold">
                  المستندات والمرفقات المقدمة من المسافر والوكيل:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                  {dispute.attachments.map((att, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest shadow-xs hover:bg-surface-container-high transition-colors cursor-pointer border border-surface-container-high"
                    >
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-secondary text-[20px]">
                          {att.type === 'image' ? 'image' : 'chat'}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-label-md text-xs text-on-surface font-medium">
                            {att.name}
                          </span>
                          <span className="text-xs text-on-surface-variant">{att.sizeText}</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                        visibility
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Financial Resolution Engine & Breakdown */}
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container-high overflow-hidden">
            <div className="flex items-center justify-between pb-space-sm mb-space-md bg-surface-container-low -mx-space-lg -mt-space-lg px-space-lg py-3 rounded-t-xl border-b border-surface-container-high">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  محرك التسوية المحاسبية والاحتساب المالي (Financial Resolution Engine)
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-semibold">
                معالجة آلية
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-surface-container-high text-on-surface-variant font-label-md">
                    <th className="p-3 rounded-r-lg">بند التسوية والاحتساب</th>
                    <th className="p-3 text-center">النسبة المطبقة</th>
                    <th className="p-3 text-left">المبلغ الأصلي</th>
                    <th className="p-3 text-left rounded-l-lg">القيمة بعد المعالجة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high font-body-md">
                  <tr className="hover:bg-surface-container-low/50">
                    <td className="p-3 font-medium text-on-surface">إجمالي سعر التذكرة المحصل من العميل</td>
                    <td className="p-3 text-center font-label-md text-on-surface-variant">100%</td>
                    <td className="p-3 text-left font-tabular-stat text-on-surface">
                      {dispute.ticketFareSdg.toFixed(2)} ج.س
                    </td>
                    <td className="p-3 text-left font-tabular-stat font-bold text-on-surface">
                      {dispute.ticketFareSdg.toFixed(2)} ج.س
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50">
                    <td className="p-3 text-on-surface">
                      <div className="flex items-center gap-1.5">
                        <span>رسوم الإلغاء النظامية</span>
                        <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-[10px] font-semibold">
                          معفى بقرار إداري
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-label-md text-secondary font-semibold">0% (إعفاء)</td>
                    <td className="p-3 text-left font-tabular-stat text-on-surface-variant">72.00 ج.س</td>
                    <td className="p-3 text-left font-tabular-stat font-bold text-secondary">0.00 ج.س</td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50">
                    <td className="p-3 text-on-surface">
                      <div className="flex items-center gap-1.5">
                        <span>عمولة منصة ZoolGo المقتطعة مسبقاً (5%)</span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-md text-[10px]">
                          عكس قيد
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-label-md text-on-surface-variant">عكس 100%</td>
                    <td className="p-3 text-left font-tabular-stat text-on-surface-variant">
                      {dispute.platformCommissionDeductionSdg.toFixed(2)} ج.س
                    </td>
                    <td className="p-3 text-left font-tabular-stat font-bold text-primary">
                      - {dispute.platformCommissionDeductionSdg.toFixed(2)} ج.س
                    </td>
                  </tr>
                  <tr className="bg-secondary-container/20 font-bold">
                    <td className="p-3 text-secondary text-sm">صافي المبلغ المعتمد للإرجاع المالي:</td>
                    <td className="p-3 text-center text-secondary">استرداد كامل</td>
                    <td className="p-3 text-left text-on-surface-variant">—</td>
                    <td className="p-3 text-left font-tabular-stat text-sm text-secondary">
                      {dispute.approvedRefundSdg.toFixed(2)} ج.س
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* LEFT COLUMN: Executive Decision & Affected Accounts (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Card 1: Executive Decision Panel */}
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container-high">
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-surface-container-high">
              <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-headline-sm">gavel</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                  لوحة البت الإداري والقرار المالي
                </h3>
                <p className="font-body-sm text-[11px] text-on-surface-variant">Super Admin Adjudication</p>
              </div>
            </div>

            {/* Decision Radio Options */}
            <div className="space-y-2 mb-3">
              <label
                onClick={() => setSelectedDecision('full_refund')}
                className={`flex items-start gap-space-xs p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  selectedDecision === 'full_refund'
                    ? 'border-secondary bg-secondary-container/20'
                    : 'border-surface-container-high bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <input
                  type="radio"
                  name="dispute_decision"
                  checked={selectedDecision === 'full_refund'}
                  onChange={() => setSelectedDecision('full_refund')}
                  className="mt-1 accent-secondary shrink-0"
                />
                <div className="flex flex-col">
                  <span className="font-label-lg text-xs text-on-surface font-semibold">
                    استرداد نقدي كامل 100% (إعفاء من الرسوم)
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                    إلزام الناقل بتحمل التكلفة كاملة بموجب اللائحة
                  </span>
                </div>
              </label>

              <label
                onClick={() => setSelectedDecision('partial_refund')}
                className={`flex items-start gap-space-xs p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  selectedDecision === 'partial_refund'
                    ? 'border-secondary bg-secondary-container/20'
                    : 'border-surface-container-high bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <input
                  type="radio"
                  name="dispute_decision"
                  checked={selectedDecision === 'partial_refund'}
                  onChange={() => setSelectedDecision('partial_refund')}
                  className="mt-1 accent-primary shrink-0"
                />
                <div className="flex flex-col">
                  <span className="font-label-lg text-xs text-on-surface font-semibold">
                    استرداد جزئي (تطبيق نسبة الخصم)
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                    خصم 15% رسوم إدارية وتحميل المسافر
                  </span>
                </div>
              </label>

              <label
                onClick={() => setSelectedDecision('voucher')}
                className={`flex items-start gap-space-xs p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  selectedDecision === 'voucher'
                    ? 'border-secondary bg-secondary-container/20'
                    : 'border-surface-container-high bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <input
                  type="radio"
                  name="dispute_decision"
                  checked={selectedDecision === 'voucher'}
                  onChange={() => setSelectedDecision('voucher')}
                  className="mt-1 accent-primary shrink-0"
                />
                <div className="flex flex-col">
                  <span className="font-label-lg text-xs text-on-surface font-semibold">
                    إصدار قسيمة سفر بديلة صالحة 30 يوماً
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                    إعادة حجز بدون مقابل على أقرب رحلة متاحة
                  </span>
                </div>
              </label>

              <label
                onClick={() => setSelectedDecision('reject')}
                className={`flex items-start gap-space-xs p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  selectedDecision === 'reject'
                    ? 'border-error bg-error-container/20'
                    : 'border-surface-container-high bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <input
                  type="radio"
                  name="dispute_decision"
                  checked={selectedDecision === 'reject'}
                  onChange={() => setSelectedDecision('reject')}
                  className="mt-1 accent-error shrink-0"
                />
                <div className="flex flex-col">
                  <span className="font-label-lg text-xs text-error font-semibold">
                    رفض طلب الاسترداد كلياً
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                    إغلاق النزاع لعدم استيفاء الشروط القانونية
                  </span>
                </div>
              </label>
            </div>

            {/* Admin Justification Notes */}
            <div className="flex flex-col gap-1.5 mb-3">
              <label className="font-label-lg text-xs text-on-surface font-semibold">
                مبررات القرار والملاحظات الإدارية:
              </label>
              <textarea
                value={justificationNotes}
                onChange={(e) => setJustificationNotes(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-xs border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-secondary/40 resize-none"
                rows={3}
              />
            </div>

            {/* Action Checkboxes */}
            <div className="flex flex-col gap-2 mb-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                  className="accent-secondary w-4 h-4 rounded"
                />
                <span className="text-on-surface">إرسال إشعار SMS فوري للمسافر والوكيل بتفاصيل الرد</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postLedger}
                  onChange={(e) => setPostLedger(e.target.checked)}
                  className="accent-secondary w-4 h-4 rounded"
                />
                <span className="text-on-surface">توليد قيد اليومية المزدوج التلقائي في دفتر الأستاذ العام</span>
              </label>
            </div>

            {/* Execution Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => handleExecute('full_refund')}
                type="button"
                className="w-full py-3 rounded-lg bg-primary-container text-on-primary font-label-lg text-xs font-bold shadow-md hover:bg-primary transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>اعتماد الاسترداد والتحويل المالي فوراً</span>
              </button>
              <button
                onClick={() => handleExecute('reject')}
                type="button"
                className="w-full py-2 rounded-lg bg-surface-container-highest text-on-surface font-label-lg text-xs font-medium hover:bg-error-container hover:text-on-error-container transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                <span>رفض الطلب وإشعار العميل</span>
              </button>
            </div>
          </div>

          {/* Card 2: Affected General Ledger Accounts */}
          {dispute.affectedAccountsSummary && (
            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container-high">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-surface-container-high">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[20px]">receipt_long</span>
                  <h3 className="font-headline-sm text-xs font-bold text-on-surface">
                    ملخص الحسابات المتأثرة بالقيد المحاسبي
                  </h3>
                </div>
                <span className="font-label-md text-[10px] px-2 py-0.5 rounded bg-surface-container text-secondary font-bold">
                  قيد عكسي
                </span>
              </div>

              <div className="flex flex-col gap-2 font-body-sm text-xs">
                {/* Debit Entry 1 */}
                <div className="p-2 rounded-lg bg-surface-container-low flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface">من حـ/ مستحقات مبيعات الناقلين</span>
                    <span className="text-on-surface-variant text-[11px]">
                      كود: {dispute.affectedAccountsSummary.debitCarrierCode} — {dispute.carrierName}
                    </span>
                  </div>
                  <div className="text-left font-tabular-stat font-bold text-secondary">
                    (مدين) {dispute.affectedAccountsSummary.debitCarrierSdg.toFixed(2)} ج.س
                  </div>
                </div>

                {/* Debit Entry 2 */}
                <div className="p-2 rounded-lg bg-surface-container-low flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface">من حـ/ إيراد عمولات منصة ZoolGo</span>
                    <span className="text-on-surface-variant text-[11px]">
                      كود: {dispute.affectedAccountsSummary.debitPlatformCode} — عمولة مبيعات مستردة
                    </span>
                  </div>
                  <div className="text-left font-tabular-stat font-bold text-secondary">
                    (مدين) {dispute.affectedAccountsSummary.debitPlatformSdg.toFixed(2)} ج.س
                  </div>
                </div>

                {/* Credit Entry */}
                <div className="p-2 rounded-lg bg-surface-container-high flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold text-primary">إلى حـ/ أرصدة محافظ الوكلاء</span>
                    <span className="text-on-surface-variant text-[11px]">
                      كود: {dispute.affectedAccountsSummary.creditAccountCode} — وكالة النيل للسفر
                    </span>
                  </div>
                  <div className="text-left font-tabular-stat font-bold text-primary">
                    (دائن) {dispute.affectedAccountsSummary.creditAgentOrWalletSdg.toFixed(2)} ج.س
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-surface-container flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
                <span>الختم التشفيري:</span>
                <span className="text-secondary font-bold">SHA-256: {dispute.affectedAccountsSummary.sha256Seal}</span>
              </div>
            </div>
          )}

          {/* Card 3: Passenger & Agency Direct Contacts */}
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container-high">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[20px]">contact_phone</span>
                <h3 className="font-headline-sm text-xs font-bold text-on-surface">بيانات العميل وطرق التواصل</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary font-label-md text-[10px] font-bold">
                مسافر {dispute.passengerTier === 'Silver' ? 'فضي' : dispute.passengerTier === 'Gold' ? 'ذهبي' : 'VIP'}
              </span>
            </div>

            <div className="flex items-center gap-space-sm mb-3">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-sm flex items-center justify-center shrink-0">
                {dispute.passengerName.slice(0, 2)}
              </div>
              <div className="flex flex-col">
                <span className="font-label-lg text-xs text-on-surface font-bold">{dispute.passengerName}</span>
                <span className="text-body-sm text-[11px] text-on-surface-variant">
                  رصيد الرحلات السابقة: {dispute.completedTripsCount} رحلة مكتملة دون نزاعات
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-sm">call</span>
                  <span className="font-tabular-stat font-semibold" dir="ltr">
                    {dispute.passengerPhone}
                  </span>
                </div>
                <button
                  onClick={() => alert(`الاتصال بالرقم ${dispute.passengerPhone}`)}
                  className="text-primary hover:underline font-semibold"
                >
                  اتصال مباشر
                </button>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-sm">mail</span>
                  <span dir="ltr">{dispute.passengerEmail}</span>
                </div>
                <button
                  onClick={() => alert(`إرسال بريد إلى ${dispute.passengerEmail}`)}
                  className="text-primary hover:underline font-semibold"
                >
                  إرسال بريد
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeDossierPage;
