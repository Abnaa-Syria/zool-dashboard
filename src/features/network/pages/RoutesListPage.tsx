import * as React from 'react';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { useAuth } from '../../auth/auth-context';
import { useCarriers } from '../../carriers/api';
import { Pager } from '../../financials/components/Pager';
import { useRoutes, useStationOptions, useUpdateRoute, type RouteDto } from '../api';
import { RouteFormModal } from '../components/RouteFormModal';
import { selectClass, StationSelect } from '../components/fields';
import { formatDuration } from '../time';

const PAGE_SIZE = 20;

export const RoutesListPage: React.FC = () => {
  const { can } = useAuth();
  const canManage = can('catalog.manage');
  const [companyId, setCompanyId] = React.useState('');
  const [stationId, setStationId] = React.useState('');
  const [active, setActive] = React.useState<'' | 'true' | 'false'>('');
  const [page, setPage] = React.useState(1);
  const [editing, setEditing] = React.useState<RouteDto | null | 'new'>(null);

  const filterKey = `${companyId}|${stationId}|${active}`;
  const [prevKey, setPrevKey] = React.useState(filterKey);
  if (filterKey !== prevKey) {
    setPrevKey(filterKey);
    setPage(1);
  }

  const carriers = useCarriers({ page: 1, pageSize: 100 });
  const stations = useStationOptions();
  const routes = useRoutes({ page, pageSize: PAGE_SIZE, companyId: companyId || undefined, stationId: stationId || undefined, isActive: active || undefined });
  const toggle = useUpdateRoute();
  const rows = routes.data?.data ?? [];
  const meta = routes.data?.meta;
  const filtered = Boolean(companyId || stationId || active);

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'الشبكة والأسطول' }, { label: 'المسارات' }]} />
      <PageHeader
        title="المسارات"
        subtitle="خطوط الشركات الثابتة: محطة الانطلاق والوصول ومحطات التوقف والمدة. تُجدول الرحلات من المسارات النشطة."
        className="mb-0"
        actions={canManage ? <Button icon="add" onClick={() => setEditing('new')}>إضافة مسار</Button> : null}
      />

      <div className="flex flex-wrap items-center gap-space-sm">
        <select aria-label="الشركة" value={companyId} onChange={(e) => setCompanyId(e.target.value)} className={selectClass}>
          <option value="">كل الشركات</option>
          {(carriers.data?.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <StationSelect ariaLabel="المحطة" stations={stations.data ?? []} value={stationId} onChange={setStationId} placeholder="كل المحطات" className="w-56" />
        <select aria-label="الحالة" value={active} onChange={(e) => setActive(e.target.value as '' | 'true' | 'false')} className={selectClass}>
          <option value="">كل الحالات</option>
          <option value="true">نشط</option>
          <option value="false">غير نشط</option>
        </select>
        {meta && <span className="text-xs text-on-surface-variant">{meta.total.toLocaleString('en-US')} مسار</span>}
      </div>

      {toggle.isError && <p className="text-xs text-error">{errorMessage(toggle.error)}</p>}

      <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md">
        {routes.isLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : routes.isError ? (
          <ErrorState title="تعذّر تحميل المسارات" message={errorMessage(routes.error)} onRetry={() => routes.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={filtered ? 'لا توجد نتائج مطابقة' : 'لا توجد مسارات بعد'}
            description={filtered ? 'غيّر عوامل التصفية.' : 'أضف أول مسار لبدء جدولة الرحلات.'}
            icon="route"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-on-surface-variant text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">الرمز</th>
                  <th className="py-2 px-2 font-medium">الشركة</th>
                  <th className="py-2 px-2 font-medium">الانطلاق ← الوصول</th>
                  <th className="py-2 px-2 font-medium">المدة</th>
                  <th className="py-2 px-2 font-medium">التوقفات</th>
                  <th className="py-2 px-2 font-medium">الحالة</th>
                  {canManage && <th className="py-2 px-2 font-medium" />}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-surface-container hover:bg-surface-container/50 align-top">
                    <td className="py-2 px-2 font-mono text-xs" dir="ltr">{r.code ?? '—'}</td>
                    <td className="py-2 px-2">{r.company.name}</td>
                    <td className="py-2 px-2">
                      <div className="font-semibold">{r.originStation.city.nameAr} ← {r.destinationStation.city.nameAr}</div>
                      <div className="text-xs text-on-surface-variant">{r.originStation.nameAr} ← {r.destinationStation.nameAr}</div>
                    </td>
                    <td className="py-2 px-2 tabular-nums">{formatDuration(r.durationMinutes)}</td>
                    <td className="py-2 px-2" title={r.stops.map((s) => s.station.nameAr).join('، ')}>
                      {r.stops.length === 0 ? <span className="text-on-surface-variant">مباشر</span> : r.stops.length}
                    </td>
                    <td className="py-2 px-2">
                      <Badge variant={r.isActive ? 'success' : 'neutral'} dot>{r.isActive ? 'نشط' : 'غير نشط'}</Badge>
                    </td>
                    {canManage && (
                      <td className="py-2 px-2 text-left whitespace-nowrap">
                        <Button size="sm" variant="ghost" icon="edit" onClick={() => setEditing(r)}>تعديل</Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={toggle.isPending}
                          onClick={() => toggle.mutate({ id: r.id, patch: { isActive: !r.isActive } })}
                        >
                          {r.isActive ? 'تعطيل' : 'تفعيل'}
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager meta={meta} busy={routes.isFetching} onPage={setPage} />
      </section>

      {editing && <RouteFormModal route={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
};
