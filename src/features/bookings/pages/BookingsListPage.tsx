import * as React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import {
  BOOKING_STATUS_LABEL,
  bookingRefLabel,
  bookingStatusVariant,
  exportBookingsCsv,
  useAdminBookings,
  type AdminBookingFilters,
} from '../api';

const PAGE_SIZE = 20;
const STATUSES = ['CONFIRMED', 'CANCELLED'] as const;

/** Filters live in the URL so the list is linkable (e.g. `/bookings?officeId=…`). */
function readFilters(params: URLSearchParams): Omit<AdminBookingFilters, 'pageSize'> {
  const status = params.get('status');
  return {
    page: Math.max(1, Number(params.get('page')) || 1),
    q: params.get('q') ?? undefined,
    status: STATUSES.find((s) => s === status),
    from: params.get('from') ?? undefined,
    to: params.get('to') ?? undefined,
    companyId: params.get('companyId') ?? undefined,
    officeId: params.get('officeId') ?? undefined,
  };
}

export const BookingsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const { page = 1, ...exportFilters } = filters;
  const list = useAdminBookings({ ...filters, pageSize: PAGE_SIZE });
  const [search, setSearch] = React.useState(filters.q ?? '');
  const [exporting, setExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);

  const update = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const onExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await exportBookingsCsv(exportFilters);
    } catch (err) {
      setExportError(errorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const meta = list.data?.meta;
  const rows = list.data?.data ?? [];
  const hasFilters = Boolean(filters.q || filters.status || filters.from || filters.to || filters.companyId || filters.officeId);

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-lg">
      <Breadcrumbs items={[{ label: 'الرئيسية والعمليات', path: '/overview' }, { label: 'الحجوزات والتذاكر' }]} />
      <PageHeader
        title="الحجوزات والتذاكر"
        subtitle="جميع حجوزات المنصة من مكاتب الوكلاء وتطبيق العميل."
        actions={
          <Button variant="outline" icon="download" isLoading={exporting} onClick={onExport}>
            تصدير CSV
          </Button>
        }
      />

      <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md flex flex-wrap items-end gap-space-sm">
        <form
          className="flex items-end gap-2 grow min-w-[16rem]"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: search.trim() || undefined });
          }}
        >
          <div className="grow">
            <Input
              label="بحث"
              startIcon="search"
              placeholder="رقم الحجز، معرّف الحجز، رقم التذكرة، اسم أو هاتف الراكب"
              value={search}
              maxLength={64}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">بحث</Button>
        </form>
        <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
          الحالة
          <select
            className="h-10 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm text-on-surface"
            value={filters.status ?? ''}
            onChange={(e) => update({ status: e.target.value || undefined })}
          >
            <option value="">الكل</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{BOOKING_STATUS_LABEL[s]}</option>
            ))}
          </select>
        </label>
        <div className="w-40">
          <Input label="من تاريخ (تأكيد)" type="date" value={filters.from ?? ''} onChange={(e) => update({ from: e.target.value || undefined })} />
        </div>
        <div className="w-40">
          <Input label="إلى تاريخ" type="date" value={filters.to ?? ''} onChange={(e) => update({ to: e.target.value || undefined })} />
        </div>
        {(filters.companyId || filters.officeId) && (
          <div className="flex gap-2">
            {filters.companyId && (
              <Badge variant="info">
                شركة محددة
                <button type="button" className="ms-1" aria-label="إزالة فلتر الشركة" onClick={() => update({ companyId: undefined })}>×</button>
              </Badge>
            )}
            {filters.officeId && (
              <Badge variant="info">
                مكتب محدد
                <button type="button" className="ms-1" aria-label="إزالة فلتر المكتب" onClick={() => update({ officeId: undefined })}>×</button>
              </Badge>
            )}
          </div>
        )}
        {hasFilters && (
          <Button
            variant="ghost"
            icon="filter_alt_off"
            onClick={() => {
              setSearch('');
              setParams(new URLSearchParams(), { replace: true });
            }}
          >
            مسح الفلاتر
          </Button>
        )}
      </section>

      {exportError && (
        <div role="alert" className="rounded-lg bg-error-container text-on-error-container px-4 py-2 text-sm">
          تعذّر التصدير: {exportError}
        </div>
      )}

      {list.isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : list.isError ? (
        <ErrorState title="تعذّر تحميل الحجوزات" message={errorMessage(list.error)} onRetry={() => list.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'لا توجد حجوزات مطابقة' : 'لا توجد حجوزات بعد'}
          description={hasFilters ? 'جرّب تعديل البحث أو الفلاتر.' : 'ستظهر هنا الحجوزات فور تأكيدها.'}
          icon="confirmation_number"
        />
      ) : (
        <>
          <Table className={list.isFetching ? 'opacity-70' : undefined}>
            <TableHeader>
              <TableRow>
                <TableHead>المرجع</TableHead>
                <TableHead>المسار</TableHead>
                <TableHead>الشركة</TableHead>
                <TableHead>القناة</TableHead>
                <TableHead>الركاب / التذاكر</TableHead>
                <TableHead>القيمة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ التأكيد</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((b) => (
                <TableRow
                  key={b.id}
                  className="cursor-pointer"
                  tabIndex={0}
                  onClick={() => navigate(`/bookings/${b.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/bookings/${b.id}`);
                  }}
                >
                  <TableCell className="font-mono text-xs text-secondary" dir="ltr">{bookingRefLabel(b)}</TableCell>
                  <TableCell>
                    <div>{b.trip.origin} ← {b.trip.destination}</div>
                    <div className="text-xs text-on-surface-variant">{formatDateTime(b.trip.departureAt)}</div>
                  </TableCell>
                  <TableCell>{b.trip.company.name}</TableCell>
                  <TableCell>{b.channel === 'BROKER' ? b.office?.name ?? 'مكتب وكيل' : 'تطبيق العميل'}</TableCell>
                  <TableCell className="tabular-nums">{b.passengers.length} / {b.tickets.length}</TableCell>
                  <TableCell className="tabular-nums">{formatSdg(b.totalAmountMinor)}</TableCell>
                  <TableCell>
                    <Badge variant={bookingStatusVariant(b.status)}>{BOOKING_STATUS_LABEL[b.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-on-surface-variant">{formatDateTime(b.confirmedAt ?? b.createdAt)}</TableCell>
                  <TableCell>
                    <Link to={`/bookings/${b.id}`} className="inline-flex items-center gap-1 text-xs text-secondary font-medium" onClick={(e) => e.stopPropagation()}>
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      عرض
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {meta && (
            <div className="flex items-center justify-between text-sm text-on-surface-variant">
              <span>
                إجمالي {meta.total.toLocaleString('en-US')} حجز — صفحة {meta.page} من {Math.max(1, meta.totalPages)}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" icon="chevron_right" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon="chevron_left"
                  iconPosition="end"
                  disabled={page >= meta.totalPages}
                  onClick={() => update({ page: String(page + 1) })}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
