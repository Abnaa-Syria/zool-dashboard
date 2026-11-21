import * as React from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Button } from '../../../components/ui/Button';
import { MetricCard } from '../../../components/ui/Card';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { sudanDate } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { useAuth } from '../../auth/auth-context';
import { exportBookingsCsv, useReportByCarrier, useReportByOffice, useReportSummary } from '../api';
import { MAX_RANGE_DAYS, RANGE_PRESETS, daysInRange, presetRange, validateRange, type DateRange, type RangePresetKey } from '../range';

type Row = { key: string; label: string; to?: string; bookingsCount: number; bookingsAmountMinor: number; commissionAmountMinor: number };

/**
 * REQ-ADM-09 reports on live aggregates: summary, per office, per carrier for a Sudan-day range
 * (≤ 92 days). No trial balance or carrier shares (not part of the approved backend).
 */
export const FinancialReportsPage: React.FC = () => {
  const { can } = useAuth();
  const [preset, setPreset] = React.useState<RangePresetKey>('30days');
  const [custom, setCustom] = React.useState<DateRange>(() => presetRange('30days'));
  const range = React.useMemo(() => (preset === 'custom' ? custom : presetRange(preset)), [preset, custom]);
  const invalid = validateRange(range);
  const enabled = invalid === null;

  const summary = useReportSummary(range, enabled);
  const byOffice = useReportByOffice(range, enabled);
  const byCarrier = useReportByCarrier(range, enabled);
  const [exporting, setExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);
  const today = sudanDate();
  const s = summary.data;

  async function exportCsv() {
    setExporting(true);
    setExportError(null);
    try {
      await exportBookingsCsv(range);
    } catch (e) {
      setExportError(errorMessage(e, 'تعذّر تصدير الملف.'));
    } finally {
      setExporting(false);
    }
  }

  const officeRows: Row[] = (byOffice.data ?? []).map((r) => ({
    key: r.office.id ?? 'unknown',
    label: r.office.name ?? r.office.code ?? r.office.id ?? '—',
    to: r.office.id ? `/brokers/${r.office.id}` : undefined,
    bookingsCount: r.bookingsCount,
    bookingsAmountMinor: r.bookingsAmountMinor,
    commissionAmountMinor: r.commissionAmountMinor,
  }));
  const carrierRows: Row[] = (byCarrier.data ?? []).map((r) => ({
    key: r.company.id,
    label: r.company.name,
    to: `/companies/${r.company.id}`,
    bookingsCount: r.bookingsCount,
    bookingsAmountMinor: r.bookingsAmountMinor,
    commissionAmountMinor: r.commissionAmountMinor,
  }));

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'المالية والتسويات', path: '/financials/wallets' }, { label: 'التقارير' }]} />
      <PageHeader
        title="التقارير المالية"
        subtitle="ملخص الحجوزات والعمولات حسب المكتب وشركة النقل، بتوقيت السودان. الحد الأقصى للفترة 92 يومًا."
        className="mb-0"
        actions={
          can('bookings.view') ? (
            <Button variant="outline" icon="download" isLoading={exporting} disabled={!enabled} onClick={exportCsv}>
              تصدير الحجوزات CSV
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap items-end gap-space-sm">
        <div className="flex flex-wrap gap-1 bg-surface-container rounded-lg p-1" role="tablist" aria-label="الفترة">
          {RANGE_PRESETS.map((p) => (
            <button
              key={p.key}
              role="tab"
              aria-selected={preset === p.key}
              onClick={() => {
                if (p.key === 'custom') setCustom(range);
                setPreset(p.key);
              }}
              className={`px-3 py-1 rounded-md text-sm ${preset === p.key ? 'bg-surface-container-lowest shadow-sm font-semibold text-on-surface' : 'text-on-surface-variant'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <div className="flex items-end gap-2">
            <Input label="من" type="date" value={custom.from} max={custom.to || today} onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))} />
            <Input label="إلى" type="date" value={custom.to} min={custom.from} max={today} onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))} />
          </div>
        )}
        <span className="text-xs text-on-surface-variant pb-2" dir="ltr">
          {range.from} → {range.to} {enabled && `(${daysInRange(range)}/${MAX_RANGE_DAYS})`}
        </span>
      </div>
      {invalid && <p className="text-sm text-error">{invalid}</p>}
      {exportError && <p className="text-sm text-error">{exportError}</p>}

      {!enabled ? null : summary.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : summary.isError ? (
        <ErrorState title="تعذّر تحميل الملخص" message={errorMessage(summary.error)} onRetry={() => summary.refetch()} />
      ) : s ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          <MetricCard title="الحجوزات المؤكدة" value={s.bookingsCount.toLocaleString('en-US')} subValue={`ملغاة: ${s.cancelledCount.toLocaleString('en-US')}`} icon="confirmation_number" iconBg="bg-secondary-fixed text-on-secondary-fixed" />
          <MetricCard title="قيمة الحجوزات المؤكدة" value={formatSdg(s.bookingsAmountMinor)} subValue={`مبالغ الحجوزات الملغاة: ${formatSdg(s.refundedAmountMinor)}`} icon="payments" iconBg="bg-primary-fixed text-on-primary-fixed" />
          <MetricCard title="عمولات الوكلاء" value={formatSdg(s.unsettledCommissionMinor + s.settledCommissionMinor)} subValue={`غير مسوّاة ${formatSdg(s.unsettledCommissionMinor)} · مسوّاة ${formatSdg(s.settledCommissionMinor)}`} icon="currency_exchange" />
          <MetricCard title="أرصدة المحافظ (الآن)" value={formatSdg(s.walletsBalanceMinor)} subValue="الرصيد الحالي، غير مرتبط بالفترة" icon="account_balance_wallet" />
        </div>
      ) : null}

      {enabled && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-md">
          <BreakdownSection title="حسب مكتب الوكيل" firstColumn="المكتب" query={byOffice} rows={officeRows} emptyText="لا توجد حجوزات من مكاتب الوكلاء في هذه الفترة." />
          <BreakdownSection title="حسب شركة النقل" firstColumn="الشركة" query={byCarrier} rows={carrierRows} emptyText="لا توجد حجوزات مؤكدة في هذه الفترة." />
        </div>
      )}
    </div>
  );
};

const BreakdownSection: React.FC<{
  title: string;
  firstColumn: string;
  query: { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown };
  rows: Row[];
  emptyText: string;
}> = ({ title, firstColumn, query, rows, emptyText }) => {
  const chartData = rows.slice(0, 8).map((r) => ({ name: r.label, amount: r.bookingsAmountMinor / 100 }));
  return (
    <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md space-y-space-sm">
      <h2 className="font-bold text-on-surface">{title}</h2>
      {query.isLoading ? (
        <Skeleton className="h-48 rounded-lg" />
      ) : query.isError ? (
        <ErrorState title="تعذّر تحميل التقرير" message={errorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title="لا توجد بيانات" description={emptyText} icon="bar_chart" />
      ) : (
        <>
          <div className="h-56" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#d5eee0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => v.toLocaleString('en-US', { notation: 'compact' })} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} orientation="right" />
                <Tooltip formatter={(v) => [`${Number(v).toLocaleString('en-US')} ج.س`, 'قيمة الحجوزات']} />
                <Bar dataKey="amount" fill="#226a4b" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-on-surface-variant text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">{firstColumn}</th>
                  <th className="py-2 px-2 font-medium">الحجوزات</th>
                  <th className="py-2 px-2 font-medium">القيمة</th>
                  <th className="py-2 px-2 font-medium">العمولة</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="border-t border-surface-container">
                    <td className="py-2 px-2">{r.to ? <Link to={r.to} className="text-secondary font-semibold">{r.label}</Link> : r.label}</td>
                    <td className="py-2 px-2 tabular-nums">{r.bookingsCount.toLocaleString('en-US')}</td>
                    <td className="py-2 px-2 tabular-nums">{formatSdg(r.bookingsAmountMinor)}</td>
                    <td className="py-2 px-2 tabular-nums">{formatSdg(r.commissionAmountMinor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};
