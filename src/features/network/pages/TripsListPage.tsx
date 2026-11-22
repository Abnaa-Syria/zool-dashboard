import * as React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { useAuth } from '../../auth/auth-context';
import { useCarriers } from '../../carriers/api';
import { useDebouncedValue } from '../../carriers/useDebouncedValue';
import { Pager } from '../../financials/components/Pager';
import { TRIP_STATUS_LABEL, TRIP_STATUS_VARIANT, useTrips } from '../api';
import { ScheduleTripsModal } from '../components/ScheduleTripsModal';
import { selectClass } from '../components/fields';

const PAGE_SIZE = 20;

/**
 * Trips list from GET /catalog/trips (filters: carrier, origin/destination city text, one Sudan
 * day). Trip number, status, vehicle and driver come from GET /admin/trips/:id per row.
 */
export const TripsListPage: React.FC = () => {
  const { can } = useAuth();
  const [companyId, setCompanyId] = React.useState('');
  const [originText, setOriginText] = React.useState('');
  const [destinationText, setDestinationText] = React.useState('');
  const [date, setDate] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const origin = useDebouncedValue(originText.trim(), 300);
  const destination = useDebouncedValue(destinationText.trim(), 300);

  const filterKey = `${companyId}|${origin}|${destination}|${date}`;
  const [prevKey, setPrevKey] = React.useState(filterKey);
  if (filterKey !== prevKey) {
    setPrevKey(filterKey);
    setPage(1);
  }

  const carriers = useCarriers({ page: 1, pageSize: 100 });
  const trips = useTrips({
    page,
    pageSize: PAGE_SIZE,
    companyId: companyId || undefined,
    origin: origin || undefined,
    destination: destination || undefined,
    date: date || undefined,
  });
  const rows = trips.data?.data ?? [];
  const meta = trips.data?.meta;
  const filtered = Boolean(companyId || origin || destination || date);

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'الشبكة والأسطول' }, { label: 'الرحلات والجدولة' }]} />
      <PageHeader
        title="الرحلات والجدولة"
        subtitle="كل الرحلات بتوقيت السودان. الجدولة تُنشئ رحلات منظّمة من مسار وحافلة وسائق."
        className="mb-0"
        actions={can('catalog.manage') ? <Button icon="event_repeat" onClick={() => setScheduleOpen(true)}>جدولة رحلات</Button> : null}
      />

      <div className="flex flex-wrap items-end gap-space-sm">
        <select aria-label="الشركة" value={companyId} onChange={(e) => setCompanyId(e.target.value)} className={selectClass}>
          <option value="">كل الشركات</option>
          {(carriers.data?.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="w-40"><Input aria-label="من مدينة" placeholder="من (مدينة)" value={originText} onChange={(e) => setOriginText(e.target.value)} /></div>
        <div className="w-40"><Input aria-label="إلى مدينة" placeholder="إلى (مدينة)" value={destinationText} onChange={(e) => setDestinationText(e.target.value)} /></div>
        <input type="date" aria-label="يوم المغادرة" title="يوم المغادرة (توقيت السودان)" value={date} onChange={(e) => setDate(e.target.value)} className={selectClass} />
        {filtered && (
          <Button size="sm" variant="ghost" onClick={() => { setCompanyId(''); setOriginText(''); setDestinationText(''); setDate(''); }}>مسح</Button>
        )}
        {meta && <span className="text-xs text-on-surface-variant">{meta.total.toLocaleString('en-US')} رحلة</span>}
      </div>

      <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md">
        {trips.isLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : trips.isError ? (
          <ErrorState title="تعذّر تحميل الرحلات" message={errorMessage(trips.error)} onRetry={() => trips.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={filtered ? 'لا توجد نتائج مطابقة' : 'لا توجد رحلات بعد'}
            description={filtered ? 'غيّر عوامل التصفية.' : 'جدول رحلات من مسار نشط.'}
            icon="directions_bus"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-on-surface-variant text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">رقم الرحلة</th>
                  <th className="py-2 px-2 font-medium">المسار</th>
                  <th className="py-2 px-2 font-medium">المغادرة</th>
                  <th className="py-2 px-2 font-medium">الحافلة</th>
                  <th className="py-2 px-2 font-medium">السائق</th>
                  <th className="py-2 px-2 font-medium">الحالة</th>
                  <th className="py-2 px-2 font-medium">المباع / الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => {
                  return (
                    <tr key={t.id} className="border-t border-surface-container hover:bg-surface-container/50">
                      <td className="py-2 px-2">
                        <Link to={`/network/trips/${t.id}`} className="font-mono text-xs text-secondary font-semibold" dir="ltr">
                          {t.tripNumber ?? t.id.slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="py-2 px-2">
                        <div>{t.origin} ← {t.destination}</div>
                        <div className="text-xs text-on-surface-variant">
                          {t.company.name}{t.route?.code ? <> · <span dir="ltr">{t.route.code}</span></> : null}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-on-surface-variant whitespace-nowrap">{formatDateTime(t.departureAt)}</td>
                      <td className="py-2 px-2">{t.vehicle?.plateNumber ?? '—'}</td>
                      <td className="py-2 px-2">{t.driver?.displayName ?? <span className="text-on-surface-variant">غير معيّن</span>}</td>
                      <td className="py-2 px-2">
                        <Badge variant={TRIP_STATUS_VARIANT[t.status]} dot>{TRIP_STATUS_LABEL[t.status]}</Badge>
                      </td>
                      <td className="py-2 px-2 tabular-nums">
                        {t.seats.sold} / {t.seats.total}
                        {t.seats.held > 0 && <span className="text-[11px] text-on-surface-variant"> (+{t.seats.held} محجوز مؤقتًا)</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pager meta={meta} busy={trips.isFetching} onPage={setPage} />
      </section>

      {scheduleOpen && <ScheduleTripsModal onClose={() => setScheduleOpen(false)} />}
    </div>
  );
};
