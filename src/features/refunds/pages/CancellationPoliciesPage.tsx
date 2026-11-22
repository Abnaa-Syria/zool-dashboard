import * as React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateTime } from '../../../lib/dates';
import { useAuth } from '../../auth/auth-context';
import { adminErrorMessage, useSystemSettings } from '../../admin/api';
import { SETTING_GROUPS, SETTING_LABEL } from '../../admin/labels';
import { formatPolicyValue } from '../policy';

/** Settings groups that make up the cancellation / refund / change policy (D-SET-02). */
const POLICY_PREFIXES = ['refund', 'change', 'cash'] as const;

/**
 * Read-only view of the live cancellation & refund policy. The values are the platform settings
 * (`refund.*`, `change.*`, `cash.*`) — the single source the backend applies to customer cancellations.
 */
export const CancellationPoliciesPage: React.FC = () => {
  const { can } = useAuth();
  const canView = can('settings.view');

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs
        items={[
          { label: 'المالية والتسويات', path: '/financials/wallets' },
          { label: 'الإلغاءات والاسترداد', path: '/refunds/queue' },
          { label: 'سياسة الإلغاء والاسترداد' },
        ]}
      />
      <PageHeader
        title="سياسة الإلغاء والاسترداد"
        subtitle="القيم المطبّقة حاليًا على إلغاء العملاء وتعديل الرحلات والدفع النقدي. تُعدَّل من صفحة الإعدادات العامة وتُطبَّق فورًا على الطلبات الجديدة."
        className="mb-0"
        actions={
          can('settings.manage') ? (
            <Link to="/admin/settings">
              <Button variant="outline" icon="settings">تعديل في الإعدادات العامة</Button>
            </Link>
          ) : undefined
        }
      />
      {canView ? (
        <PolicySettings />
      ) : (
        <EmptyState
          title="لا تملك صلاحية عرض إعدادات المنصة"
          description="تُقرأ سياسة الإلغاء من إعدادات المنصة، وتتطلب صلاحية «عرض إعدادات المنصة». اطلبها من مدير النظام."
          icon="lock"
        />
      )}
    </div>
  );
};

const PolicySettings: React.FC = () => {
  const settings = useSystemSettings();

  if (settings.isLoading) {
    return (
      <div className="grid gap-space-md lg:grid-cols-3">
        {POLICY_PREFIXES.map((p) => (
          <Skeleton key={p} className="h-56 rounded-xl" />
        ))}
      </div>
    );
  }
  if (settings.isError) {
    return <ErrorState title="تعذّر تحميل الإعدادات" message={adminErrorMessage(settings.error)} onRetry={() => settings.refetch()} />;
  }
  const rows = settings.data ?? [];
  const byKey = new Map(rows.map((s) => [s.key, s]));
  const cutoff = byKey.get('refund.customerCutoffMinutesBeforeDeparture');
  const fee = byKey.get('refund.customerFeeBasisPoints');

  return (
    <>
      {cutoff && fee && (
        <div className="rounded-xl border border-secondary/30 bg-secondary-container/30 p-space-md text-sm flex items-start gap-space-sm">
          <span className="material-symbols-outlined text-secondary">info</span>
          <p>
            يمكن للعميل إلغاء حجزه من التطبيق حتى <b>{formatPolicyValue(cutoff)}</b> قبل موعد الانطلاق، ويُخصم <b>{formatPolicyValue(fee)}</b> من المبلغ
            كرسوم إلغاء ويُعاد الباقي إلى وسيلة الدفع الأصلية عبر طابور الاسترداد. لا تُخصم رسوم عند إلغاء الرحلة من الناقل أو الإلغاء من الإدارة.
          </p>
        </div>
      )}
      <div className="grid gap-space-md lg:grid-cols-3">
        {POLICY_PREFIXES.map((prefix) => {
          const group = SETTING_GROUPS.find((g) => g.prefix === prefix);
          const items = rows.filter((s) => s.key.startsWith(`${prefix}.`));
          return (
            <section key={prefix} className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md flex flex-col gap-space-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <span className="material-symbols-outlined text-secondary text-[20px]">{group?.icon ?? 'tune'}</span>
                {group?.label ?? prefix}
              </h2>
              {items.length === 0 ? (
                <p className="text-xs text-on-surface-variant">لا توجد إعدادات في هذه المجموعة.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-surface-container">
                  {items.map((s) => (
                    <li key={s.key} className="py-2 flex flex-col gap-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs text-on-surface-variant">{SETTING_LABEL[s.key] ?? s.key}</span>
                        <span className="font-semibold tabular-nums whitespace-nowrap">{formatPolicyValue(s)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-outline">
                        {s.isDefault ? (
                          <Badge size="sm" variant="neutral">القيمة الافتراضية</Badge>
                        ) : (
                          <span>
                            عُدّلت {formatDateTime(s.updatedAt)}
                            {s.updatedBy && ` · ${s.updatedBy.displayName}`}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
};
