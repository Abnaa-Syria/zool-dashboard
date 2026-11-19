import React, { useState } from 'react';
import type { CancellationPolicyTier } from '../types/refunds';

interface PolicyTierCardProps {
  tier: CancellationPolicyTier;
  onUpdateTier: (tierId: string, updates: Partial<CancellationPolicyTier>) => void;
}

export const PolicyTierCard: React.FC<PolicyTierCardProps> = ({ tier, onUpdateTier }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [refundPercent, setRefundPercent] = useState(tier.passengerRefundPercent);

  const handleSave = () => {
    const fee = 100 - refundPercent;
    onUpdateTier(tier.tierId, {
      passengerRefundPercent: refundPercent,
      cancellationFeePercent: fee,
    });
    setIsEditing(false);
  };

  const getTierBadgeStyle = () => {
    switch (tier.tierId) {
      case 'T-1':
        return 'bg-secondary-container text-on-secondary-container';
      case 'T-2':
        return 'bg-secondary-fixed text-on-secondary-fixed';
      case 'T-3':
        return 'bg-surface-container-highest text-on-surface-variant';
      case 'T-4':
        return 'bg-error-container text-on-error-container';
    }
  };

  const getTierIcon = () => {
    switch (tier.tierId) {
      case 'T-1':
        return 'verified';
      case 'T-2':
        return 'timelapse';
      case 'T-3':
        return 'warning_amber';
      case 'T-4':
        return 'person_cancel';
    }
  };

  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container-high relative">
      <div className="flex flex-col gap-space-sm">
        {/* Tier Header */}
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-0.5 rounded-full font-label-md text-xs font-semibold ${getTierBadgeStyle()}`}>
            {tier.tierId} — {tier.name}
          </span>
          <span className="material-symbols-outlined text-secondary text-[20px]">{getTierIcon()}</span>
        </div>

        {/* Name & Time Window */}
        <div className="flex flex-col">
          <h3 className="font-label-lg text-label-lg text-on-surface font-bold">{tier.name}</h3>
          <span className="font-body-sm text-xs text-on-surface-variant mt-0.5">{tier.timeWindow}</span>
        </div>

        {/* Refund Bar & Percent */}
        <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-2 mt-1">
          <div className="flex items-baseline justify-between">
            <span className="font-body-sm text-xs text-on-surface-variant">نسبة استرداد المسافر:</span>
            <span
              className={`font-tabular-stat text-sm font-bold ${
                tier.passengerRefundPercent === 0 ? 'text-error' : 'text-secondary'
              }`}
            >
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={refundPercent}
                  onChange={(e) => setRefundPercent(Number(e.target.value))}
                  className="w-16 px-1 py-0.5 text-xs rounded border border-secondary text-center"
                />
              ) : (
                `${tier.passengerRefundPercent}%`
              )}
            </span>
          </div>

          <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden flex">
            <div
              className={`h-2 transition-all ${tier.passengerRefundPercent === 0 ? 'bg-error' : 'bg-secondary'}`}
              style={{ width: `${tier.passengerRefundPercent}%` }}
            ></div>
            {tier.cancellationFeePercent > 0 && (
              <div className="bg-error/60 h-2" style={{ width: `${tier.cancellationFeePercent}%` }}></div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
            <span>رسوم الإلغاء:</span>
            <span className={`font-semibold ${tier.cancellationFeePercent === 0 ? 'text-secondary' : 'text-error'}`}>
              {tier.cancellationFeePercent === 0 ? '0% مجاني' : `${tier.cancellationFeePercent}% اقتطاع تشغيلي`}
            </span>
          </div>
        </div>

        {/* Share Breakdown */}
        <div className="flex flex-col gap-1.5 pt-1 text-xs text-on-surface-variant">
          <div className="flex items-center justify-between">
            <span>تعويض الناقل البري:</span>
            <span className="text-on-surface font-medium">
              {tier.carrierSharePercent === 0 ? 'لا يوجد اقتطاع' : `${tier.carrierSharePercent}%`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>عمولة منصة ZoolGo:</span>
            <span className="text-on-surface font-medium">
              {tier.platformSharePercent === 0 ? 'مستردة بالكامل (0 ج.س)' : `${tier.platformSharePercent}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-space-md pt-space-sm bg-surface-container-low/50 -mx-space-md -mb-space-md px-space-md py-2.5 rounded-b-xl flex items-center justify-between border-t border-surface-container">
        {tier.canEditByAdmin ? (
          isEditing ? (
            <div className="flex items-center gap-2 w-full justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="px-2.5 py-1 bg-secondary text-on-secondary rounded text-xs font-bold shadow-xs"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 bg-surface-container text-on-surface rounded text-xs"
              >
                إلغاء
              </button>
            </div>
          ) : (
            <>
              <span className="font-label-md text-xs text-on-surface">إمكانية التعديل للمسؤول</span>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-secondary font-label-md text-xs hover:underline font-semibold"
              >
                تعديل النسبة
              </button>
            </>
          )
        ) : (
          <>
            <span className="font-label-md text-xs text-secondary font-semibold">
              {tier.tierId === 'T-1' ? 'نشط وإلزامي للكل' : 'لا يقبل الاسترداد الذاتي'}
            </span>
            <span className="material-symbols-outlined text-secondary text-[16px]">
              {tier.tierId === 'T-1' ? 'lock' : 'block'}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
