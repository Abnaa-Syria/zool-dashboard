import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { errorMessage } from '../../../lib/api/errors';
import { useUpdateOfficeStatus, type BrokerOfficeDetail } from '../api';

/** PATCH /brokers/:id/status with the D-SUS-01 broker-office consequences spelled out. */
export const OfficeStatusModal: React.FC<{ office: BrokerOfficeDetail; onClose: () => void }> = ({ office, onClose }) => {
  const update = useUpdateOfficeStatus(office.id);
  const suspending = office.status === 'ACTIVE';

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{suspending ? `إيقاف ${office.name}؟` : `إعادة تفعيل ${office.name}؟`}</ModalTitle>
          <ModalDescription>سياسة الإيقاف D-SUS-01 — يُسجَّل الإجراء في سجل التدقيق.</ModalDescription>
        </ModalHeader>
        {suspending ? (
          <ul className="list-disc pr-5 space-y-1 text-sm">
            <li>لا يستطيع موظفو المكتب تسجيل الدخول أو الحجز.</li>
            <li>تُجمَّد المحفظة: لا شحن ولا خصم.</li>
            <li>الحجوزات المؤكدة تبقى صالحة، ويمكن للإدارة إلغاؤها واستردادها عند الحاجة.</li>
          </ul>
        ) : (
          <p className="text-sm">يستطيع موظفو المكتب تسجيل الدخول والحجز مجددًا، وتعود المحفظة للعمل.</p>
        )}
        {update.isError && <p className="text-xs text-error">{errorMessage(update.error)}</p>}
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>تراجع</Button>
          <Button
            variant={suspending ? 'danger' : 'primary'}
            isLoading={update.isPending}
            onClick={() => update.mutate(suspending ? 'SUSPENDED' : 'ACTIVE', { onSuccess: onClose })}
          >
            {suspending ? 'تأكيد الإيقاف' : 'إعادة التفعيل'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
