import * as React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { COMMISSION_BEARER_LABEL, describeFee } from '../../carriers/billing';
import type { StatementLine } from '../api';
import { DIRECTION_LABEL, netBreakdown, type StatementTotals } from '../breakdown';

function signed(minor: number): string {
  if (minor === 0) return formatSdg(0);
  return `${minor > 0 ? '+' : '−'} ${formatSdg(Math.abs(minor))}`;
}

/** How the net is built: each component with its sign, then the net and who pays whom. */
export const NetBreakdownCard: React.FC<{ totals: StatementTotals }> = ({ totals }) => {
  const b = netBreakdown(totals);
  const net = b.reportedNetMinor;
  const carrierPays = b.direction === 'CARRIER_PAYS_PLATFORM';

  return (
    <div className="rounded-xl border border-surface-container-high overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-space-md py-2 bg-surface-container/50 text-xs text-on-surface-variant">
        <span>رسوم المنصة: <strong className="text-on-surface">{describeFee(totals.config.feeType, totals.config.feeValue)}</strong></span>
        <span aria-hidden>·</span>
        <span>عمولة الوكيل يتحملها: <strong className="text-on-surface">{COMMISSION_BEARER_LABEL[totals.config.commissionBearer]}</strong></span>
        <span aria-hidden>·</span>
        <span>التذاكر: <strong className="text-on-surface tabular-nums">{totals.ticketsCount}</strong></span>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {b.rows.map((r) => (
            <tr key={r.key} className={`border-t border-surface-container ${r.excluded ? 'text-on-surface-variant' : ''}`}>
              <td className="py-2 px-space-md">
                <span className={r.excluded ? 'line-through' : 'font-medium'}>{r.label}</span>
                {r.hint && <span className="block text-[11px] text-on-surface-variant">{r.hint}</span>}
              </td>
              <td className="py-2 px-space-md text-left tabular-nums whitespace-nowrap" dir="ltr">
                {r.excluded ? `(${formatSdg(r.amountMinor)})` : signed(r.signedMinor)}
              </td>
            </tr>
          ))}
          <tr className="border-t-2 border-outline-variant/60 bg-surface-container/40">
            <td className="py-3 px-space-md font-bold">
              صافي المستحق
              <span className="block text-xs font-semibold mt-0.5">
                <Badge variant={net === 0 ? 'neutral' : carrierPays ? 'warning' : 'success'}>
                  {net === 0 ? 'لا مبالغ مستحقة' : DIRECTION_LABEL[b.direction]}
                </Badge>
              </span>
            </td>
            <td className={`py-3 px-space-md text-left tabular-nums font-bold text-lg whitespace-nowrap ${carrierPays ? 'text-error' : 'text-on-surface'}`} dir="ltr">
              {formatSdg(Math.abs(net))}
            </td>
          </tr>
          <tr className="border-t border-surface-container text-on-surface-variant">
            <td className="py-2 px-space-md">
              نقد في يد الشركة (للعلم)
              <span className="block text-[11px]">حصّله سائقو الشركة نقدًا عند الصعود — خارج صافي المستحق.</span>
            </td>
            <td className="py-2 px-space-md text-left tabular-nums whitespace-nowrap" dir="ltr">{formatSdg(b.cashInHandMinor)}</td>
          </tr>
        </tbody>
      </table>
      {b.mismatch && (
        <p className="px-space-md py-2 text-xs text-error border-t border-surface-container">
          تنبيه: مجموع البنود ({formatSdg(b.netMinor)}) لا يطابق الصافي المحسوب في الخادم ({formatSdg(net)}).
        </p>
      )}
    </div>
  );
};

/** Per-trip lines of the statement. */
export const StatementLinesTable: React.FC<{ lines: StatementLine[] | undefined; carrierBearsCommission: boolean }> = ({ lines, carrierBearsCommission }) => {
  if (!lines || lines.length === 0) {
    return <EmptyState title="لا توجد رحلات في الفترة" description="تُحتسب الرحلات غير الملغاة التي انطلقت خلال الفترة." icon="directions_bus" className="my-0 shadow-none" />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="text-on-surface-variant">
          <tr className="text-right">
            <th className="py-2 px-2 font-medium">الرحلة</th>
            <th className="py-2 px-2 font-medium">الانطلاق</th>
            <th className="py-2 px-2 font-medium">التذاكر</th>
            <th className="py-2 px-2 font-medium">إلكتروني</th>
            <th className="py-2 px-2 font-medium">وكلاء</th>
            <th className="py-2 px-2 font-medium">نقدًا (للعلم)</th>
            <th className="py-2 px-2 font-medium">مستردة</th>
            <th className="py-2 px-2 font-medium">خصم المنصة</th>
            <th className="py-2 px-2 font-medium">رسوم المنصة</th>
            <th className="py-2 px-2 font-medium">عمولة الوكلاء{carrierBearsCommission ? '' : ' (للعلم)'}</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.tripId} className="border-t border-surface-container tabular-nums">
              <td className="py-1.5 px-2 font-mono" dir="ltr">
                <Link to={`/network/trips/${l.tripId}`} className="text-secondary">{l.tripNumber ?? l.tripId.slice(-8).toUpperCase()}</Link>
              </td>
              <td className="py-1.5 px-2 whitespace-nowrap">{formatDateTime(l.departureAt)}</td>
              <td className="py-1.5 px-2">{l.tickets}</td>
              <td className="py-1.5 px-2 whitespace-nowrap">{formatSdg(l.onlineMinor)}</td>
              <td className="py-1.5 px-2 whitespace-nowrap">{formatSdg(l.brokerMinor)}</td>
              <td className="py-1.5 px-2 whitespace-nowrap text-on-surface-variant">{formatSdg(l.cashMinor)}</td>
              <td className="py-1.5 px-2 whitespace-nowrap">{formatSdg(l.refundsMinor)}</td>
              <td className="py-1.5 px-2 whitespace-nowrap">{formatSdg(l.platformDiscountMinor)}</td>
              <td className="py-1.5 px-2 whitespace-nowrap">{formatSdg(l.platformFeeMinor)}</td>
              <td className={`py-1.5 px-2 whitespace-nowrap ${carrierBearsCommission ? '' : 'text-on-surface-variant'}`}>{formatSdg(l.brokerCommissionMinor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
