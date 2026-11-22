import * as React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button, IconButton } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { SearchInput } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { useAuth } from '../../auth/auth-context';
import { useDebouncedValue } from '../../carriers/useDebouncedValue';
import { useCities, useStations, useUpdateCity, type City } from '../api';
import { CityModal } from '../components/CityModal';
import { ConfirmDialog, Pager, Panel, Select, TableShell, Td, Th } from '../components/common';
import { usePageReset } from '../usePageReset';

const PAGE_SIZE = 50;

const CityStations: React.FC<{ city: City }> = ({ city }) => {
  const stations = useStations({ cityId: city.id, pageSize: 100 });
  if (stations.isLoading) return <Skeleton className="h-10 rounded-lg" />;
  if (stations.isError) return <p className="text-xs text-error">{errorMessage(stations.error)}</p>;
  const rows = stations.data?.data ?? [];
  if (rows.length === 0) return <p className="text-xs text-on-surface-variant">لا توجد محطات في هذه المدينة.</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {rows.map((s) => (
        <li key={s.id} className="flex items-center gap-1.5 rounded-lg border border-surface-container-high bg-surface-container-lowest px-2.5 py-1 text-xs">
          <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
          <span className="font-medium">{s.nameAr}</span>
          <span className="text-on-surface-variant" dir="ltr">{s.nameEn}</span>
          {!s.isActive && <Badge size="sm" variant="neutral">غير نشطة</Badge>}
        </li>
      ))}
    </ul>
  );
};

export const CitiesPage: React.FC = () => {
  const { can } = useAuth();
  const canManage = can('geo.manage');
  const [search, setSearch] = React.useState('');
  const q = useDebouncedValue(search.trim(), 300);
  const [active, setActive] = React.useState<'' | 'true' | 'false'>('');
  const [page, setPage] = usePageReset(`${q}|${active}`);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [modal, setModal] = React.useState<{ city?: City } | null>(null);
  const [toggling, setToggling] = React.useState<City | null>(null);
  const update = useUpdateCity();

  const cities = useCities({ page, pageSize: PAGE_SIZE, q: q || undefined, isActive: active === '' ? undefined : active === 'true' });
  const rows = cities.data?.data ?? [];
  const filtered = Boolean(q || active);

  const confirmToggle = () => {
    if (!toggling) return;
    update.mutate({ id: toggling.id, patch: { isActive: !toggling.isActive } }, { onSuccess: () => setToggling(null) });
  };

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'الشبكة والأسطول' }, { label: 'المدن' }]} />
      <PageHeader
        title="المدن"
        subtitle="المدن التي تربطها الرحلات ومحطاتها. ترتيب العرض والمدن الشائعة يظهران في تطبيق المسافر."
        className="mb-0"
        actions={canManage ? <Button icon="add" onClick={() => setModal({})}>إضافة مدينة</Button> : null}
      />

      <div className="flex flex-wrap items-center gap-space-sm">
        <div className="w-full sm:w-80">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="بحث بالرمز أو الاسم..." />
        </div>
        <Select aria-label="الحالة" value={active} onChange={(e) => setActive(e.target.value as typeof active)}>
          <option value="">كل الحالات</option>
          <option value="true">نشطة</option>
          <option value="false">غير نشطة</option>
        </Select>
        {cities.data?.meta && <span className="text-xs text-on-surface-variant">{cities.data.meta.total.toLocaleString('en-US')} مدينة</span>}
      </div>

      <Panel>
        {cities.isLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : cities.isError ? (
          <ErrorState title="تعذّر تحميل المدن" message={errorMessage(cities.error)} onRetry={() => cities.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={filtered ? 'لا توجد نتائج مطابقة' : 'لا توجد مدن بعد'}
            description={filtered ? 'غيّر البحث أو عامل التصفية.' : 'أضف أول مدينة لبدء إنشاء المحطات والرحلات.'}
            icon="location_city"
          />
        ) : (
          <TableShell
            head={
              <>
                <Th className="w-8" />
                <Th>الرمز</Th>
                <Th>الاسم</Th>
                <Th>شائعة</Th>
                <Th>الترتيب</Th>
                <Th>الحالة</Th>
                <Th>المحطات</Th>
                {canManage && <Th className="text-left">إجراءات</Th>}
              </>
            }
          >
            {rows.map((c) => {
              const open = expanded === c.id;
              return (
                <React.Fragment key={c.id}>
                  <tr className="border-t border-surface-container hover:bg-surface-container/50">
                    <Td>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={open ? 'expand_less' : 'expand_more'}
                        label={open ? 'إخفاء المحطات' : 'عرض المحطات'}
                        onClick={() => setExpanded(open ? null : c.id)}
                        aria-expanded={open}
                      />
                    </Td>
                    <Td className="font-mono text-xs" dir="ltr">{c.code}</Td>
                    <Td>
                      <div className="font-semibold">{c.nameAr}</div>
                      <div className="text-xs text-on-surface-variant" dir="ltr">{c.nameEn}</div>
                    </Td>
                    <Td>{c.isPopular ? <span className="material-symbols-outlined text-[18px] text-[#B45309]" title="شائعة">star</span> : '—'}</Td>
                    <Td className="tabular-nums">{c.sortOrder}</Td>
                    <Td>
                      <Badge variant={c.isActive ? 'success' : 'neutral'} dot>{c.isActive ? 'نشطة' : 'غير نشطة'}</Badge>
                    </Td>
                    <Td>
                      <Link to={`/network/stations?cityId=${c.id}`} className="text-secondary font-medium tabular-nums">
                        {c.stationCount.toLocaleString('en-US')} محطة
                      </Link>
                    </Td>
                    {canManage && (
                      <Td className="text-left whitespace-nowrap">
                        <Button size="sm" variant="ghost" icon="edit" onClick={() => setModal({ city: c })}>تعديل</Button>
                        <Button size="sm" variant="ghost" icon={c.isActive ? 'toggle_off' : 'toggle_on'} onClick={() => setToggling(c)}>
                          {c.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                        </Button>
                      </Td>
                    )}
                  </tr>
                  {open && (
                    <tr className="bg-surface-container/30">
                      <td colSpan={canManage ? 8 : 7} className="px-4 py-3">
                        <CityStations city={c} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </TableShell>
        )}
        <Pager meta={cities.data?.meta} busy={cities.isFetching} onPage={setPage} />
      </Panel>

      <CityModal city={modal?.city} open={modal !== null} onOpenChange={(o) => !o && setModal(null)} />
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
        onConfirm={confirmToggle}
      >
        {toggling?.isActive
          ? 'ستُعلَّم المدينة كغير نشطة في البيانات المرجعية. محطاتها والرحلات والحجوزات القائمة لا تُحذف ولا تتغير.'
          : 'ستعود المدينة نشطة في البيانات المرجعية.'}
      </ConfirmDialog>
    </div>
  );
};
