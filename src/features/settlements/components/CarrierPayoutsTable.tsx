import React from 'react';
import type { CarrierSettlementItem } from '../types/settlements';

interface CarrierPayoutsTableProps {
  items: CarrierSettlementItem[];
  onDisburseCarrier: (carrierId: string) => void;
}

export const CarrierPayoutsTable: React.FC<CarrierPayoutsTableProps> = ({
  items,
  onDisburseCarrier,
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container-high/60">
      <div className="px-space-lg py-4 bg-surface-container-low flex items-center justify-between border-b border-surface-container-high">
        <div>
          <h2 className="font-headline-sm text-sm text-on-surface font-bold">
            استحقاقات شركات النقل البري ومطابقة الحصص الصافية
          </h2>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            تصفية إجمالي مبيعات التذاكر، اقتطاع عمولة المنصة المعتمدة (4.5% - 5%)، والتحويل للحساب المصرفي.
          </p>
        </div>
        <span className="font-label-md text-xs text-secondary bg-surface-container-lowest px-2.5 py-1 rounded-md font-bold">
          {items.length} شركات نقل نشطة
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-md text-xs h-11 border-b border-surface-container-high">
              <th className="px-space-md py-3 text-right">شركة النقل المعتمدة</th>
              <th className="px-space-md py-3 text-right">عدد التذاكر</th>
              <th className="px-space-md py-3 text-right">إجمالي المبيعات</th>
              <th className="px-space-md py-3 text-right">عمولة ZoolGo</th>
              <th className="px-space-md py-3 text-right">صافي المستحق للصرف</th>
              <th className="px-space-md py-3 text-right">الحساب البنكي المعتمد</th>
              <th className="px-space-md py-3 text-center">إجراء التحويل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container text-on-surface font-body-sm text-xs">
            {items.map((item) => (
              <tr key={item.id} className="h-16 hover:bg-surface-container-low/60 transition-colors">
                {/* Carrier Name & Code */}
                <td className="px-space-md py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary font-bold">
                      <span className="material-symbols-outlined text-[18px]">directions_bus</span>
                    </span>
                    <div>
                      <span className="font-bold text-on-surface block">{item.carrierName}</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">{item.carrierId}</span>
                    </div>
                  </div>
                </td>

                {/* Tickets Count */}
                <td className="px-space-md py-2 font-mono font-bold text-xs">
                  {item.ticketsCount} تذكرة
                </td>

                {/* Gross Sales */}
                <td className="px-space-md py-2 font-mono text-xs">
                  {item.grossSalesSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
                </td>

                {/* Platform Commission */}
                <td className="px-space-md py-2 text-xs">
                  <span className="text-primary font-mono font-medium block">
                    - {item.platformCommissionSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-semibold">
                    ({item.platformCommissionPercent}%)
                  </span>
                </td>

                {/* Net Payable */}
                <td className="px-space-md py-2 font-mono font-bold text-sm text-secondary">
                  {item.netPayableSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
                </td>

                {/* Bank Account */}
                <td className="px-space-md py-2 text-xs">
                  <span className="font-semibold text-on-surface block">{item.bankName}</span>
                  <span className="text-[11px] font-mono text-on-surface-variant block mt-0.5" dir="ltr">
                    Acc: {item.bankAccountNumber}
                  </span>
                </td>

                {/* Status & Action */}
                <td className="px-space-md py-2 text-center">
                  {item.status === 'transferred' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-semibold">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      تم التحويل
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onDisburseCarrier(item.carrierId)}
                      className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-md text-xs font-bold hover:opacity-90 transition-opacity shadow-xs flex items-center gap-1 mx-auto cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>صرف الحصة</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
