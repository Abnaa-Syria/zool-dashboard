import * as React from 'react';
import { Card, HeroBalanceCard } from '../../../components/ui/Card';
import type { FinancialSummary } from '../../../types/overview';
import { formatCurrency } from '../../../lib/utils';
import { Link } from 'react-router-dom';

export interface FinancialSeparationSummaryProps {
  financials: FinancialSummary;
}

export const FinancialSeparationSummary: React.FC<FinancialSeparationSummaryProps> = ({
  financials,
}) => {
  return (
    <div className="flex flex-col gap-space-sm mb-space-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-tertiary-container text-on-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-bold text-on-surface">
              إدارة السيولة النقدية والمحافظ المسبقة الدفع
            </h2>
            <p className="text-[11px] text-on-surface-variant">
              فصل مالي واضح بين أرصدة الوكلاء المشحونة، العمولات التراكمية، ومطابقات الحوالات البنكية
            </p>
          </div>
        </div>
        <Link
          to="/financials/wallets"
          className="text-xs font-semibold text-secondary hover:text-secondary-fixed-variant flex items-center gap-1 transition-colors"
        >
          <span>عرض التفاصيل المالية</span>
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        {/* Left Column: Hero Balance Card */}
        <HeroBalanceCard
          title="إجمالي أرصدة محافظ الوكلاء (Agency Float)"
          balance={formatCurrency(financials.totalFloat, false)}
          currency={financials.currency}
          secondaryStats={[
            {
              label: 'حوالات بنكية قيد المراجعة',
              value: formatCurrency(financials.pendingBankDeposits),
            },
            {
              label: 'استردادات منفذة',
              value: formatCurrency(financials.totalRefundsProcessed),
            },
          ]}
          actionText="سجل المحافظ"
          onAction={() => window.location.assign('/financials/wallets')}
          className="lg:col-span-1"
        />

        {/* Right Column: Key Financial Concepts Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          {/* Concept 1: Accumulated Unsettled Commissions */}
          <Card className="flex flex-col justify-between text-right">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
              <span className="text-xs font-semibold">العمولات التراكمية غير المسواة</span>
              <span className="material-symbols-outlined text-secondary text-[20px]">
                currency_exchange
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold tabular-nums text-on-surface">
                  {formatCurrency(financials.totalCommissionUnsettled)}
                </span>
              </div>
              <p className="text-[11px] text-outline mt-1 leading-snug">
                عمولات مستحقة لمكاتب الوكلاء يتم صرفها يدوياً بواسطة الإدارة المركزية
              </p>
            </div>
            <div className="mt-space-sm pt-space-xs border-t border-outline-variant/30 flex items-center justify-between text-[11px]">
              <span className="text-on-surface-variant">حالة الدورة:</span>
              <span className="font-semibold text-secondary">الأسبوع 44 (تسوية دورية)</span>
            </div>
          </Card>

          {/* Concept 2: Bank Deposit Verification Queue */}
          <Card className="flex flex-col justify-between text-right">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
              <span className="text-xs font-semibold">إيداعات بنكية بانتظار المطابقة</span>
              <span className="material-symbols-outlined text-primary text-[20px]">
                receipt_long
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold tabular-nums text-primary">
                  {formatCurrency(financials.pendingBankDeposits)}
                </span>
              </div>
              <p className="text-[11px] text-outline mt-1 leading-snug">
                إشعارات تحويل عبر تطبيق بنكك تتطلب مطابقة موظف التدقيق المالي
              </p>
            </div>
            <div className="mt-space-sm pt-space-xs border-t border-outline-variant/30 flex items-center justify-between text-[11px]">
              <span className="text-on-surface-variant">طابور الانتظار:</span>
              <Link
                to="/financials/topup-queue"
                className="font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                <span>4 طلبات معلقة</span>
                <span className="material-symbols-outlined text-[14px]">chevron_left</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
