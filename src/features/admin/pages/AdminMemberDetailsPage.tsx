import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateTime } from '../../../lib/dates';
import { useAuth } from '../../auth/auth-context';
import {
  adminErrorMessage,
  useAdmin,
  useAdminSessions,
  useAuditLogs,
  useRevokeAllSessions,
  useRevokeSession,
  useRoles,
  useSetAdminRoles,
  useUpdateAdminProfile,
  useUpdateAdminStatus,
  type AdminUser,
} from '../api';
import { AUDIT_ACTION_LABEL, RESOURCE_TYPE_LABEL, label } from '../labels';
import { AdminStatusBadge, ConfirmDialog, InlineError, Section } from '../components/AdminUi';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label: l, children }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] text-on-surface-variant">{l}</span>
    <span className="text-sm text-on-surface">{children}</span>
  </div>
);

export const AdminMemberDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const admin = useAdmin(id);

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-lg">
      <Breadcrumbs items={[{ label: 'إدارة النظام' }, { label: 'فريق الإدارة', path: '/admin/team' }, { label: admin.data?.displayName ?? 'تفاصيل المشرف' }]} />
      {admin.isLoading ? (
        <div className="grid gap-space-md lg:grid-cols-2">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      ) : admin.isError ? (
        <ErrorState title="تعذّر تحميل بيانات المشرف" message={adminErrorMessage(admin.error)} onRetry={() => admin.refetch()} />
      ) : admin.data ? (
        <MemberDetails admin={admin.data} />
      ) : null}
    </div>
  );
};

const MemberDetails: React.FC<{ admin: AdminUser }> = ({ admin }) => {
  const { can, admin: me } = useAuth();
  const isSelf = me?.id === admin.id;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-lg">
            {admin.displayName.trim().charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface">{admin.displayName}</h1>
              <AdminStatusBadge status={admin.status} />
              {admin.isBootstrap && <Badge variant="warning">مدير عام تأسيسي</Badge>}
              {isSelf && <Badge variant="info">حسابك</Badge>}
            </div>
            <p className="text-xs text-on-surface-variant font-mono mt-0.5" dir="ltr">{admin.employeeCode}</p>
          </div>
        </div>
        <Link to="/admin/team" className="text-sm text-secondary flex items-center gap-1">
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          العودة للفريق
        </Link>
      </div>

      <div className="grid gap-space-md lg:grid-cols-2">
        <ProfileSection admin={admin} canEdit={can('admins.update')} />
        <AccessSection admin={admin} isSelf={isSelf} canSuspend={can('admins.suspend')} canRevoke={can('sessions.revoke')} />
        <RolesSection admin={admin} canAssign={can('roles.assign')} canViewRoles={can('roles.view')} />
        {can('sessions.view') && <SessionsSection adminId={admin.id} canRevoke={can('sessions.revoke')} />}
      </div>

      {can('audit.view') && <ActivitySection adminId={admin.id} />}
    </>
  );
};

