import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { ConfirmDialog, Section } from '../../admin/components/AdminUi';
import { RelatedBookingsTable } from '../../bookings/components/RelatedBookingsTable';
import { useAuth } from '../../auth/auth-context';
import {
  CUSTOMER_STATUS_LABEL,
  CUSTOMER_STATUS_VARIANT,
  DEFAULT_CASH_NO_SHOW_LIMIT,
  useCashNoShowLimit,
  useCustomer,
  useDeleteCustomer,
  useUpdateCustomer,
  type CustomerDetail,
} from '../api';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-xs text-on-surface-variant">{label}</dt>
    <dd className="text-sm text-on-surface">{children}</dd>
  </div>
);

const Stat: React.FC<{ label: string; value: number; tone?: string }> = ({ label, value, tone }) => (
  <div className="rounded-lg border border-surface-container-high p-space-sm">
    <div className="text-xs text-on-surface-variant">{label}</div>
    <div className={`text-2xl font-bold tabular-nums ${tone ?? 'text-on-surface'}`}>{value.toLocaleString('en-US')}</div>
  </div>
);

type Action = 'suspend' | 'reactivate' | 'reset' | 'delete' | null;

const CustomerActions: React.FC<{ customer: CustomerDetail; action: Action; onClose: () => void }> = ({ customer, action, onClose }) => {
  const update = useUpdateCustomer(customer.id);
  const remove = useDeleteCustomer(customer.id);
  const close = (open: boolean) => {
    if (!open) {
      update.reset();
      remove.reset();
      onClose();
    }
  };
  const run = () =>
    action === 'delete'
      ? remove.mutate(undefined, { onSuccess: () => close(false) })
      : update.mutate(
      action === 'reset' ? { resetCashNoShows: true } : { status: action === 'suspend' ? 'SUSPENDED' : 'ACTIVE' },
      { onSuccess: () => close(false) },
    );
  const name = customer.displayName ?? customer.phone ?? 'العميل';

  const copy = {
    suspend: {
      title: `إيقاف حساب ${name}؟`,
      description: (
        <ul className="list-disc pr-5 space-y-1">
          <li>تُلغى كل جلسات العميل فورًا ويُسجَّل خروجه من التطبيق على كل الأجهزة.</li>
          <li>لن يتمكن من تسجيل الدخول أو الحجز حتى يُعاد تفعيل الحساب.</li>
          <li>الحجوزات والتذاكر الصادرة لا تُلغى تلقائيًا.</li>
          <li>يُسجَّل الإجراء في سجل التدقيق.</li>
        </ul>
      ),
      confirm: 'تأكيد الإيقاف',
      danger: true,
    },
    reactivate: {
      title: `إعادة تفعيل حساب ${name}؟`,
      description: 'سيتمكن العميل من تسجيل الدخول والحجز مرة أخرى. الجلسات التي أُلغيت عند الإيقاف لا تعود؛ يحتاج لتسجيل الدخول من جديد.',
      confirm: 'إعادة التفعيل',
      danger: false,
    },
    reset: {
      title: 'تصفير عدّاد عدم الحضور النقدي؟',
      description: `سيُعاد العدّاد من ${customer.cashNoShowCount} إلى 0 فيستعيد العميل أهلية الدفع نقدًا عند الصعود (إن لم تمنعه حدود أخرى). سجلات التذاكر غير المدفوعة تبقى كما هي. يُسجَّل الإجراء في سجل التدقيق.`,
      confirm: 'تصفير العدّاد',
      danger: false,
    },
    delete: {
      title: `حذف حساب ${name}؟`,
      description: (
        <ul className="list-disc pr-5 space-y-1">
          <li>تُمسح البيانات الشخصية نهائيًا: الاسم والهاتف والبريد والصورة وعمليات البحث الأخيرة وأجهزة الإشعارات.</li>
          <li>تُلغى كل جلسات العميل ولن يتمكن من الدخول بهذا الحساب مرة أخرى (يمكنه التسجيل من جديد برقمه كحساب جديد).</li>
          <li>الحجوزات والتذاكر والمدفوعات تبقى في السجل المالي دون بيانات الحساب.</li>
          <li>غير مسموح إذا كانت لديه حجوزات على رحلات قادمة — ألغِها أولًا. لا يمكن التراجع.</li>
        </ul>
      ),
      confirm: 'حذف الحساب',
      danger: true,
    },
  } as const;

  if (!action) return null;
  const c = copy[action];
  return (
    <ConfirmDialog
      open
      onOpenChange={close}
      title={c.title}
      description={c.description}
      confirmText={c.confirm}
      danger={c.danger}
      onConfirm={run}
      isLoading={update.isPending || remove.isPending}
      error={update.isError ? errorMessage(update.error) : remove.isError ? errorMessage(remove.error) : null}
    />
  );
};

