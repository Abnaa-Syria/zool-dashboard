import * as React from 'react';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateTime } from '../../../lib/dates';
import { useAuth } from '../../auth/auth-context';
import { adminErrorMessage, useDeleteRole, usePermissionCatalog, useRoles, useSetRolePermissions, useUpdateRole, type Role } from '../api';
import { PERMISSION_LABEL } from '../labels';
import { ConfirmDialog, InlineError, Section } from '../components/AdminUi';
import { PermissionMatrix } from '../components/PermissionMatrix';
import { RoleFormModal } from '../components/RoleFormModal';

export const RolesPermissionsPage: React.FC = () => {
  const { can } = useAuth();
  const roles = useRoles();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);

  const list = roles.data ?? [];
  const selected = list.find((r) => r.id === selectedId) ?? list[0];

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-lg">
      <Breadcrumbs items={[{ label: 'إدارة النظام' }, { label: 'الأدوار والصلاحيات' }]} />

      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">الأدوار والصلاحيات</h1>
          <p className="text-xs text-on-surface-variant mt-1">الأدوار النظامية للقراءة فقط. تغييرات الصلاحيات تسري فورًا على كل أعضاء الدور.</p>
        </div>
        {can('roles.create') && (
          <Button icon="add" onClick={() => setCreateOpen(true)}>
            دور جديد
          </Button>
        )}
      </div>

      {roles.isLoading ? (
        <div className="grid gap-space-md lg:grid-cols-[280px_1fr]">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : roles.isError ? (
        <ErrorState title="تعذّر تحميل الأدوار" message={adminErrorMessage(roles.error)} onRetry={() => roles.refetch()} />
      ) : !selected ? (
        <EmptyState title="لا توجد أدوار" icon="lock_person" />
      ) : (
        <div className="grid gap-space-md lg:grid-cols-[280px_1fr] items-start">
          <nav aria-label="الأدوار" className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-2 space-y-1">
            {list.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedId(r.id)}
                aria-current={r.id === selected.id}
                className={`w-full text-right rounded-lg px-3 py-2 transition-colors ${r.id === selected.id ? 'bg-secondary-container/60' : 'hover:bg-surface-container-low'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-on-surface">{r.name}</span>
                  <span className="flex gap-1">
                    {r.isSystem && <Badge size="sm" variant="info">نظامي</Badge>}
                    {!r.isActive && <Badge size="sm" variant="neutral">معطّل</Badge>}
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">
                  {r.memberCount} عضو · {r.permissions.length} صلاحية
                </div>
              </button>
            ))}
          </nav>
          <RoleDetails key={selected.id} role={selected} roles={list} onDeleted={() => setSelectedId(null)} />
        </div>
      )}

      {can('roles.create') && (
        <RoleFormModal open={createOpen} onOpenChange={setCreateOpen} roles={list} onSaved={(r) => setSelectedId(r.id)} />
      )}
    </div>
  );
};

const RoleDetails: React.FC<{ role: Role; roles: Role[]; onDeleted: () => void }> = ({ role, roles, onDeleted }) => {
  const { can } = useAuth();
  const catalog = usePermissionCatalog(can('permissions.view'));
  const setPerms = useSetRolePermissions();
  const update = useUpdateRole();
  const del = useDeleteRole();
  const [draft, setDraft] = React.useState(() => new Set(role.permissions));
  const [editOpen, setEditOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState<'delete' | 'active' | null>(null);
  const [saved, setSaved] = React.useState(false);

  const original = React.useMemo(() => new Set(role.permissions), [role.permissions]);
  const dirty = draft.size !== original.size || [...draft].some((k) => !original.has(k));
  const readOnlyMatrix = role.isSystem || !can('permissions.assign');
  const canUpdate = !role.isSystem && can('roles.update');
  const canDelete = !role.isSystem && can('roles.delete');

  return (
    <div className="space-y-space-md min-w-0">
      <Section
        title={role.name}
        actions={
          <div className="flex flex-wrap gap-2">
            {canUpdate && (
              <>
                <Button size="sm" variant="outline" icon="edit" onClick={() => setEditOpen(true)}>
                  تعديل
                </Button>
                <Button size="sm" variant="outline" icon={role.isActive ? 'toggle_off' : 'toggle_on'} onClick={() => (update.reset(), setConfirm('active'))}>
                  {role.isActive ? 'تعطيل' : 'تفعيل'}
                </Button>
              </>
            )}
            {canDelete && (
              <Button size="sm" variant="danger" icon="delete" onClick={() => (del.reset(), setConfirm('delete'))}>
                حذف
              </Button>
            )}
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono text-on-surface-variant" dir="ltr">{role.key}</span>
          {role.isSystem && <Badge size="sm" variant="info">دور نظامي — للقراءة فقط</Badge>}
          <Badge size="sm" variant={role.isActive ? 'success' : 'neutral'}>{role.isActive ? 'نشط' : 'معطّل'}</Badge>
          <span className="text-on-surface-variant">{role.memberCount} عضو</span>
          <span className="text-outline">آخر تحديث {formatDateTime(role.updatedAt)}</span>
        </div>
        {role.description && <p className="text-sm text-on-surface-variant">{role.description}</p>}
      </Section>

      <Section
        title="مصفوفة الصلاحيات"
        actions={
          !readOnlyMatrix && (
            <div className="flex gap-2">
              {dirty && (
                <Button size="sm" variant="ghost" onClick={() => setDraft(new Set(original))}>
                  تراجع
                </Button>
              )}
              <Button
                size="sm"
                icon="save"
                disabled={!dirty}
                isLoading={setPerms.isPending}
                onClick={() => {
                  setSaved(false);
                  setPerms.mutate({ id: role.id, permissionKeys: [...draft] }, { onSuccess: () => setSaved(true) });
                }}
              >
                حفظ الصلاحيات
              </Button>
            </div>
          )
        }
      >
        {!can('permissions.view') ? (
          <div className="flex flex-wrap gap-1">
            {role.permissions.map((k) => (
              <Badge key={k} size="sm" variant="neutral" title={k}>
                {PERMISSION_LABEL[k] ?? k}
              </Badge>
            ))}
          </div>
        ) : catalog.isLoading ? (
          <Skeleton className="h-64" />
        ) : catalog.isError ? (
          <ErrorState title="تعذّر تحميل كتالوج الصلاحيات" message={adminErrorMessage(catalog.error)} onRetry={() => catalog.refetch()} />
        ) : (
          <PermissionMatrix catalog={catalog.data ?? []} selected={draft} readOnly={readOnlyMatrix} onChange={(s) => (setSaved(false), setDraft(s))} />
        )}
        <InlineError message={setPerms.isError ? adminErrorMessage(setPerms.error) : null} />
        {saved && !dirty && <p className="text-xs text-secondary">تم حفظ الصلاحيات.</p>}
        {dirty && role.memberCount > 0 && <p className="text-[11px] text-[#B45309]">سيؤثر الحفظ على {role.memberCount} مشرف فورًا.</p>}
      </Section>

      {canUpdate && <RoleFormModal open={editOpen} onOpenChange={setEditOpen} role={role} roles={roles} onSaved={() => undefined} />}

      <ConfirmDialog
        open={confirm === 'active'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={role.isActive ? `تعطيل دور ${role.name}؟` : `تفعيل دور ${role.name}؟`}
        description={role.isActive ? 'لن يُسند الدور لمشرفين جدد. تبقى إسناداته الحالية مسجلة.' : 'سيصبح الدور متاحًا للإسناد.'}
        confirmText={role.isActive ? 'تعطيل' : 'تفعيل'}
        danger={role.isActive}
        isLoading={update.isPending}
        error={update.isError ? adminErrorMessage(update.error) : null}
        onConfirm={() => update.mutate({ id: role.id, isActive: !role.isActive }, { onSuccess: () => setConfirm(null) })}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`حذف دور ${role.name}؟`}
        description={
          role.memberCount > 0
            ? `هذا الدور مسند إلى ${role.memberCount} مشرف وسيفقدون صلاحياته فورًا. لا يمكن التراجع.`
            : 'سيُحذف الدور نهائيًا. لا يمكن التراجع.'
        }
        confirmText="حذف الدور"
        danger
        isLoading={del.isPending}
        error={del.isError ? adminErrorMessage(del.error) : null}
        onConfirm={() =>
          del.mutate(role.id, {
            onSuccess: () => {
              setConfirm(null);
              onDeleted();
            },
          })
        }
      />
    </div>
  );
};
