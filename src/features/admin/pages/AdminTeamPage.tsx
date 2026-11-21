import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { SearchInput } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { formatDateTime } from '../../../lib/dates';
import { useAuth } from '../../auth/auth-context';
import { adminErrorMessage, useAdmins, useRoles } from '../api';
import { AdminStatusBadge, Pager } from '../components/AdminUi';
import { CreateAdminModal } from '../components/CreateAdminModal';

const PAGE_SIZE = 50;

const STATUS_FILTERS = [
  { key: '', label: 'الكل' },
  { key: 'ACTIVE', label: 'نشط' },
  { key: 'SUSPENDED', label: 'موقوف' },
] as const;

/** GET /admins — server pagination; search & status filter the loaded page (API has no filters). */
export const AdminTeamPage: React.FC = () => {
  const { can, admin: me } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<string>('');
  const [createOpen, setCreateOpen] = React.useState(false);

  const admins = useAdmins({ page, pageSize: PAGE_SIZE });
  const canCreate = can('admins.create');
  const roles = useRoles(canCreate && can('roles.view'));

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return (admins.data?.data ?? []).filter((a) => {
      if (status && a.status !== status) return false;
      if (!q) return true;
      const phone = a.identities.find((i) => i.type === 'PHONE')?.value ?? '';
      return a.displayName.toLowerCase().includes(q) || a.employeeCode.toLowerCase().includes(q) || phone.includes(q);
    });
  }, [admins.data, search, status]);

  const loaded = admins.data?.data ?? [];
  const activeCount = loaded.filter((a) => a.status === 'ACTIVE').length;
  const suspendedCount = loaded.filter((a) => a.status === 'SUSPENDED').length;

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-lg">
      <Breadcrumbs items={[{ label: 'إدارة النظام' }, { label: 'فريق الإدارة' }]} />

      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface">فريق الإدارة</h1>
            {admins.data?.meta && <Badge variant="secondary">{admins.data.meta.total} مشرف</Badge>}
          </div>
          <p className="text-xs text-on-surface-variant mt-1">حسابات مشرفي لوحة ZoolGo وأدوارهم وحالة الوصول.</p>
        </div>
        {canCreate && (
          <Button icon="person_add" onClick={() => setCreateOpen(true)}>
            إضافة مشرف
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-space-sm">
        <div className="md:w-80">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="بحث بالاسم أو الرقم الوظيفي أو الهاتف" />
        </div>
        <div className="flex gap-1 bg-surface-container rounded-lg p-1" role="tablist" aria-label="الحالة">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.key}
              role="tab"
              aria-selected={status === s.key}
              onClick={() => setStatus(s.key)}
              className={`px-3 py-1 rounded-md text-sm ${status === s.key ? 'bg-surface-container-lowest shadow-sm font-semibold text-on-surface' : 'text-on-surface-variant'}`}
            >
              {s.label}
              {s.key === 'ACTIVE' && admins.data ? ` (${activeCount})` : s.key === 'SUSPENDED' && admins.data ? ` (${suspendedCount})` : ''}
            </button>
          ))}
        </div>
        {admins.data?.meta && admins.data.meta.totalPages > 1 && (search || status) && (
          <span className="text-[11px] text-outline">التصفية تشمل الصفحة الحالية فقط.</span>
        )}
      </div>

      {admins.isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : admins.isError ? (
        <ErrorState title="تعذّر تحميل فريق الإدارة" message={adminErrorMessage(admins.error)} onRetry={() => admins.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={loaded.length ? 'لا توجد نتائج مطابقة' : 'لا يوجد مشرفون'}
          description={loaded.length ? 'غيّر عبارة البحث أو عامل تصفية الحالة.' : undefined}
          icon="shield_person"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المشرف</TableHead>
              <TableHead>الرقم الوظيفي</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>الأدوار</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>آخر دخول</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((a) => {
              const phone = a.identities.find((i) => i.type === 'PHONE' && i.isPrimary) ?? a.identities.find((i) => i.type === 'PHONE');
              return (
                <TableRow key={a.id} className="cursor-pointer" onClick={() => navigate(`/admin/team/${a.id}`)}>
                  <TableCell>
                    <Link to={`/admin/team/${a.id}`} className="font-semibold text-on-surface hover:text-secondary" onClick={(e) => e.stopPropagation()}>
                      {a.displayName}
                    </Link>
                    <div className="flex gap-1 mt-0.5">
                      {a.isBootstrap && <Badge size="sm" variant="warning">تأسيسي</Badge>}
                      {me?.id === a.id && <Badge size="sm" variant="info">أنت</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs" dir="ltr">{a.employeeCode}</TableCell>
                  <TableCell className="font-mono text-xs" dir="ltr">{phone?.value ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {a.roles.length ? a.roles.map((r) => <Badge key={r.id} size="sm" variant="neutral">{r.name}</Badge>) : <span className="text-outline text-xs">بدون دور</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="text-on-surface-variant text-xs">{formatDateTime(a.lastLoginAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Pager meta={admins.data?.meta} onPage={setPage} disabled={admins.isFetching} />

      {canCreate && (
        <CreateAdminModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          roles={roles.data}
          rolesError={!can('roles.view') ? 'تحتاج صلاحية عرض الأدوار (roles.view) لاختيار أدوار المشرف.' : roles.isError ? adminErrorMessage(roles.error) : null}
          onCreated={(a) => navigate(`/admin/team/${a.id}`)}
        />
      )}
    </div>
  );
};
