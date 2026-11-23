import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { Pager, Section } from '../../admin/components/AdminUi';
import { useAuth } from '../../auth/auth-context';
import { RelatedBookingsTable } from '../../bookings/components/RelatedBookingsTable';
import { CARRIER_SETTLEMENT_STATUS_LABEL, useCarrierSettlements } from '../../carrier-settlements/api';
import { DRIVER_STATUS_LABEL, SERVICE_CLASS_LABEL, VEHICLE_STATUS_LABEL, useDrivers, useVehicles } from '../../fleet/api';
import { routeLabel, useRoutes } from '../../network/api';
import { RelatedTripsSection } from '../../network/components/RelatedTripsSection';

const PAGE_SIZE = 10;
const viewLink = 'text-secondary font-medium';
const stop = (e: React.MouseEvent) => e.stopPropagation();

function Loading<T>({ q, empty, children }: { q: { isLoading: boolean; isError: boolean; error: unknown; data?: { data: T[] } }; empty: string; children: (rows: T[]) => React.ReactNode }) {
  if (q.isLoading) return <Skeleton className="h-24 rounded-lg" />;
  if (q.isError) return <p className="text-xs text-error">{errorMessage(q.error)}</p>;
  const rows = q.data?.data ?? [];
  if (rows.length === 0) return <p className="text-sm text-on-surface-variant">{empty}</p>;
  return <>{children(rows)}</>;
}

const total = (meta?: { total: number }) => (meta ? ` (${meta.total.toLocaleString('en-US')})` : '');