const ProfileSection: React.FC<{ admin: AdminUser; canEdit: boolean }> = ({ admin, canEdit }) => {
  const update = useUpdateAdminProfile();
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(admin.displayName);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({ id: admin.id, displayName: name.trim() }, { onSuccess: () => setEditing(false) });
  };

  return (
    <Section
      title="الملف الشخصي"
      actions={
        canEdit && !editing ? (
          <Button
            size="sm"
            variant="outline"
            icon="edit"
            onClick={() => {
              setName(admin.displayName);
              update.reset();
              setEditing(true);
            }}
          >
            تعديل الاسم
          </Button>
        ) : null
      }
    >
      {editing && (
        <form onSubmit={save} className="space-y-2">
          <Input label="الاسم المعروض" value={name} onChange={(e) => setName(e.target.value)} minLength={2} maxLength={160} required autoFocus />
          <InlineError message={update.isError ? adminErrorMessage(update.error) : null} />
          <div className="flex gap-2 justify-end">
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
              إلغاء
            </Button>
            <Button type="submit" size="sm" isLoading={update.isPending} disabled={name.trim().length < 2 || name.trim() === admin.displayName}>
              حفظ
            </Button>
          </div>
        </form>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="الرقم الوظيفي">
          <span className="font-mono" dir="ltr">{admin.employeeCode}</span>
        </Field>
        {admin.identities.map((i) => (
          <Field key={`${i.type}-${i.value}`} label={i.type === 'PHONE' ? `الهاتف${i.isPrimary ? ' (أساسي)' : ''}` : i.type}>
            <span className="font-mono" dir="ltr">{i.value}</span>
          </Field>
        ))}
        <Field label="آخر دخول">{formatDateTime(admin.lastLoginAt)}</Field>
        <Field label="تاريخ الإنشاء">{formatDateTime(admin.createdAt)}</Field>
        <Field label="آخر تحديث">{formatDateTime(admin.updatedAt)}</Field>
      </div>
      <p className="text-[11px] text-outline">يغيّر كل مشرف رقم هاتفه بنفسه عبر رمز تحقق؛ لا يمكن تعديله من هنا.</p>
    </Section>
  );
};

const AccessSection: React.FC<{ admin: AdminUser; isSelf: boolean; canSuspend: boolean; canRevoke: boolean }> = ({ admin, isSelf, canSuspend, canRevoke }) => {
  const status = useUpdateAdminStatus();
  const revokeAll = useRevokeAllSessions();
  const [confirm, setConfirm] = React.useState<'status' | 'revoke' | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const suspending = admin.status === 'ACTIVE';

  if (!canSuspend && !canRevoke) return null;

  return (
    <Section title="الوصول والأمان">
      <div className="space-y-3">
        {canSuspend && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-outline-variant/40 p-3">
            <div>
              <p className="text-sm font-semibold">{suspending ? 'إيقاف الحساب' : 'إعادة تفعيل الحساب'}</p>
              <p className="text-[11px] text-on-surface-variant">
                {suspending ? 'يمنع الدخول وينهي كل الجلسات النشطة فورًا.' : 'يسمح للمشرف بتسجيل الدخول مجددًا.'}
              </p>
              {isSelf && suspending && <p className="text-[11px] text-error mt-1">لا يمكنك إيقاف حسابك الشخصي.</p>}
              {admin.isBootstrap && suspending && !isSelf && (
                <p className="text-[11px] mt-1 text-[#B45309]">حساب تأسيسي: يرفض الخادم إيقاف آخر مدير عام تأسيسي نشط.</p>
              )}
            </div>
            <Button
              size="sm"
              variant={suspending ? 'danger' : 'secondary'}
              icon={suspending ? 'block' : 'check_circle'}
              disabled={isSelf && suspending}
              onClick={() => {
                status.reset();
                setConfirm('status');
              }}
            >
              {suspending ? 'إيقاف' : 'إعادة تفعيل'}
            </Button>
          </div>
        )}
        {canRevoke && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-outline-variant/40 p-3">
            <div>
              <p className="text-sm font-semibold">إنهاء كل الجلسات</p>
              <p className="text-[11px] text-on-surface-variant">يُخرج المشرف من جميع الأجهزة دون إيقاف الحساب.</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              icon="logout"
              onClick={() => {
                revokeAll.reset();
                setConfirm('revoke');
              }}
            >
              إنهاء الجلسات
            </Button>
          </div>
        )}
        {notice && <p className="text-xs text-secondary">{notice}</p>}
      </div>

      <ConfirmDialog
        open={confirm === 'status'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={suspending ? `إيقاف ${admin.displayName}؟` : `إعادة تفعيل ${admin.displayName}؟`}
        description={suspending ? 'سيُمنع المشرف من الدخول وتُنهى جميع جلساته فورًا. يمكن إعادة التفعيل لاحقًا.' : 'سيتمكن المشرف من تسجيل الدخول بصلاحيات أدواره الحالية.'}
        confirmText={suspending ? 'تأكيد الإيقاف' : 'تأكيد التفعيل'}
        danger={suspending}
        isLoading={status.isPending}
        error={status.isError ? adminErrorMessage(status.error) : null}
        onConfirm={() =>
          status.mutate(
            { id: admin.id, status: suspending ? 'SUSPENDED' : 'ACTIVE' },
            {
              onSuccess: () => {
                setConfirm(null);
                setNotice(suspending ? 'تم إيقاف الحساب.' : 'تمت إعادة تفعيل الحساب.');
              },
            },
          )
        }
      />
      <ConfirmDialog
        open={confirm === 'revoke'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="إنهاء كل الجلسات؟"
        description={`سيُطلب من ${admin.displayName} تسجيل الدخول من جديد على كل الأجهزة.`}
        confirmText="إنهاء الجلسات"
        danger
        isLoading={revokeAll.isPending}
        error={revokeAll.isError ? adminErrorMessage(revokeAll.error) : null}
        onConfirm={() =>
          revokeAll.mutate(admin.id, {
            onSuccess: (r) => {
              setConfirm(null);
              setNotice(r.revokedCount ? `تم إنهاء ${r.revokedCount} جلسة.` : 'لا توجد جلسات نشطة.');
            },
          })
        }
      />
    </Section>
  );
};

const RolesSection: React.FC<{ admin: AdminUser; canAssign: boolean; canViewRoles: boolean }> = ({ admin, canAssign, canViewRoles }) => {
  const editable = canAssign && canViewRoles;
  const roles = useRoles(editable);
  const setRoles = useSetAdminRoles();
  const current = React.useMemo(() => admin.roles.map((r) => r.id).sort(), [admin.roles]);
  const [selected, setSelected] = React.useState<string[]>(current);
  const [saved, setSaved] = React.useState(false);

  const dirty = selected.length !== current.length || [...selected].sort().some((id, i) => id !== current[i]);

  if (!editable) {
    return (
      <Section title="الأدوار">
        <div className="flex flex-wrap gap-2">
          {admin.roles.length ? admin.roles.map((r) => <Badge key={r.id} variant="secondary">{r.name}</Badge>) : <span className="text-sm text-outline">بدون أدوار</span>}
        </div>
        <p className="text-[11px] text-outline">تعديل الأدوار يتطلب صلاحيتي roles.assign و roles.view.</p>
      </Section>
    );
  }

  return (
    <Section
      title="الأدوار"
      actions={
        <div className="flex gap-2">
          {dirty && (
            <Button size="sm" variant="ghost" onClick={() => setSelected(current)}>
              تراجع
            </Button>
          )}
          <Button
            size="sm"
            icon="save"
            disabled={!dirty || selected.length === 0}
            isLoading={setRoles.isPending}
            onClick={() => {
              setSaved(false);
              setRoles.mutate({ id: admin.id, roleIds: selected }, { onSuccess: () => setSaved(true) });
            }}
          >
            حفظ الأدوار
          </Button>
        </div>
      }
    >
      {roles.isLoading ? (
        <Skeleton className="h-24" />
      ) : roles.isError ? (
        <ErrorState title="تعذّر تحميل الأدوار" message={adminErrorMessage(roles.error)} onRetry={() => roles.refetch()} />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {(roles.data ?? [])
            .filter((r) => r.isActive || current.includes(r.id))
            .map((r) => (
              <label key={r.id} className="flex items-start gap-2 rounded-lg border border-outline-variant/40 px-3 py-2 text-sm cursor-pointer hover:bg-surface-container-low">
                <input
                  type="checkbox"
                  className="mt-1 accent-secondary"
                  checked={selected.includes(r.id)}
                  onChange={(e) => {
                    setSaved(false);
                    setSelected((ids) => (e.target.checked ? [...ids, r.id] : ids.filter((x) => x !== r.id)));
                  }}
                />
                <span className="flex flex-col">
                  <span className="font-medium flex items-center gap-1">
                    {r.name}
                    {r.isSystem && <Badge size="sm" variant="info">نظامي</Badge>}
                    {!r.isActive && <Badge size="sm" variant="neutral">معطّل</Badge>}
                  </span>
                  <span className="text-[11px] text-outline">{r.permissions.length} صلاحية</span>
                </span>
              </label>
            ))}
        </div>
      )}
      {selected.length === 0 && <p className="text-[11px] text-error">يجب اختيار دور واحد على الأقل.</p>}
      {admin.isBootstrap && <p className="text-[11px] text-[#B45309]">المدير العام التأسيسي يجب أن يحتفظ بدور Super Admin.</p>}
      <InlineError message={setRoles.isError ? adminErrorMessage(setRoles.error) : null} />
      {saved && !dirty && <p className="text-xs text-secondary">تم حفظ الأدوار.</p>}
    </Section>
  );
};

const SessionsSection: React.FC<{ adminId: string; canRevoke: boolean }> = ({ adminId, canRevoke }) => {
  const sessions = useAdminSessions(adminId);
  const revoke = useRevokeSession();

  return (
    <Section title="الجلسات النشطة">
      {sessions.isLoading ? (
        <Skeleton className="h-24" />
      ) : sessions.isError ? (
        <ErrorState title="تعذّر تحميل الجلسات" message={adminErrorMessage(sessions.error)} onRetry={() => sessions.refetch()} />
      ) : !sessions.data?.data.length ? (
        <p className="text-sm text-outline py-4 text-center">لا توجد جلسات نشطة.</p>
      ) : (
        <ul className="divide-y divide-surface-container">
          {sessions.data.data.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <p className="text-xs text-on-surface truncate" dir="ltr" title={s.userAgent ?? ''}>
                  {s.userAgent ?? 'جهاز غير معروف'}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  <span dir="ltr" className="font-mono">{s.ipAddress ?? '—'}</span> · بدأت {formatDateTime(s.createdAt)} · آخر استخدام {formatDateTime(s.lastUsedAt)}
                </p>
              </div>
              {canRevoke && (
                <Button
                  size="sm"
                  variant="ghost"
                  icon="logout"
                  isLoading={revoke.isPending && revoke.variables?.sessionId === s.id}
                  onClick={() => revoke.mutate({ sessionId: s.id, adminId })}
                >
                  إنهاء
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <InlineError message={revoke.isError ? adminErrorMessage(revoke.error) : null} />
    </Section>
  );
};

const ActivitySection: React.FC<{ adminId: string }> = ({ adminId }) => {
  const logs = useAuditLogs({ actorAdminId: adminId, page: 1, pageSize: 10 });
  return (
    <Section
      title="آخر الأنشطة"
      actions={
        <Link to={`/admin/audit?actorAdminId=${adminId}`} className="text-sm text-secondary">
          عرض الكل في سجل التدقيق
        </Link>
      }
    >
      {logs.isLoading ? (
        <Skeleton className="h-32" />
      ) : logs.isError ? (
        <ErrorState title="تعذّر تحميل الأنشطة" message={adminErrorMessage(logs.error)} onRetry={() => logs.refetch()} />
      ) : !logs.data?.data.length ? (
        <EmptyState title="لا توجد أنشطة مسجلة" icon="history" className="my-0" />
      ) : (
        <ul className="divide-y divide-surface-container">
          {logs.data.data.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span className="flex items-center gap-2">
                <Badge size="sm" variant="neutral">{label(AUDIT_ACTION_LABEL, l.action)}</Badge>
                <span className="text-on-surface-variant text-xs">{label(RESOURCE_TYPE_LABEL, l.resourceType)}</span>
              </span>
              <span className="text-xs text-on-surface-variant">{formatDateTime(l.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
};
