import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { errorMessage } from '../../../lib/api/errors';
import { useUpdateCarrier, type CarrierDetail } from '../api';

/** Suspend / reactivate confirmation explaining D-SUS-01 consequences. */
export const CarrierStatusModal: React.FC<{ carrier: CarrierDetail; open: boolean; onOpenChange: (open: boolean) => void }> = ({
  carrier,
  open,
  onOpenChange,
}) => {
  const update = useUpdateCarrier(carrier.id);
  const suspending = carrier.status === 'ACTIVE';

  const close = (next: boolean) => {
    if (!next) update.reset();
    onOpenChange(next);
  };

  const confirm = () =>
    update.mutate({ status: suspending ? 'SUSPENDED' : 'ACTIVE' }, { onSuccess: () => close(false) });

  return (
    <Modal open={open} onOpenChange={close}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{suspending ? `إيقاف ${carrier.name}؟` : `إعادة تفعيل ${carrier.name}؟`}</ModalTitle>
          <ModalDescription>سياسة الإيقاف D-SUS-01 — يُسجَّل الإجراء في سجل التدقيق.</ModalDescription>
        </ModalHeader>
        {suspending ? (
          <ul className="list-disc pr-5 space-y-1 text-sm text-on-surface">
            <li>يتوقف البيع فورًا: تختفي رحلات الشركة من بحث الوكلاء والعملاء، ولا حجوزات أو رحلات جديدة.</li>
            <li>تُحرَّر كل المقاعد المحجوزة مؤقتًا (holds) على رحلاتها القادمة.</li>
            <li>
              <strong>الحجوزات المؤكدة لا تُلغى تلقائيًا.</strong> ستظهر الرحلات المتأثرة في هذه الصفحة لتقرر إلغاء كل رحلة
              مع استرداد كامل أو الإبقاء عليها.
            </li>
            <li>الرحلات المنطلقة أو الجارية تستمر بشكل طبيعي.</li>
          </ul>
        ) : (
          <p className="text-sm text-on-surface">ستعود رحلات الشركة للظهور في البحث ويُستأنف البيع فورًا.</p>
        )}
        {update.isError && <p className="text-xs text-error">{errorMessage(update.error)}</p>}
        <ModalFooter>
          <Button variant="outline" onClick={() => close(false)}>تراجع</Button>
          <Button variant={suspending ? 'danger' : 'primary'} isLoading={update.isPending} onClick={confirm}>
            {suspending ? 'تأكيد الإيقاف' : 'إعادة التفعيل'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
