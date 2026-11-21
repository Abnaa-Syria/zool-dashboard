import * as React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { SearchInput } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { formatDateTime } from '../../../lib/dates';
import { useAuth } from '../../auth/auth-context';
import { adminErrorMessage, useAdmins, useRoles, type AdminStatus } from '../api';
import { AdminStatusBadge, Pager } from '../components/AdminUi';
import { CreateAdminModal } from '../components/CreateAdminModal';

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

const STATUS_FILTERS = [
  { key: '', label: 'الكل' },
  { key: 'ACTIVE', label: 'نشط' },
  { key: 'SUSPENDED', label: 'موقوف' },
] as const;

function readStatus(value: string | null): AdminStatus | '' {
  return value === 'ACTIVE' || value === 'SUSPENDED' ? value : '';
}

/** GET /admins — server-side pagination, search (`q`: name, employee code, phone) and status; filters live in the URL. */
export const AdminTeamPage: React.FC = () => {
  const { can, admin: me } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const status = readStatus(params.get('status'));
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [search, setSearch] = React.useState(q);
  const [createOpen, setCreateOpen] = React.useState(false);

  // Keep the box in sync when the URL changes from outside (back/forward, links).
  const [prevQ, setPrevQ] = React.useState(q);
  if (prevQ !== q) {
    setPrevQ(q);
    // Our own debounced write lands here too; keep in-progress text such as a trailing space.
    if (search.trim() !== q) setSearch(q);
  }

  /** Patches URL params; any filter change resets to page 1. */
  const update = React.useCallback(
    (patch: Record<string, string | undefined>) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v) next.set(k, v);
            else next.delete(k);
          }
          if (!('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );

  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(searchTimer.current), []);
  const onSearch = (value: string) => {
    setSearch(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => update({ q: value.trim() || undefined }), SEARCH_DEBOUNCE_MS);
  };
  const clearSearch = () => {
    clearTimeout(searchTimer.current);
    setSearch('');
    update({ q: undefined });
  };

  const admins = useAdmins({ page, pageSize: PAGE_SIZE, q: q || undefined, status: status || undefined });
  const canCreate = can('admins.create');
  const roles = useRoles(canCreate && can('roles.view'));

  const rows = admins.data?.data ?? [];
  const hasFilters = Boolean(q || status);

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
          <SearchInput value={search} onChange={(e) => onSearch(e.target.value)} onClear={clearSearch} placeholder="بحث بالاسم أو الرقم الوظيفي أو الهاتف" />
        </div>
        <div className="flex gap-1 bg-surface-container rounded-lg p-1" role="tablist" aria-label="الحالة">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.key}
              role="tab"
              aria-selected={status === s.key}
              onClick={() => update({ status: s.key || undefined })}
              className={`px-3 py-1 rounded-md text-sm ${status === s.key ? 'bg-surface-container-lowest shadow-sm font-semibold text-on-surface' : 'text-on-surface-variant'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {admins.isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : admins.isError ? (
        <ErrorState title="تعذّر تحميل فريق الإدارة" message={adminErrorMessage(admins.error)} onRetry={() => admins.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'لا توجد نتائج مطابقة' : 'لا يوجد مشرفون'}
          description={hasFilters ? 'غيّر عبارة البحث أو عامل تصفية الحالة.' : undefined}
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

      <Pager meta={admins.data?.meta} onPage={(p) => update({ page: p > 1 ? String(p) : undefined })} disabled={admins.isFetching} />

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
