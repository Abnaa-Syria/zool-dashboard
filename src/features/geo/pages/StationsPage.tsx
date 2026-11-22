import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { SearchInput } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { useAuth } from '../../auth/auth-context';
import { useDebouncedValue } from '../../carriers/useDebouncedValue';
import { useAllCities, useStations, useUpdateStation, type Station } from '../api';
import { ConfirmDialog, Pager, Panel, Select, TableShell, Td, Th } from '../components/common';
import { StationModal } from '../components/StationModal';
import { usePageReset } from '../usePageReset';

const PAGE_SIZE = 50;

export const StationsPage: React.FC = () => {
  const { can } = useAuth();
  const canManage = can('geo.manage');
  const [params, setParams] = useSearchParams();
  const cityId = params.get('cityId') ?? '';
  const [search, setSearch] = React.useState('');
  const q = useDebouncedValue(search.trim(), 300);
  const [active, setActive] = React.useState<'' | 'true' | 'false'>('');
  const [page, setPage] = usePageReset(`${cityId}|${q}|${active}`);
  const [modal, setModal] = React.useState<{ station?: Station } | null>(null);
  const [toggling, setToggling] = React.useState<Station | null>(null);
  const update = useUpdateStation();

  const cities = useAllCities();
  const stations = useStations({
    page,
    pageSize: PAGE_SIZE,
    cityId: cityId || undefined,
    q: q || undefined,
    isActive: active === '' ? undefined : active === 'true',
  });
  const rows = stations.data?.data ?? [];
  const filtered = Boolean(cityId || q || active);

  const setCity = (id: string) => {
    const next = new URLSearchParams(params);
    if (id) next.set('cityId', id);
    else next.delete('cityId');
    setParams(next, { replace: true });
  };

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'الشبكة والأسطول' }, { label: 'المدن', path: '/network/cities' }, { label: 'المحطات' }]} />
      <PageHeader
        title="المحطات"
        subtitle="نقاط الصعود والنزول داخل كل مدينة."
        className="mb-0"
        actions={canManage ? <Button icon="add" onClick={() => setModal({})}>إضافة محطة</Button> : null}
      />

      <div className="flex flex-wrap items-center gap-space-sm">
        <div className="w-full sm:w-72">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="بحث باسم المحطة..." />
        </div>
        <Select aria-label="المدينة" value={cityId} onChange={(e) => setCity(e.target.value)}>
          <option value="">كل المدن</option>
          {(cities.data?.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.nameAr}</option>
          ))}
        </Select>
        <Select aria-label="الحالة" value={active} onChange={(e) => setActive(e.target.value as typeof active)}>
          <option value="">كل الحالات</option>
          <option value="true">نشطة</option>
          <option value="false">غير نشطة</option>
        </Select>
        {stations.data?.meta && <span className="text-xs text-on-surface-variant">{stations.data.meta.total.toLocaleString('en-US')} محطة</span>}
      </div>

      <Panel>
        {stations.isLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : stations.isError ? (
          <ErrorState title="تعذّر تحميل المحطات" message={errorMessage(stations.error)} onRetry={() => stations.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={filtered ? 'لا توجد نتائج مطابقة' : 'لا توجد محطات بعد'}
            description={filtered ? 'غيّر البحث أو عوامل التصفية.' : 'أضف أول محطة لمدينة.'}
            icon="pin_drop"
          />
        ) : (
          <TableShell
            head={
              <>
                <Th>المحطة</Th>
                <Th>المدينة</Th>
                <Th>العنوان</Th>
                <Th>الموقع</Th>
                <Th>الحالة</Th>
                {canManage && <Th className="text-left">إجراءات</Th>}
              </>
            }
          >
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-surface-container hover:bg-surface-container/50">
                <Td>
                  <div className="font-semibold">{s.nameAr}</div>
                  <div className="text-xs text-on-surface-variant" dir="ltr">{s.nameEn}</div>
                </Td>
                <Td>
                  {s.city.nameAr} <span className="font-mono text-xs text-on-surface-variant" dir="ltr">{s.city.code}</span>
                </Td>
                <Td className="text-xs max-w-[16rem] truncate" title={s.address ?? undefined}>{s.address ?? '—'}</Td>
                <Td className="text-xs">
                  {s.latitude !== null && s.longitude !== null ? (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${s.latitude}&mlon=${s.longitude}#map=16/${s.latitude}/${s.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-secondary font-mono"
                      dir="ltr"
                    >
                      {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                    </a>
                  ) : (
                    '—'
                  )}
                </Td>
                <Td>
                  <Badge variant={s.isActive ? 'success' : 'neutral'} dot>{s.isActive ? 'نشطة' : 'غير نشطة'}</Badge>
                </Td>
                {canManage && (
                  <Td className="text-left whitespace-nowrap">
                    <Button size="sm" variant="ghost" icon="edit" onClick={() => setModal({ station: s })}>تعديل</Button>
                    <Button size="sm" variant="ghost" icon={s.isActive ? 'toggle_off' : 'toggle_on'} onClick={() => setToggling(s)}>
                      {s.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                    </Button>
                  </Td>
                )}
              </tr>
            ))}
          </TableShell>
        )}
        <Pager meta={stations.data?.meta} busy={stations.isFetching} onPage={setPage} />
      </Panel>

      <StationModal station={modal?.station} defaultCityId={cityId || undefined} open={modal !== null} onOpenChange={(o) => !o && setModal(null)} />
      <ConfirmDialog
        open={toggling !== null}
        onOpenChange={(o) => {
          if (!o) {
            setToggling(null);
            update.reset();
          }
        }}
        title={toggling?.isActive ? `إلغاء تفعيل ${toggling.nameAr}؟` : `تفعيل ${toggling?.nameAr ?? ''}؟`}
        confirmText={toggling?.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
        danger={toggling?.isActive}
        pending={update.isPending}
        error={update.error}
        onConfirm={() => toggling && update.mutate({ id: toggling.id, patch: { isActive: !toggling.isActive } }, { onSuccess: () => setToggling(null) })}
      >
        {toggling?.isActive
          ? 'ستُعلَّم المحطة كغير نشطة. الرحلات والحجوزات القائمة لا تُحذف ولا تتغير.'
          : 'ستعود المحطة نشطة.'}
      </ConfirmDialog>
    </div>
  );
};
