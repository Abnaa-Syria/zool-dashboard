import * as React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '../../../components/ui/Drawer';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { formatDateTime } from '../../../lib/dates';
import { useAuth } from '../../auth/auth-context';
import { adminErrorMessage, useAdmins, useAuditLogs, type AuditFilters, type AuditLog } from '../api';
import { AUDIT_ACTION_LABEL, RESOURCE_TYPE_LABEL, label } from '../labels';
import { Pager } from '../components/AdminUi';

const PAGE_SIZE = 25;
/** Sudan is UTC+2 all year (no DST). */
const SUDAN_OFFSET = '+02:00';

const FILTER_KEYS = ['actorAdminId', 'action', 'resourceType', 'resourceId', 'requestId', 'from', 'to'] as const;
type FilterKey = (typeof FILTER_KEYS)[number];
type Draft = Record<FilterKey, string>;

const selectClass = 'h-10 w-full rounded-lg bg-surface-container-lowest text-sm border border-outline-variant/60 px-3 focus:outline-none focus:ring-2 focus:ring-secondary/30';

/** GET /audit-logs with every server-side filter the API supports (audit.validation.ts). */
export const AuditTrailPage: React.FC = () => {
  const { can } = useAuth();
  const [params, setParams] = useSearchParams();
  const applied = React.useMemo(() => Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) ?? ''])) as Draft, [params]);
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [draft, setDraft] = React.useState<Draft>(applied);
  const [selected, setSelected] = React.useState<AuditLog | null>(null);

  // Reset the draft when the URL filters change (back/forward, links, apply).
  const [prevApplied, setPrevApplied] = React.useState(applied);
  if (prevApplied !== applied) {
    setPrevApplied(applied);
    setDraft(applied);
  }

  const filters: AuditFilters = {
    page,
    pageSize: PAGE_SIZE,
    actorAdminId: applied.actorAdminId || undefined,
    action: applied.action || undefined,
    resourceType: applied.resourceType || undefined,
    resourceId: applied.resourceId || undefined,
    requestId: applied.requestId || undefined,
    from: applied.from ? `${applied.from}T00:00:00.000${SUDAN_OFFSET}` : undefined,
    to: applied.to ? `${applied.to}T23:59:59.999${SUDAN_OFFSET}` : undefined,
  };
  const rangeInvalid = Boolean(draft.from && draft.to && draft.from > draft.to);
  const logs = useAuditLogs(filters);

  // Actor names: the audit API returns only actorAdminId.
  const admins = useAdmins({ page: 1, pageSize: 100 }, can('admins.view'));
  const actorName = React.useMemo(() => {
    const m = new Map((admins.data?.data ?? []).map((a) => [a.id, a.displayName]));
    return (id: string | null) => (id ? (m.get(id) ?? id.slice(-8)) : 'النظام');
  }, [admins.data]);

  const apply = (next: Draft, nextPage = 1) => {
    const p = new URLSearchParams();
    for (const k of FILTER_KEYS) if (next[k].trim()) p.set(k, next[k].trim());
    if (nextPage > 1) p.set('page', String(nextPage));
    setParams(p);
  };

  const set = (k: FilterKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDraft((d) => ({ ...d, [k]: e.target.value }));
  const activeCount = FILTER_KEYS.filter((k) => applied[k]).length;

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-lg">
      <Breadcrumbs items={[{ label: 'إدارة النظام' }, { label: 'سجل الأنشطة والتدقيق' }]} />
      <div>
        <h1 className="font-headline-md text-headline-md font-bold text-on-surface">سجل الأنشطة والتدقيق</h1>
        <p className="text-xs text-on-surface-variant mt-1">سجل غير قابل للتعديل لكل الإجراءات الحساسة في المنصة (بتوقيت السودان).</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!rangeInvalid) apply(draft);
        }}
        className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="f-actor" className="text-xs font-semibold">المنفّذ</label>
          {can('admins.view') ? (
            <select id="f-actor" value={draft.actorAdminId} onChange={set('actorAdminId')} className={selectClass}>
              <option value="">الكل</option>
              {draft.actorAdminId && !admins.data?.data.some((a) => a.id === draft.actorAdminId) && <option value={draft.actorAdminId}>{draft.actorAdminId}</option>}
              {(admins.data?.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.displayName}
                </option>
              ))}
            </select>
          ) : (
            <input id="f-actor" value={draft.actorAdminId} onChange={set('actorAdminId')} placeholder="معرّف المشرف" dir="ltr" className={selectClass} />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="f-action" className="text-xs font-semibold">الإجراء</label>
          <input id="f-action" list="audit-actions" value={draft.action} onChange={set('action')} placeholder="مثال: admin.suspended" dir="ltr" className={`${selectClass} text-left`} />
          <datalist id="audit-actions">
            {Object.entries(AUDIT_ACTION_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </datalist>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="f-type" className="text-xs font-semibold">نوع المورد</label>
          <select id="f-type" value={draft.resourceType} onChange={set('resourceType')} className={selectClass}>
            <option value="">الكل</option>
            {Object.entries(RESOURCE_TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v} ({k})
              </option>
            ))}
          </select>
        </div>
        <Input label="معرّف المورد" value={draft.resourceId} onChange={set('resourceId')} dir="ltr" className="text-left font-mono" />
        <Input label="معرّف الطلب (requestId)" value={draft.requestId} onChange={set('requestId')} dir="ltr" className="text-left font-mono" />
        <Input label="من تاريخ" type="date" value={draft.from} onChange={set('from')} />
        <Input label="إلى تاريخ" type="date" value={draft.to} onChange={set('to')} error={rangeInvalid ? 'تاريخ البداية بعد تاريخ النهاية' : undefined} />
        <div className="flex items-end gap-2">
          <Button type="submit" icon="filter_alt" disabled={rangeInvalid}>
            تطبيق
          </Button>
          {activeCount > 0 && (
            <Button type="button" variant="ghost" onClick={() => apply(Object.fromEntries(FILTER_KEYS.map((k) => [k, ''])) as Draft)}>
              مسح ({activeCount})
            </Button>
          )}
        </div>
      </form>

      {logs.isLoading ? (
        <Skeleton className="h-80 rounded-xl" />
      ) : logs.isError ? (
        <ErrorState title="تعذّر تحميل سجل التدقيق" message={adminErrorMessage(logs.error)} onRetry={() => logs.refetch()} />
      ) : !logs.data?.data.length ? (
        <EmptyState title="لا توجد سجلات" description={activeCount ? 'لا توجد سجلات مطابقة لعوامل التصفية.' : undefined} icon="history_toggle_off" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الوقت</TableHead>
              <TableHead>المنفّذ</TableHead>
              <TableHead>الإجراء</TableHead>
              <TableHead>المورد</TableHead>
              <TableHead>عنوان IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.data.data.map((l) => (
              <TableRow key={l.id} className="cursor-pointer" onClick={() => setSelected(l)}>
                <TableCell className="text-xs text-on-surface-variant whitespace-nowrap">{formatDateTime(l.createdAt)}</TableCell>
                <TableCell className="text-sm">{actorName(l.actorAdminId)}</TableCell>
                <TableCell>
                  <Badge size="sm" variant={/failed|rejected|reuse|suspended|deleted|revoked/.test(l.action) ? 'warning' : 'neutral'} title={l.action}>
                    {label(AUDIT_ACTION_LABEL, l.action)}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {label(RESOURCE_TYPE_LABEL, l.resourceType)}
                  {l.resourceId && <span className="font-mono text-outline ms-1" dir="ltr">…{l.resourceId.slice(-8)}</span>}
                </TableCell>
                <TableCell className="font-mono text-xs" dir="ltr">{l.ipAddress ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Pager meta={logs.data?.meta} onPage={(p) => apply(applied, p)} disabled={logs.isFetching} />

      <Drawer open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DrawerContent side="left" className="max-w-lg">
          {selected && <AuditDetail log={selected} actor={actorName(selected.actorAdminId)} canViewAdmins={can('admins.view')} />}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

const Row: React.FC<{ k: string; v: React.ReactNode; mono?: boolean }> = ({ k, v, mono }) => (
  <div className="grid grid-cols-[110px_1fr] gap-2 py-1.5 border-b border-surface-container text-sm">
    <span className="text-on-surface-variant text-xs">{k}</span>
    <span className={mono ? 'font-mono text-xs break-all text-left' : ''} dir={mono ? 'ltr' : undefined}>
      {v ?? '—'}
    </span>
  </div>
);

const AuditDetail: React.FC<{ log: AuditLog; actor: string; canViewAdmins: boolean }> = ({ log, actor, canViewAdmins }) => (
  <>
    <DrawerHeader>
      <DrawerTitle>{label(AUDIT_ACTION_LABEL, log.action)}</DrawerTitle>
      <DrawerDescription>{formatDateTime(log.createdAt)}</DrawerDescription>
    </DrawerHeader>
    <div className="space-y-4 overflow-y-auto">
      <div>
        <Row k="الإجراء" v={log.action} mono />
        <Row
          k="المنفّذ"
          v={
            log.actorAdminId && canViewAdmins ? (
              <Link to={`/admin/team/${log.actorAdminId}`} className="text-secondary">
                {actor}
              </Link>
            ) : (
              actor
            )
          }
        />
        <Row k="معرّف المنفّذ" v={log.actorAdminId} mono />
        <Row k="نوع المورد" v={`${label(RESOURCE_TYPE_LABEL, log.resourceType)} (${log.resourceType})`} />
        <Row k="معرّف المورد" v={log.resourceId} mono />
        <Row k="معرّف الطلب" v={log.requestId} mono />
        <Row k="عنوان IP" v={log.ipAddress} mono />
        <Row k="المتصفح" v={log.userAgent} mono />
        <Row k="الوقت (UTC)" v={log.createdAt} mono />
        <Row k="معرّف السجل" v={log.id} mono />
      </div>
      <div>
        <h3 className="text-xs font-semibold text-on-surface mb-1">البيانات الوصفية (metadata)</h3>
        {log.metadata == null ? (
          <p className="text-xs text-outline">لا توجد بيانات وصفية.</p>
        ) : (
          <pre dir="ltr" className="text-left text-[11px] leading-relaxed bg-surface-container-low rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        )}
      </div>
    </div>
  </>
);