const VehiclesSection: React.FC<{ companyId: string }> = ({ companyId }) => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const q = useVehicles({ companyId, page, pageSize: PAGE_SIZE });
  return (
    <Section title={`الحافلات${total(q.data?.meta)}`} actions={<Link to="/fleet/vehicles" className={`${viewLink} text-xs`}>كل الحافلات</Link>}>
      <Loading q={q} empty="لا توجد حافلات لهذه الشركة.">
        {(rows) => (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اللوحة</TableHead>
                <TableHead>الطراز</TableHead>
                <TableHead>المقاعد</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((v) => (
                <TableRow key={v.id} className="cursor-pointer" onClick={() => navigate(`/fleet/vehicles/${v.id}`)}>
                  <TableCell className="font-mono text-xs" dir="ltr">{v.plateNumber}</TableCell>
                  <TableCell>{v.model}</TableCell>
                  <TableCell className="tabular-nums">{v.capacity}</TableCell>
                  <TableCell>{SERVICE_CLASS_LABEL[v.serviceClass]}</TableCell>
                  <TableCell><Badge variant={v.status === 'ACTIVE' ? 'success' : v.status === 'MAINTENANCE' ? 'warning' : 'neutral'} dot>{VEHICLE_STATUS_LABEL[v.status]}</Badge></TableCell>
                  <TableCell><Link to={`/fleet/vehicles/${v.id}`} className={viewLink} onClick={stop}>عرض</Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Loading>
      <Pager meta={q.data?.meta && q.data.meta.totalPages > 1 ? q.data.meta : undefined} onPage={setPage} disabled={q.isFetching} />
    </Section>
  );
};

const DriversSection: React.FC<{ companyId: string }> = ({ companyId }) => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const q = useDrivers({ companyId, page, pageSize: PAGE_SIZE });
  return (
    <Section title={`السائقون${total(q.data?.meta)}`} actions={<Link to="/fleet/drivers" className={`${viewLink} text-xs`}>كل السائقين</Link>}>
      <Loading q={q} empty="لا يوجد سائقون لهذه الشركة.">
        {(rows) => (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الرمز</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((d) => (
                <TableRow key={d.id} className="cursor-pointer" onClick={() => navigate(`/fleet/drivers/${d.id}`)}>
                  <TableCell>{d.displayName}</TableCell>
                  <TableCell className="font-mono text-xs" dir="ltr">{d.driverCode}</TableCell>
                  <TableCell className="font-mono text-xs" dir="ltr">{d.phone ?? '—'}</TableCell>
                  <TableCell><Badge variant={d.status === 'ACTIVE' ? 'success' : 'error'} dot>{DRIVER_STATUS_LABEL[d.status]}</Badge></TableCell>
                  <TableCell><Link to={`/fleet/drivers/${d.id}`} className={viewLink} onClick={stop}>عرض</Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Loading>
      <Pager meta={q.data?.meta && q.data.meta.totalPages > 1 ? q.data.meta : undefined} onPage={setPage} disabled={q.isFetching} />
    </Section>
  );
};

const RoutesSection: React.FC<{ companyId: string }> = ({ companyId }) => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const q = useRoutes({ companyId, page, pageSize: PAGE_SIZE });
  return (
    <Section title={`المسارات${total(q.data?.meta)}`} actions={<Link to="/network/routes" className={`${viewLink} text-xs`}>كل المسارات</Link>}>
      <Loading q={q} empty="لا توجد مسارات لهذه الشركة.">
        {(rows) => (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المسار</TableHead>
                <TableHead>من</TableHead>
                <TableHead>إلى</TableHead>
                <TableHead>التوقفات</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className="cursor-pointer" onClick={() => navigate(`/network/routes/${r.id}`)}>
                  <TableCell className="font-semibold">{routeLabel(r)}</TableCell>
                  <TableCell>{r.originStation.nameAr}</TableCell>
                  <TableCell>{r.destinationStation.nameAr}</TableCell>
                  <TableCell className="tabular-nums">{r.stops.length}</TableCell>
                  <TableCell><Badge variant={r.isActive ? 'success' : 'neutral'} dot>{r.isActive ? 'نشط' : 'غير نشط'}</Badge></TableCell>
                  <TableCell><Link to={`/network/routes/${r.id}`} className={viewLink} onClick={stop}>عرض</Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Loading>
      <Pager meta={q.data?.meta && q.data.meta.totalPages > 1 ? q.data.meta : undefined} onPage={setPage} disabled={q.isFetching} />
    </Section>
  );
};

const SettlementsSection: React.FC<{ companyId: string }> = ({ companyId }) => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const q = useCarrierSettlements({ companyId, page, pageSize: PAGE_SIZE });
  return (
    <Section title={`تسويات الشركة${total(q.data?.meta)}`} actions={<Link to="/financials/carrier-settlements" className={`${viewLink} text-xs`}>كل التسويات</Link>}>
      <Loading q={q} empty="لا توجد تسويات لهذه الشركة.">
        {(rows) => (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الفترة</TableHead>
                <TableHead>التذاكر</TableHead>
                <TableHead>الصافي</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id} className="cursor-pointer" onClick={() => navigate(`/financials/carrier-settlements/${s.id}`)}>
                  <TableCell>{formatDateTime(s.periodFrom)} — {formatDateTime(s.periodTo)}</TableCell>
                  <TableCell className="tabular-nums">{s.ticketsCount}</TableCell>
                  <TableCell className="tabular-nums">{formatSdg(s.netPayableMinor)}</TableCell>
                  <TableCell><Badge variant="neutral">{CARRIER_SETTLEMENT_STATUS_LABEL[s.status] ?? s.status}</Badge></TableCell>
                  <TableCell><Link to={`/financials/carrier-settlements/${s.id}`} className={viewLink} onClick={stop}>عرض</Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Loading>
      <Pager meta={q.data?.meta && q.data.meta.totalPages > 1 ? q.data.meta : undefined} onPage={setPage} disabled={q.isFetching} />
    </Section>
  );
};

/** Everything that belongs to a carrier, each gated by the permission its API needs. */
export const CarrierRelatedSections: React.FC<{ companyId: string }> = ({ companyId }) => {
  const { can } = useAuth();
  return (
    <>
      {can('fleet.view') && (
        <div className="grid gap-space-md xl:grid-cols-2">
          <VehiclesSection companyId={companyId} />
          <DriversSection companyId={companyId} />
        </div>
      )}
      {can('catalog.view') && <RoutesSection companyId={companyId} />}
      {can('catalog.view') && <RelatedTripsSection scope={{ companyId }} title="رحلات الشركة" />}
      {can('bookings.view') && (
        <Section title="حجوزات الشركة">
          <RelatedBookingsTable scope={{ companyId }} hide={['company']} emptyText="لا توجد حجوزات على رحلات هذه الشركة." />
        </Section>
      )}
      {can('carriers.view') && <SettlementsSection companyId={companyId} />}
    </>
  );
};