export const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { can } = useAuth();
  const customer = useCustomer(id);
  const limitQuery = useCashNoShowLimit(can('settings.view'));
  const [action, setAction] = React.useState<Action>(null);
  const c = customer.data;
  const canManage = can('customers.manage');
  const limit = limitQuery.data ?? DEFAULT_CASH_NO_SHOW_LIMIT;
  const limitFromSettings = typeof limitQuery.data === 'number';

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs
        items={[
          { label: 'الرئيسية والعمليات', path: '/overview' },
          { label: 'حسابات المسافرين', path: '/travelers' },
          { label: c ? (c.displayName ?? c.phone ?? c.id) : '...' },
        ]}
      />

      {customer.isLoading ? (
        <Skeleton className="h-56 rounded-xl" />
      ) : customer.isError ? (
        <ErrorState title="تعذّر تحميل الحساب" message={errorMessage(customer.error)} onRetry={() => customer.refetch()} />
      ) : c ? (
        <>
          <PageHeader
            title={c.displayName ?? 'عميل بدون اسم'}
            subtitle={c.phone ?? undefined}
            className="mb-0"
            badge={<Badge variant={CUSTOMER_STATUS_VARIANT[c.status]} dot>{CUSTOMER_STATUS_LABEL[c.status]}</Badge>}
            actions={
              canManage && c.status !== 'DELETED' ? (
                <div className="flex flex-wrap gap-2">
                  {c.status === 'ACTIVE' ? (
                    <Button variant="outline" icon="block" onClick={() => setAction('suspend')}>إيقاف الحساب</Button>
                  ) : (
                    <Button icon="check_circle" onClick={() => setAction('reactivate')}>إعادة التفعيل</Button>
                  )}
                  <Button variant="danger" icon="person_remove" onClick={() => setAction('delete')}>حذف الحساب</Button>
                </div>
              ) : null
            }
          />

          {c.status === 'SUSPENDED' && (
            <div className="rounded-xl border border-error/30 bg-error-container/30 p-space-md text-sm">
              <strong>الحساب موقوف.</strong> لا يستطيع العميل تسجيل الدخول أو الحجز، وأُلغيت جلساته عند الإيقاف.
            </div>
          )}
          {c.status === 'DELETED' && (
            <div className="rounded-xl border border-outline-variant/40 bg-surface-container p-space-md text-sm">
              الحساب محذوف (أُزيلت بياناته الشخصية) ولا يمكن تعديله. حجوزاته باقية في السجل.
            </div>
          )}

          <Section title="بيانات الحساب">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
              <Field label="الهاتف"><span dir="ltr" className="font-mono text-xs">{c.phone ?? '—'}</span></Field>
              <Field label="البريد الإلكتروني"><span dir="ltr">{c.email ?? '—'}</span></Field>
              <Field label="لغة التطبيق">{c.preferredLanguage === 'en' ? 'الإنجليزية' : c.preferredLanguage === 'ar' ? 'العربية' : c.preferredLanguage}</Field>
              <Field label="المعرّف"><span dir="ltr" className="font-mono text-xs">{c.id}</span></Field>
              <Field label="آخر دخول">{formatDateTime(c.lastLoginAt)}</Field>
              <Field label="تاريخ التسجيل">{formatDateTime(c.createdAt)}</Field>
            </dl>
          </Section>

          <Section title="الحجوزات">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
              <Stat label="إجمالي الحجوزات" value={c.bookingsCount} />
              <Stat label="مؤكدة" value={c.bookings.confirmed} tone="text-[#15803D]" />
              <Stat label="ملغاة" value={c.bookings.cancelled} tone="text-error" />
            </div>
            <RelatedBookingsTable scope={{ customerId: c.id }} emptyText="لا توجد حجوزات لهذا الحساب." hide={['office']} />
          </Section>

          <Section
            title="الدفع نقدًا عند الصعود (D-CASH-01)"
            actions={
              canManage && c.status !== 'DELETED' ? (
                <Button size="sm" variant="outline" icon="restart_alt" disabled={c.cashNoShowCount === 0} onClick={() => setAction('reset')}>
                  تصفير العدّاد
                </Button>
              ) : null
            }
          >
            <div className="flex flex-wrap items-center gap-space-sm text-sm">
              <span>حالات عدم الحضور لتذاكر نقدية غير مدفوعة:</span>
              <strong className="tabular-nums text-lg">{c.cashNoShowCount}</strong>
              <span className="text-on-surface-variant">/ الحد {limit}{limitFromSettings ? '' : ' (افتراضي)'}</span>
              {c.cashNoShowCount >= limit ? (
                <Badge variant="error" dot>فقد أهلية الدفع النقدي</Badge>
              ) : (
                <Badge variant="success" dot>مؤهَّل للدفع النقدي</Badge>
              )}
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              كل تذكرة نقدية لم يصعد صاحبها قبل الانطلاق تُحتسب «عدم حضور». عند بلوغ الحد (إعداد النظام <span dir="ltr" className="font-mono">cash.noShowLimit</span>)
              يفقد العميل خيار الدفع نقدًا ويبقى الدفع الإلكتروني متاحًا. التصفير يعيد الأهلية — استخدمه بعد التحقق من سبب عدم الحضور
              (مثلًا تأخير من الشركة). حدود أخرى تبقى سارية: عدد الحجوزات النقدية المفتوحة، ومقاعد الحجز الواحد، وإغلاق النقد قبل الانطلاق.
            </p>
          </Section>

          <CustomerActions customer={c} action={action} onClose={() => setAction(null)} />
        </>
      ) : null}
    </div>
  );
};
