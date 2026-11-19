import React, { useState } from 'react';
import type { SettlementBatch } from '../types/settlements';

interface SettlementApprovalDrawerProps {
  batch: SettlementBatch | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (batchId: string, approverName: string, sourceAccount: string) => void;
}

export const SettlementApprovalDrawer: React.FC<SettlementApprovalDrawerProps> = ({
  batch,
  isOpen,
  onClose,
  onApprove,
}) => {
  const [sourceAccount, setSourceAccount] = useState('حساب التسويات المركزية - بنك الخرطوم (1900-ZOOL-01)');
  const [approverName] = useState('هشام كمال الدين الفكي (ADM-004)');
  const [confirmSoD, setConfirmSoD] = useState(true);

  if (!isOpen || !batch) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmSoD) return;

    onApprove(batch.id, approverName, sourceAccount);
    onClose();
  };

  return (
    <>
      {/* Backdrop Wash Layer */}
      <div
        className="fixed inset-0 bg-tertiary-container/30 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Left-Anchored Drawer (560px width) */}
      <aside
        aria-label="نافذة اعتماد وصرف دورة التسوية المالية"
        className="fixed top-0 left-0 bottom-0 w-full max-w-[560px] bg-surface-container-lowest z-50 flex flex-col shadow-2xl border-r border-surface-container-high animate-in slide-in-from-left duration-300"
      >
        {/* Drawer Header */}
        <div className="px-space-lg py-space-md bg-surface-container-low shrink-0 flex items-start justify-between border-b border-surface-container-high">
          <div className="space-y-1 pr-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                اعتماد مالي مزدوج (SoD)
              </span>
              <span className="font-mono text-xs text-on-surface-variant font-bold">
                #{batch.id}
              </span>
            </div>
            <h2 className="font-headline-md text-base text-on-surface font-bold pt-1">
              اعتماد وصرف: {batch.title}
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              مراجعة مطابقة الحصص والمصادقة على أمر التحويل البنكي وتوليد قيود اليومية العامة.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-space-lg py-space-md space-y-space-md">
          {/* Summary Financial Box */}
          <div className="bg-surface-container-low/70 rounded-xl p-space-md border border-surface-container-high/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">فترة الدورة التشغيلية:</span>
              <span className="font-bold text-xs text-on-surface">
                {batch.periodStart} — {batch.periodEnd}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">إجمالي التذاكر المشمولة:</span>
              <span className="font-bold text-xs text-secondary font-mono">
                {batch.ticketsCount} تذكرة
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-surface-container">
              <span className="text-xs text-on-surface-variant">إجمالي المبيعات المحصلة:</span>
              <span className="font-mono font-bold text-xs text-on-surface">
                {batch.totalGrossSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">عمولة منصة ZoolGo:</span>
              <span className="font-mono text-xs text-primary font-bold">
                - {batch.platformFeeSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
              </span>
            </div>

            {/* Total Net Payout Highlight */}
            <div className="bg-surface-container-lowest p-3 rounded-lg border border-secondary/30 flex items-center justify-between mt-2">
              <span className="font-bold text-xs text-on-surface">صافي المستحق للصرف الفوري:</span>
              <span className="font-mono font-bold text-base text-secondary">
                {batch.netDisbursementSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
              </span>
            </div>
          </div>

          {/* Source Account Selection */}
          <div className="space-y-1.5">
            <label className="block font-label-md text-xs font-semibold text-on-surface">
              حساب السحب والخصم المصرفي المركزي <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                value={sourceAccount}
                onChange={(e) => setSourceAccount(e.target.value)}
                className="w-full h-11 px-3 pr-4 pl-9 rounded-lg bg-surface-container-low text-on-surface text-xs border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary appearance-none cursor-pointer"
              >
                <option value="حساب التسويات المركزية - بنك الخرطوم (1900-ZOOL-01)">
                  بنك الخرطوم — حساب التسويات الرئيسي (1900-ZOOL-01)
                </option>
                <option value="حساب مخصص عمولات الوكلاء - بنك الخرطوم (1900-COMM-02)">
                  بنك الخرطوم — حساب مخصص الوكلاء (1900-COMM-02)
                </option>
                <option value="حساب بنك فيصل الإسلامي السوداني (8800-FAISAL-01)">
                  بنك فيصل الإسلامي — حساب العمليات الإقليمية (8800-FAISAL-01)
                </option>
              </select>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                expand_more
              </span>
            </div>
          </div>

          {/* Approver Designation */}
          <div className="space-y-1.5">
            <label className="block font-label-md text-xs font-semibold text-on-surface">
              المدقق المالي المعتمد للصرف <span className="text-error">*</span>
            </label>
            <input
              type="text"
              readOnly
              value={approverName}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-xs border border-surface-container font-medium"
            />
          </div>

          {/* Target Beneficiaries Preview */}
          <div className="space-y-2">
            <span className="block font-label-md text-xs font-semibold text-on-surface">
              المستفيدون المشمولون بالصرف في هذه الدورة:
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto bg-surface-container-low/50 p-2.5 rounded-lg border border-surface-container text-xs">
              {batch.carrierItems.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-1 border-b border-surface-container/60 last:border-0">
                  <span className="font-semibold text-on-surface">{c.carrierName}</span>
                  <span className="font-mono text-secondary font-bold">
                    {c.netPayableSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
                  </span>
                </div>
              ))}
              {batch.brokerItems.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-1 border-b border-surface-container/60 last:border-0">
                  <span className="font-semibold text-on-surface">{b.brokerName}</span>
                  <span className="font-mono text-secondary font-bold">
                    {b.commissionAmountSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SoD Compliance Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low/70 border border-surface-container cursor-pointer">
            <input
              type="checkbox"
              required
              checked={confirmSoD}
              onChange={(e) => setConfirmSoD(e.target.checked)}
              className="w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary mt-0.5 shrink-0"
            />
            <div className="text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface font-semibold block mb-0.5">
                تأكيد المطابقة والتدقيق المالي (SoD Verification):
              </strong>
              أؤكد أن مبالغ التسوية تطابقت بنسبة 100% مع تقارير التذاكر المباعة، ولا يوجد أي تعارض تشغيلي أو حجز معلق.
            </div>
          </label>

          {/* Drawer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-surface-container">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-xs hover:bg-surface-dim transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!confirmSoD}
              className="px-5 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-xs font-bold hover:opacity-95 transition-opacity shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">price_check</span>
              <span>اعتماد وصرف الدورة فوراً</span>
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};
