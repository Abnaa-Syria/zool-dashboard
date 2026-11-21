import * as React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { useAuth } from '../../auth/auth-context';
import {
  CONFIRMATION_PATH_LABEL,
  TOP_UP_STATUS_LABEL,
  TOP_UP_STATUS_VARIANT,
  downloadTopUpEvidence,
  financeErrorMessage,
  useAdminTopUps,
  useApproveTopUp,
  useOfficeLookup,
  useRejectTopUp,
  type AdminTopUp,
  type OfficeRef,
  type TopUpStatus,
} from '../api';
import { Pager } from '../components/Pager';
import { OfficeSelect } from '../components/OfficeSelect';
import { selectClass, usePageReset } from '../listState';

const PAGE_SIZE = 20;

type Review = { kind: 'approve' | 'reject'; topUp: AdminTopUp };

/**
 * Manual top-up review (D-ADMIN-TOPUP-01): broker/admin-submitted receipts wait in PENDING_REVIEW;
 * approval credits the wallet with the submitted amount (never edited), rejection marks it FAILED.
 */
export const TopUpQueuePage: React.FC = () => {
  const { can } = useAuth();
  const [status, setStatus] = React.useState<TopUpStatus | ''>('PENDING_REVIEW');
  const [officeId, setOfficeId] = React.useState('');
  const [page, setPage] = usePageReset(`${status}|${officeId}`);
  const [review, setReview] = React.useState<Review | null>(null);
  const [notice, setNotice] = React.useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [downloading, setDownloading] = React.useState<string | null>(null);

  const offices = useOfficeLookup();
  const officeById = React.useMemo(() => new Map((offices.data ?? []).map((o) => [o.id, o])), [offices.data]);
  const topUps = useAdminTopUps({ page, pageSize: PAGE_SIZE, status: status || undefined, officeId: officeId || undefined });
  const rows = topUps.data?.data ?? [];

  const canApprove = can('wallets.topups.approve');
  const canReject = can('wallets.topups.reject');
  const canEvidence = can('wallets.topups.evidence.view');

  async function download(id: string) {
    setDownloading(id);
    setNotice(null);
    try {
      await downloadTopUpEvidence(id);
    } catch (e) {
      setNotice({ tone: 'error', text: financeErrorMessage(e, 'تعذّر تنزيل الإيصال.') });
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'المالية والتسويات', path: '/financials/wallets' }, { label: 'مراجعة طلبات الشحن' }]} />
      <PageHeader
        title="مراجعة طلبات شحن المحافظ"
        subtitle="طلبات الشحن اليدوية المرفقة بإيصال تحويل. الاعتماد يضيف المبلغ المقدَّم كما هو إلى محفظة المكتب؛ لا يمكن تعديل المبلغ."
        className="mb-0"
      />

      <div className="flex flex-wrap items-center gap-space-sm">
        <select aria-label="الحالة" value={status} onChange={(e) => setStatus(e.target.value as TopUpStatus | '')} className={selectClass}>
          <option value="">كل الحالات</option>
          {(Object.keys(TOP_UP_STATUS_LABEL) as TopUpStatus[]).map((s) => (
            <option key={s} value={s}>{TOP_UP_STATUS_LABEL[s]}</option>
          ))}
        </select>
        <OfficeSelect offices={offices.data} value={officeId} onChange={setOfficeId} />
        {topUps.data?.meta && <span className="text-xs text-on-surface-variant">{topUps.data.meta.total.toLocaleString('en-US')} طلب</span>}
      </div>

      {notice && (
        <div role="status" className={`rounded-lg px-3 py-2 text-sm ${notice.tone === 'success' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-error-container text-on-error-container'}`}>
          {notice.text}
        </div>
      )}

      <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md">
        {topUps.isLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : topUps.isError ? (
          <ErrorState title="تعذّر تحميل طلبات الشحن" message={financeErrorMessage(topUps.error)} onRetry={() => topUps.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={status === 'PENDING_REVIEW' && !officeId ? 'لا توجد طلبات بانتظار المراجعة' : 'لا توجد طلبات مطابقة'}
            description="ستظهر هنا طلبات الشحن المرفقة بإيصال فور تقديمها."
            icon="receipt_long"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-on-surface-variant text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">المكتب</th>
                  <th className="py-2 px-2 font-medium">المبلغ</th>
                  <th className="py-2 px-2 font-medium">مرجع التحويل</th>
                  <th className="py-2 px-2 font-medium">المسار</th>
                  <th className="py-2 px-2 font-medium">الحالة</th>
                  <th className="py-2 px-2 font-medium">تاريخ الطلب</th>
                  <th className="py-2 px-2 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => {
                  const office = officeById.get(t.officeId);
                  const reviewable = t.status === 'PENDING_REVIEW';
                  return (
                    <tr key={t.id} className="border-t border-surface-container hover:bg-surface-container/50 align-top">
                      <td className="py-2 px-2">
                        <Link to={`/brokers/${t.officeId}`} className="font-semibold text-secondary">
                          {office ? office.name : <span className="font-mono text-xs" dir="ltr">{t.officeId}</span>}
                        </Link>
                        {office && <div className="font-mono text-xs text-on-surface-variant" dir="ltr">{office.code}</div>}
                      </td>
                      <td className="py-2 px-2 tabular-nums font-semibold">{formatSdg(t.amountMinor)}</td>
                      <td className="py-2 px-2 font-mono text-xs" dir="ltr">{t.paymentReferenceNormalized ?? t.providerRef ?? '—'}</td>
                      <td className="py-2 px-2 text-xs">{CONFIRMATION_PATH_LABEL[t.confirmationPath] ?? t.confirmationPath}</td>
                      <td className="py-2 px-2">
                        <Badge variant={TOP_UP_STATUS_VARIANT[t.status]}>{TOP_UP_STATUS_LABEL[t.status]}</Badge>
                        {t.confirmedAt && <div className="text-xs text-on-surface-variant mt-1">{formatDateTime(t.confirmedAt)}</div>}
                      </td>
                      <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(t.createdAt)}</td>
                      <td className="py-2 px-2">
                        <div className="flex flex-wrap gap-1">
                          {t.hasEvidence && canEvidence && (
                            <Button size="sm" variant="outline" icon="download" isLoading={downloading === t.id} onClick={() => download(t.id)}>
                              الإيصال
                            </Button>
                          )}
                          {reviewable && canApprove && (
                            <Button size="sm" icon="check" disabled={!t.hasEvidence} title={t.hasEvidence ? undefined : 'لا يوجد إيصال مرفق'} onClick={() => setReview({ kind: 'approve', topUp: t })}>
                              اعتماد
                            </Button>
                          )}
                          {reviewable && canReject && (
                            <Button size="sm" variant="danger" icon="close" onClick={() => setReview({ kind: 'reject', topUp: t })}>
                              رفض
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pager meta={topUps.data?.meta} busy={topUps.isFetching} onPage={setPage} />
      </section>

      {review && (
        <ReviewModal
          review={review}
          office={officeById.get(review.topUp.officeId)}
          onClose={() => setReview(null)}
          onDone={(text) => {
            setReview(null);
            setNotice({ tone: 'success', text });
          }}
        />
      )}
    </div>
  );
};

const ReviewModal: React.FC<{ review: Review; office: OfficeRef | undefined; onClose: () => void; onDone: (text: string) => void }> = ({
  review,
  office,
  onClose,
  onDone,
}) => {
  const approve = useApproveTopUp();
  const reject = useRejectTopUp();
  const [note, setNote] = React.useState('');
  const { topUp, kind } = review;
  const mutation = kind === 'approve' ? approve : reject;
  const officeLabel = office ? `${office.name} (${office.code})` : topUp.officeId;

  function submit() {
    if (kind === 'approve') {
      approve.mutate(topUp.id, {
        onSuccess: (r) =>
          onDone(r.replayed ? 'الطلب معتمد مسبقًا.' : `تم اعتماد الشحن. رصيد المحفظة الآن ${formatSdg(r.balanceMinor)}.`),
      });
    } else {
      reject.mutate({ id: topUp.id, note: note.trim() || undefined }, { onSuccess: (r) => onDone(r.replayed ? 'الطلب مرفوض مسبقًا.' : 'تم رفض طلب الشحن.') });
    }
  }

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{kind === 'approve' ? 'اعتماد طلب الشحن؟' : 'رفض طلب الشحن؟'}</ModalTitle>
          <ModalDescription>يُسجَّل الإجراء في سجل التدقيق باسمك.</ModalDescription>
        </ModalHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-on-surface-variant">المكتب</dt>
          <dd>{officeLabel}</dd>
          <dt className="text-on-surface-variant">المبلغ</dt>
          <dd className="font-semibold tabular-nums">{formatSdg(topUp.amountMinor)}</dd>
          <dt className="text-on-surface-variant">مرجع التحويل</dt>
          <dd className="font-mono text-xs" dir="ltr">{topUp.paymentReferenceNormalized ?? '—'}</dd>
        </dl>
        {kind === 'approve' ? (
          <p className="text-sm bg-surface-container rounded-lg p-3">
            تأكّد من مطابقة الإيصال للمبلغ والمرجع قبل الاعتماد. سيُضاف <b>{formatSdg(topUp.amountMinor)}</b> إلى المحفظة فورًا ولا يمكن التراجع.
          </p>
        ) : (
          <label className="flex flex-col gap-1 text-sm">
            سبب الرفض (يظهر في السجل)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-2 text-sm"
              placeholder="مثال: الإيصال غير مقروء أو المبلغ لا يطابق التحويل"
            />
            <span className="text-xs text-on-surface-variant">{note.length}/500</span>
          </label>
        )}
        {mutation.isError && <p className="text-xs text-error">{financeErrorMessage(mutation.error)}</p>}
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>تراجع</Button>
          <Button variant={kind === 'approve' ? 'primary' : 'danger'} isLoading={mutation.isPending} onClick={submit}>
            {kind === 'approve' ? 'تأكيد الاعتماد' : 'تأكيد الرفض'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
