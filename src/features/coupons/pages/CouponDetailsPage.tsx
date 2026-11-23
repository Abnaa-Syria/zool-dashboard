import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { DeleteEntityDialog } from '../../../components/shared/DeleteEntityDialog';
import { Field, FieldGrid, Mono } from '../../../components/shared/DetailFields';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { ConfirmDialog, Section } from '../../admin/components/AdminUi';
import { useAuth } from '../../auth/auth-context';
import { useCarrier } from '../../carriers/api';
import { useCoupon, useDeleteCoupon, useUpdateCoupon, type Coupon } from '../api';
import { CouponStateBadge } from '../components/CouponStateBadge';
import { EditCouponModal } from '../components/EditCouponModal';
import { formatPercent } from '../convert';

const CarrierName: React.FC<{ companyId: string }> = ({ companyId }) => {
  const carrier = useCarrier(companyId);
  return (
    <Link to={`/companies/${companyId}`} className="text-secondary font-medium hover:underline">
      {carrier.data?.name ?? <Mono>{companyId}</Mono>}
    </Link>
  );
};

const discountText = (c: Coupon) => (c.discountType === 'PERCENT' ? `${formatPercent(c.value)} من قيمة الحجز` : `${formatSdg(c.value)} خصم ثابت`);

export const CouponDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const canManage = can('coupons.manage');
  const coupon = useCoupon(id);
  const update = useUpdateCoupon();
  const remove = useDeleteCoupon();
  const [now] = React.useState(() => Date.now());
  const [modal, setModal] = React.useState<'edit' | 'toggle' | 'delete' | null>(null);
  const c = coupon.data;

  const crumbs = [
    { label: 'التسويق والمحتوى' },
    { label: 'الكوبونات', path: '/marketing/coupons' },
    { label: c?.code ?? 'كوبون' },
  ];

  if (coupon.isLoading) {
    return (
      <div className="flex flex-col w-full gap-space-md">
        <Breadcrumbs items={crumbs} />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    );
  }
  if (coupon.isError || !c) {
    return (
      <div className="flex flex-col w-full gap-space-md">
        <Breadcrumbs items={crumbs} />
        <ErrorState title="تعذّر تحميل الكوبون" message={errorMessage(coupon.error)} onRetry={() => coupon.refetch()} />
        <Link to="/marketing/coupons" className="text-secondary text-sm">العودة إلى الكوبونات</Link>
      </div>
    );
  }

  const closeToggle = (open: boolean) => {
    if (!open) {
      update.reset();
      setModal(null);
    }
  };

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={crumbs} />
      <PageHeader
        title={`الكوبون ${c.code}`}
        subtitle={discountText(c)}
        className="mb-0"
        badge={<CouponStateBadge coupon={c} now={now} />}
        actions={
          canManage ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" icon="edit" onClick={() => setModal('edit')}>تعديل</Button>
              <Button variant="outline" icon={c.isActive ? 'toggle_off' : 'toggle_on'} onClick={() => setModal('toggle')}>
                {c.isActive ? 'إيقاف' : 'تفعيل'}
              </Button>
              <Button variant="danger" icon="delete" onClick={() => setModal('delete')}>حذف</Button>
            </div>
          ) : null
        }
      />

      <Section title="الخصم والشروط">
        <FieldGrid>
          <Field label="الرمز"><Mono>{c.code}</Mono></Field>
          <Field label="نوع الخصم">{c.discountType === 'PERCENT' ? 'نسبة مئوية' : 'مبلغ ثابت'}</Field>
          <Field label="قيمة الخصم">{c.discountType === 'PERCENT' ? formatPercent(c.value) : formatSdg(c.value)}</Field>
          <Field label="أقصى خصم">{c.maxDiscountAmountMinor !== null ? formatSdg(c.maxDiscountAmountMinor) : 'بلا حد'}</Field>
          <Field label="الحد الأدنى للحجز">{c.minSubtotalAmountMinor !== null ? formatSdg(c.minSubtotalAmountMinor) : 'بلا حد'}</Field>
          <Field label="شركة النقل">{c.companyId ? <CarrierName companyId={c.companyId} /> : 'كل الشركات'}</Field>
          <Field label="حد الاستخدام لكل عميل">{c.perCustomerLimit.toLocaleString('en-US')}</Field>
          <Field label="التفعيل">{c.isActive ? 'مفعّل' : 'موقوف'}</Field>
        </FieldGrid>
      </Section>

      <Section title="الصلاحية والاستخدام">
        <FieldGrid>
          <Field label="يبدأ في">{formatDateTime(c.validFrom)}</Field>
          <Field label="ينتهي في">{formatDateTime(c.validTo)}</Field>
          <Field label="عدد الاستخدامات">
            <span className="tabular-nums">
              {c.redeemedCount.toLocaleString('en-US')} / {c.maxRedemptions?.toLocaleString('en-US') ?? '∞'}
            </span>
          </Field>
          <Field label="المتبقي">
            {c.maxRedemptions === null ? 'بلا حد' : Math.max(0, c.maxRedemptions - c.redeemedCount).toLocaleString('en-US')}
          </Field>
          <Field label="أُنشئ">{formatDateTime(c.createdAt)}</Field>
          <Field label="المعرّف"><Mono>{c.id}</Mono></Field>
        </FieldGrid>
        <p className="text-xs text-on-surface-variant">
          قائمة الحجوزات التي استخدمت الكوبون غير متاحة في واجهة الإدارة بعد. لا يمكن تغيير الرمز أو قيمة الخصم بعد الإنشاء؛ أوقف الكوبون وأنشئ واحدًا جديدًا.
        </p>
      </Section>

      {modal === 'edit' && <EditCouponModal key={c.id} coupon={c} onClose={() => setModal(null)} />}
      <ConfirmDialog
        open={modal === 'toggle'}
        onOpenChange={closeToggle}
        title={c.isActive ? `إيقاف الكوبون ${c.code}؟` : `تفعيل الكوبون ${c.code}؟`}
        description={
          c.isActive
            ? 'لن يُقبل الكوبون في أي حجز جديد فورًا. الحجوزات التي استخدمته تبقى كما هي.'
            : 'سيعود الكوبون قابلًا للاستخدام ضمن فترة صلاحيته وحدود استخدامه.'
        }
        confirmText={c.isActive ? 'إيقاف' : 'تفعيل'}
        danger={c.isActive}
        isLoading={update.isPending}
        error={update.isError ? errorMessage(update.error) : null}
        onConfirm={() => update.mutate({ id: c.id, patch: { isActive: !c.isActive } }, { onSuccess: () => closeToggle(false) })}
      />
      <DeleteEntityDialog
        open={modal === 'delete'}
        onOpenChange={(o) => !o && setModal(null)}
        entityLabel="الكوبون"
        name={c.code}
        description={<p>الحذف متاح فقط لكوبون لم يُستخدم في أي حجز.</p>}
        onDelete={() => remove.mutateAsync(c.id)}
        onDeleted={() => navigate('/marketing/coupons', { replace: true })}
        alternative={
          c.isActive
            ? {
                label: 'إيقاف الكوبون',
                description: 'إيقاف الكوبون يمنع استخدامه فورًا ويحفظ سجل الحجوزات التي استخدمته.',
                run: () => update.mutateAsync({ id: c.id, patch: { isActive: false } }),
              }
            : undefined
        }
      />
    </div>
  );
};
