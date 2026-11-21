import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { errorMessage } from '../../../lib/api/errors';
import { useAuth } from '../../auth/auth-context';
import { useCarriers } from '../../carriers/api';
import { useReplaceAssignments, type BrokerOfficeDetail } from '../api';

/** Carriers the office may sell, with per-carrier commission % (D-RATE-01). */
export const AssignmentsSection: React.FC<{ office: BrokerOfficeDetail }> = ({ office }) => {
  const { can } = useAuth();
  const [editOpen, setEditOpen] = React.useState(false);

  return (
    <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md space-y-space-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-on-surface">الشركات المرتبطة والعمولات</h2>
        {can('brokers.manage') && can('carriers.view') && (
          <Button size="sm" variant="outline" icon="edit" onClick={() => setEditOpen(true)}>تعديل</Button>
        )}
      </div>
      {office.carrierAssignments.length === 0 ? (
        <EmptyState title="لا توجد شركات مرتبطة" description="لا يستطيع المكتب البيع قبل ربطه بشركة نقل واحدة على الأقل." icon="link_off" className="my-0 shadow-none" />
      ) : (
        <table className="w-full text-sm">
          <thead className="text-on-surface-variant text-xs">
            <tr className="text-right">
              <th className="py-2 px-2 font-medium">الشركة</th>
              <th className="py-2 px-2 font-medium">نسبة العمولة</th>
            </tr>
          </thead>
          <tbody>
            {office.carrierAssignments.map((a) => (
              <tr key={a.id} className="border-t border-surface-container">
                <td className="py-2 px-2">
                  <Link to={`/companies/${a.companyId}`} className="text-secondary">{a.companyName}</Link>
                </td>
                <td className="py-2 px-2 tabular-nums" dir="ltr">{a.commissionPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editOpen && <EditAssignmentsModal office={office} onClose={() => setEditOpen(false)} />}
    </section>
  );
};

type Row = { companyId: string; percent: string };

const PERCENT_RE = /^\d{1,3}(\.\d{1,2})?$/;
const percentOk = (p: string) => PERCENT_RE.test(p) && Number(p) >= 0 && Number(p) <= 100;

/** PUT /brokers/:id/carriers replaces the whole list. */
const EditAssignmentsModal: React.FC<{ office: BrokerOfficeDetail; onClose: () => void }> = ({ office, onClose }) => {
  const replace = useReplaceAssignments(office.id);
  const carriers = useCarriers({ page: 1, pageSize: 100 });
  const [rows, setRows] = React.useState<Row[]>(() =>
    office.carrierAssignments.map((a) => ({ companyId: a.companyId, percent: String(a.commissionPercent) })),
  );
  const [adding, setAdding] = React.useState('');

  // Carriers already assigned keep their name even if not in the first page of the carriers list.
  const names = new Map<string, string>(office.carrierAssignments.map((a) => [a.companyId, a.companyName]));
  for (const c of carriers.data?.data ?? []) names.set(c.id, c.name);
  const available = (carriers.data?.data ?? []).filter((c) => !rows.some((r) => r.companyId === c.id));
  const valid = rows.every((r) => percentOk(r.percent));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    replace.mutate(
      rows.map((r) => ({ companyId: r.companyId, commissionPercent: Number(r.percent) })),
      { onSuccess: onClose },
    );
  };

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent size="lg">
        <form onSubmit={submit} className="grid gap-3">
          <ModalHeader>
            <ModalTitle>الشركات المرتبطة بـ {office.name}</ModalTitle>
            <ModalDescription>تُستبدل القائمة كاملة عند الحفظ. تسري النسبة الجديدة على الحجوزات القادمة فقط.</ModalDescription>
          </ModalHeader>
          {rows.length === 0 && <p className="text-sm text-on-surface-variant">لا توجد شركات — أضف شركة من القائمة أدناه.</p>}
          {rows.map((r, i) => (
            <div key={r.companyId} className="flex items-center gap-2">
              <span className="flex-1 text-sm">{names.get(r.companyId) ?? r.companyId}</span>
              <input
                aria-label="نسبة العمولة"
                dir="ltr"
                inputMode="decimal"
                value={r.percent}
                onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, percent: e.target.value.trim() } : x)))}
                className={`h-9 w-24 rounded-lg border px-2 text-sm ${percentOk(r.percent) ? 'border-outline-variant/60' : 'border-error'}`}
              />
              <span className="text-sm">%</span>
              <Button type="button" size="sm" variant="ghost" icon="delete" aria-label="إزالة" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} />
            </div>
          ))}
          <div className="flex items-center gap-2 border-t border-outline-variant/30 pt-3">
            <select
              aria-label="إضافة شركة"
              value={adding}
              onChange={(e) => setAdding(e.target.value)}
              className="h-9 flex-1 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-2 text-sm"
              disabled={carriers.isLoading}
            >
              <option value="">{carriers.isLoading ? 'جارٍ التحميل...' : 'اختر شركة لإضافتها'}</option>
              {available.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.status === 'SUSPENDED' ? ' (موقوفة)' : ''}
                </option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              icon="add"
              disabled={!adding}
              onClick={() => {
                setRows((rs) => [...rs, { companyId: adding, percent: '0' }]);
                setAdding('');
              }}
            >
              إضافة
            </Button>
          </div>
          {carriers.isError && <p className="text-xs text-error">{errorMessage(carriers.error)}</p>}
          {!valid && <p className="text-xs text-error">النسبة بين 0 و 100 وبحد أقصى خانتين عشريتين.</p>}
          {replace.isError && <p className="text-xs text-error">{errorMessage(replace.error)}</p>}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={!valid} isLoading={replace.isPending}>حفظ</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
