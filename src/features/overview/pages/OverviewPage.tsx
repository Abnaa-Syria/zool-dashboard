import * as React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { MetricCard } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime, lastDays } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { BOOKING_STATUS_LABEL, useAdminBookings } from '../../bookings/api';
import { useOverview } from '../api';

const PRESETS = [
  { key: 'today', label: 'اليوم', days: 1 },
  { key: '7days', label: 'آخر 7 أيام', days: 7 },
  { key: '30days', label: 'آخر 30 يومًا', days: 30 },
] as const;

type PresetKey = (typeof PRESETS)[number]['key'];

/** REQ-ADM-10 overview on live data only (no fleet/GMV figures the backend does not produce). */
export const OverviewPage: React.FC = () => {
  const [preset, setPreset] = React.useState<PresetKey>('today');
  const range = React.useMemo(() => lastDays(PRESETS.find((p) => p.key === preset)!.days), [preset]);
  const overview = useOverview(range);
  const recent = useAdminBookings({ page: 1, pageSize: 8 });
  const k = overview.data;

  const actions = k
    ? [
        k.pendingTopUpsCount ? { icon: 'receipt_long', text: `${k.pendingTopUpsCount} طلب شحن بانتظار المراجعة`, to: '/financials/topup-queue', tone: 'warning' as const } : null,
        k.lowBalanceOfficesCount ? { icon: 'account_balance_wallet', text: `${k.lowBalanceOfficesCount} مكتب برصيد منخفض`, to: '/financials/wallets', tone: 'error' as const } : null,
        k.draftSettlementsCount ? { icon: 'currency_exchange', text: `${k.draftSettlementsCount} تسوية عمولات مسودة بانتظار الاعتماد`, to: '/financials/settlements', tone: 'warning' as const } : null,
      ].filter((a): a is NonNullable<typeof a> => a !== null)
    : [];

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-lg">
      <Breadcrumbs items={[{ label: 'الرئيسية والعمليات', path: '/overview' }, { label: 'نظرة عامة' }]} />

      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <h1 className="font-headline-md text-headline-md font-bold text-on-surface">نظرة عامة</h1>
        <div className="flex gap-1 bg-surface-container rounded-lg p-1" role="tablist" aria-label="الفترة">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              role="tab"
              aria-selected={preset === p.key}
              onClick={() => setPreset(p.key)}
              className={`px-3 py-1 rounded-md text-sm ${preset === p.key ? 'bg-surface-container-lowest shadow-sm font-semibold text-on-surface' : 'text-on-surface-variant'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {overview.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : overview.isError ? (
        <ErrorState title="تعذّر تحميل المؤشرات" message={errorMessage(overview.error)} onRetry={() => overview.refetch()} />
      ) : k ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          <MetricCard title="الحجوزات المؤكدة" value={k.bookingsCount.toLocaleString('en-US')} subValue={`ملغاة: ${k.cancelledCount}`} icon="confirmation_number" iconBg="bg-secondary-fixed text-on-secondary-fixed" />
          <MetricCard title="قيمة الحجوزات" value={formatSdg(k.bookingsAmountMinor)} subValue="للحجوزات المؤكدة في الفترة" icon="payments" iconBg="bg-primary-fixed text-on-primary-fixed" />
          {k.walletsBalanceMinor !== undefined && (
            <MetricCard title="أرصدة محافظ الوكلاء" value={formatSdg(k.walletsBalanceMinor)} subValue={`مكاتب برصيد منخفض: ${k.lowBalanceOfficesCount ?? 0}`} icon="account_balance_wallet" />
          )}
          {k.unsettledCommissionMinor !== undefined && (
            <MetricCard title="عمولات غير مسوّاة" value={formatSdg(k.unsettledCommissionMinor)} subValue={`تسويات مسودة: ${k.draftSettlementsCount ?? 0}`} icon="currency_exchange" />
          )}
        </div>
      ) : null}

      {actions.length > 0 && (
        <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md space-y-2">
          <h2 className="font-bold text-on-surface">إجراءات مطلوبة</h2>
          <ul className="space-y-1">
            {actions.map((a) => (
              <li key={a.to}>
                <Link to={a.to} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-surface-container">
                  <span className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-[18px]">{a.icon}</span>
                    {a.text}
                  </span>
                  <Badge variant={a.tone}>مراجعة</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md space-y-space-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-on-surface">أحدث الحجوزات</h2>
          <Link to="/bookings" className="text-sm text-secondary">عرض الكل</Link>
        </div>
        {recent.isLoading ? (
          <Skeleton className="h-40 rounded-lg" />
        ) : recent.isError ? (
          <ErrorState title="تعذّر تحميل الحجوزات" message={errorMessage(recent.error)} onRetry={() => recent.refetch()} />
        ) : !recent.data?.data.length ? (
          <EmptyState title="لا توجد حجوزات بعد" description="ستظهر هنا أحدث الحجوزات فور تأكيدها." icon="confirmation_number" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-on-surface-variant text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">المرجع</th>
                  <th className="py-2 px-2 font-medium">المسار</th>
                  <th className="py-2 px-2 font-medium">الشركة</th>
                  <th className="py-2 px-2 font-medium">القناة</th>
                  <th className="py-2 px-2 font-medium">القيمة</th>
                  <th className="py-2 px-2 font-medium">الحالة</th>
                  <th className="py-2 px-2 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recent.data.data.map((b) => (
                  <tr key={b.id} className="border-t border-surface-container hover:bg-surface-container/50">
                    <td className="py-2 px-2 font-mono text-xs" dir="ltr">
                      <Link to={`/bookings/${b.id}`} className="text-secondary">{b.bookingRef ?? b.id.slice(-8).toUpperCase()}</Link>
                    </td>
                    <td className="py-2 px-2">{b.trip.origin} ← {b.trip.destination}</td>
                    <td className="py-2 px-2">{b.trip.company.name}</td>
                    <td className="py-2 px-2">{b.channel === 'BROKER' ? b.office?.name ?? 'وكيل' : 'تطبيق العميل'}</td>
                    <td className="py-2 px-2 tabular-nums">{formatSdg(b.totalAmountMinor)}</td>
                    <td className="py-2 px-2">
                      <Badge variant={b.status === 'CONFIRMED' ? 'success' : b.status === 'CANCELLED' ? 'error' : 'neutral'}>{BOOKING_STATUS_LABEL[b.status]}</Badge>
                    </td>
                    <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(b.confirmedAt ?? b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
