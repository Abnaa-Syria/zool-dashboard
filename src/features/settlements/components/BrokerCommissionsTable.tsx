import React from 'react';
import type { BrokerCommissionItem } from '../types/settlements';

interface BrokerCommissionsTableProps {
  items: BrokerCommissionItem[];
  onCreditWallet: (brokerId: string, amountSdg: number) => void;
  onDisburseBank: (brokerId: string) => void;
}

export const BrokerCommissionsTable: React.FC<BrokerCommissionsTableProps> = ({
  items,
  onCreditWallet,
  onDisburseBank,
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container-high/60">
      <div className="px-space-lg py-4 bg-surface-container-low flex items-center justify-between border-b border-surface-container-high">
        <div>
          <h2 className="font-headline-sm text-sm text-on-surface font-bold">
            عمولات مكاتب الوكلاء المعتمدة ودورات الاستحقاق
          </h2>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            صرف العمولات التشغيلية لمبيعات التذاكر المباشرة وتغذية محافظ الوكلاء الآلية.
          </p>
        </div>
        <span className="font-label-md text-xs text-secondary bg-surface-container-lowest px-2.5 py-1 rounded-md font-bold">
          {items.length} وكالات معتمدة
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-md text-xs h-11 border-b border-surface-container-high">
              <th className="px-space-md py-3 text-right">مكتب الوكالة المعتمد</th>
              <th className="px-space-md py-3 text-right">الفئة والتصنيف</th>
              <th className="px-space-md py-3 text-right">التذاكر المصدرة</th>
              <th className="px-space-md py-3 text-right">نسبة العمولة</th>
              <th className="px-space-md py-3 text-right">العمولة المستحقة للصرف</th>
              <th className="px-space-md py-3 text-right">رصيد المحفظة الحالي</th>
              <th className="px-space-md py-3 text-center">إجراء الصرف</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container text-on-surface font-body-sm text-xs">
            {items.map((item) => (
              <tr key={item.id} className="h-16 hover:bg-surface-container-low/60 transition-colors">
                {/* Broker Name & ID */}
                <td className="px-space-md py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary font-bold">
                      <span className="material-symbols-outlined text-[18px]">storefront</span>
                    </span>
                    <div>
                      <span className="font-bold text-on-surface block">{item.brokerName}</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">{item.brokerId}</span>
                    </div>
                  </div>
                </td>

                {/* Tier */}
                <td className="px-space-md py-2">
                  <span
                    className={`px-2 py-0.5 rounded font-label-md text-[10px] font-bold ${
                      item.agencyTier === 'A'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-surface-container-high text-on-surface'
                    }`}
                  >
                    وكيل فئة ({item.agencyTier})
                  </span>
                </td>

                {/* Tickets Sold */}
                <td className="px-space-md py-2 font-mono font-bold text-xs">
                  {item.ticketsCount} تذكرة
                </td>

                {/* Commission Rate */}
                <td className="px-space-md py-2 text-xs">
                  <span className="font-bold text-on-surface">{item.commissionRatePercent}%</span>
                  <span className="text-[10px] text-on-surface-variant block">من إجمالي المبيعات</span>
                </td>

                {/* Commission Amount */}
                <td className="px-space-md py-2 font-mono font-bold text-sm text-secondary">
                  {item.commissionAmountSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
                </td>

                {/* Wallet Balance */}
                <td className="px-space-md py-2 font-mono text-xs">
                  <span className="text-on-surface font-semibold block">
                    {item.walletBalanceSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
                  </span>
                  <span className="text-[10px] text-secondary font-medium">متاح للحجز المباشر</span>
                </td>

                {/* Actions */}
                <td className="px-space-md py-2 text-center">
                  {item.status === 'credited_to_wallet' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-semibold">
                      <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
                      أودعت بالمحفظة
                    </span>
                  ) : item.status === 'transferred' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-md text-xs font-semibold">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      حُوّلت بنكياً
                    </span>
                  ) : item.payoutPreference === 'wallet_credit' ? (
                    <button
                      type="button"
                      onClick={() => onCreditWallet(item.brokerId, item.commissionAmountSdg)}
                      className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-md text-xs font-bold hover:opacity-90 transition-opacity shadow-xs flex items-center gap-1 mx-auto cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_card</span>
                      <span>إيداع بالمحفظة</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onDisburseBank(item.brokerId)}
                      className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-xs font-bold hover:bg-primary transition-colors shadow-xs flex items-center gap-1 mx-auto cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>تحويل بنكك</span>
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
