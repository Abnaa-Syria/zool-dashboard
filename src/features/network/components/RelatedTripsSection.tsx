import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatSdg } from '../../../lib/money';
import { Section } from '../../admin/components/AdminUi';
import { Pager } from '../../financials/components/Pager';
import { TRIP_STATUS_LABEL, TRIP_STATUS_VARIANT, useTrips, type TripFilters } from '../api';
import { formatSudanFull } from '../time';

type Scope = Pick<TripFilters, 'routeId' | 'vehicleId' | 'driverId' | 'companyId'>;

/** Paginated trips of one route / vehicle / driver (GET /catalog/trips), rows open the trip page. */
export const RelatedTripsSection: React.FC<{
  scope: Scope;
  title?: string;
  /** Hide the column that equals the scope (e.g. the vehicle on a vehicle page). */
  hide?: Array<'vehicle' | 'driver' | 'route'>;
  actions?: React.ReactNode;
}> = ({ scope, title = 'الرحلات', hide = [], actions }) => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const trips = useTrips({ page, pageSize: 10, ...scope });
  const rows = trips.data?.data ?? [];
  const meta = trips.data?.meta;
  const show = (c: 'vehicle' | 'driver' | 'route') => !hide.includes(c);

  return (
    <Section title={meta ? `${title} (${meta.total.toLocaleString('en-US')})` : title} actions={actions}>
      {trips.isLoading ? (
        <Skeleton className="h-32 rounded-lg" />
      ) : trips.isError ? (
        <ErrorState title="تعذّر تحميل الرحلات" message={errorMessage(trips.error)} onRetry={() => trips.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title="لا توجد رحلات" description="لم تُجدول رحلات هنا بعد." icon="directions_bus" className="my-0" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-on-surface-variant text-xs">
              <tr className="text-right">
                <th className="py-2 px-2 font-medium">رقم الرحلة</th>
                {show('route') && <th className="py-2 px-2 font-medium">المسار</th>}
                <th className="py-2 px-2 font-medium">المغادرة</th>
                {show('vehicle') && <th className="py-2 px-2 font-medium">الحافلة</th>}
                {show('driver') && <th className="py-2 px-2 font-medium">السائق</th>}
                <th className="py-2 px-2 font-medium">السعر</th>
                <th className="py-2 px-2 font-medium">الحالة</th>
                <th className="py-2 px-2 font-medium">المباع / الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-surface-container hover:bg-surface-container/50 cursor-pointer"
                  onClick={() => navigate(`/network/trips/${t.id}`)}
                >
                  <td className="py-2 px-2">
                    <Link
                      to={`/network/trips/${t.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-mono text-xs text-secondary font-semibold"
                      dir="ltr"
                    >
                      {t.tripNumber ?? t.id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  {show('route') && (
                    <td className="py-2 px-2">
                      {t.origin} ← {t.destination}
                    </td>
                  )}
                  <td className="py-2 px-2 whitespace-nowrap text-on-surface-variant">{formatSudanFull(t.departureAt)}</td>
                  {show('vehicle') && <td className="py-2 px-2">{t.vehicle?.plateNumber ?? '—'}</td>}
                  {show('driver') && <td className="py-2 px-2">{t.driver?.displayName ?? <span className="text-on-surface-variant">غير معيّن</span>}</td>}
                  <td className="py-2 px-2 tabular-nums whitespace-nowrap">{formatSdg(t.basePrice)}</td>
                  <td className="py-2 px-2">
                    <Badge variant={TRIP_STATUS_VARIANT[t.status]} dot>
                      {TRIP_STATUS_LABEL[t.status]}
                    </Badge>
                  </td>
                  <td className="py-2 px-2 tabular-nums">
                    {t.seats.sold} / {t.seats.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager meta={meta} busy={trips.isFetching} onPage={setPage} />
    </Section>
  );
};
