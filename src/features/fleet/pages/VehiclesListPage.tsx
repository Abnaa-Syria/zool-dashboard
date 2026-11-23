import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { DeleteEntityDialog } from '../../../components/shared/DeleteEntityDialog';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { SearchInput } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { useAuth } from '../../auth/auth-context';
import { useCarriers } from '../../carriers/api';
import { useDebouncedValue } from '../../carriers/useDebouncedValue';
import { Pager, Panel, Select, TableShell, Td, Th } from '../../geo/components/common';
import { usePageReset } from '../../geo/usePageReset';
import {
  SERVICE_CLASS_LABEL,
  useDeleteVehicle,
  useSetVehicleStatus,
  useVehicles,
  VEHICLE_STATUS_LABEL,
  VEHICLE_STATUS_VARIANT,
  type Vehicle,
  type VehicleStatus,
} from '../api';
import { layoutStats } from '../seatLayout';

const PAGE_SIZE = 20;

export const VehiclesListPage: React.FC = () => {
  const { can } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const q = useDebouncedValue(search.trim(), 300);
  const [companyId, setCompanyId] = React.useState('');
  const [status, setStatus] = React.useState<VehicleStatus | ''>('');
  const [page, setPage] = usePageReset(`${q}|${companyId}|${status}`);
  const [deleting, setDeleting] = React.useState<Vehicle | null>(null);
  const remove = useDeleteVehicle();
  const retire = useSetVehicleStatus();
  const canManage = can('fleet.manage');

  const carriers = useCarriers({ pageSize: 100 });
  const vehicles = useVehicles({ page, pageSize: PAGE_SIZE, q: q || undefined, companyId: companyId || undefined, status: status || undefined });
  const rows = vehicles.data?.data ?? [];
  const filtered = Boolean(q || companyId || status);

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'الشبكة والأسطول' }, { label: 'الحافلات' }]} />
      <PageHeader
        title="الحافلات"
        subtitle="حافلات شركات النقل وتخطيط مقاعدها ومزاياها."
        className="mb-0"
        actions={can('fleet.manage') ? <Button icon="add" onClick={() => navigate('/fleet/vehicles/new')}>إضافة حافلة</Button> : null}
      />

      <div className="flex flex-wrap items-center gap-space-sm">
        <div className="w-full sm:w-72">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="بحث باللوحة أو الطراز..." />
        </div>
        <Select aria-label="الشركة" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
          <option value="">كل الشركات</option>
          {(carriers.data?.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select aria-label="الحالة" value={status} onChange={(e) => setStatus(e.target.value as VehicleStatus | '')}>
          <option value="">كل الحالات</option>
          {(Object.keys(VEHICLE_STATUS_LABEL) as VehicleStatus[]).map((s) => <option key={s} value={s}>{VEHICLE_STATUS_LABEL[s]}</option>)}
        </Select>
        {vehicles.data?.meta && <span className="text-xs text-on-surface-variant">{vehicles.data.meta.total.toLocaleString('en-US')} حافلة</span>}
      </div>

      <Panel>
        {vehicles.isLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : vehicles.isError ? (
          <ErrorState title="تعذّر تحميل الحافلات" message={errorMessage(vehicles.error)} onRetry={() => vehicles.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={filtered ? 'لا توجد نتائج مطابقة' : 'لا توجد حافلات بعد'}
            description={filtered ? 'غيّر البحث أو عوامل التصفية.' : 'أضف أول حافلة لشركة نقل.'}
            icon="directions_bus"
          />
        ) : (
          <TableShell
            head={
              <>
                <Th>اللوحة</Th>
                <Th>الطراز</Th>
                <Th>الشركة</Th>
                <Th>الفئة</Th>
                <Th>السعة</Th>
                <Th>المزايا</Th>
                <Th>الحالة</Th>
                <Th className="text-left">إجراءات</Th>
              </>
            }
          >
            {rows.map((v) => {
              const stats = layoutStats(v.seatLayout);
              return (
                <tr
                  key={v.id}
                  className="border-t border-surface-container hover:bg-surface-container/50 cursor-pointer"
                  onClick={() => navigate(`/fleet/vehicles/${v.id}`)}
                >
                  <Td>
                    <Link to={`/fleet/vehicles/${v.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-secondary">{v.plateNumber}</Link>
                  </Td>
                  <Td>{v.model}</Td>
                  <Td>{v.company.name}</Td>
                  <Td>
                    <Badge size="sm" variant={v.serviceClass === 'VIP' ? 'secondary' : 'neutral'}>{SERVICE_CLASS_LABEL[v.serviceClass]}</Badge>
                  </Td>
                  <Td className="tabular-nums">
                    {v.capacity}
                    {stats.womenOnly > 0 && <span className="text-xs text-[#9D174D]"> ({stats.womenOnly} للنساء)</span>}
                  </Td>
                  <Td>
                    <div className="flex gap-1 text-secondary">
                      {v.amenities.map((a) => (
                        <span key={a.code} className="material-symbols-outlined text-[18px]" title={a.value ? `${a.nameAr}: ${a.value}` : a.nameAr}>{a.icon}</span>
                      ))}
                      {v.amenities.length === 0 && <span className="text-on-surface-variant">—</span>}
                    </div>
                  </Td>
                  <Td>
                    <Badge variant={VEHICLE_STATUS_VARIANT[v.status]} dot>{VEHICLE_STATUS_LABEL[v.status]}</Badge>
                  </Td>
                  <Td className="text-left whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" icon="visibility" onClick={() => navigate(`/fleet/vehicles/${v.id}`)}>عرض</Button>
                    {canManage && (
                      <>
                        <Button size="sm" variant="ghost" icon="edit" onClick={() => navigate(`/fleet/vehicles/${v.id}/edit`)}>تعديل</Button>
                        <Button size="sm" variant="ghost" icon="delete" className="text-error" onClick={() => setDeleting(v)}>حذف</Button>
                      </>
                    )}
                  </Td>
                </tr>
              );
            })}
          </TableShell>
        )}
        <Pager meta={vehicles.data?.meta} busy={vehicles.isFetching} onPage={setPage} />
      </Panel>

      <DeleteEntityDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        entityLabel="الحافلة"
        name={deleting?.plateNumber ?? ''}
        description={<p>الحافلة التي لها رحلات أو سجل مواقع GPS لا تُحذف؛ أخرجها من الخدمة بدلًا من ذلك.</p>}
        onDelete={() => remove.mutateAsync(deleting!.id)}
        alternative={
          deleting && deleting.status !== 'RETIRED'
            ? {
                label: 'إخراج من الخدمة',
                description: 'تُعلَّم الحافلة «خارج الخدمة» فلا تظهر في التعيين والجدولة، ويبقى سجل رحلاتها كما هو.',
                run: () => retire.mutateAsync({ id: deleting.id, status: 'RETIRED' }),
              }
            : undefined
        }
      />
    </div>
  );
};
