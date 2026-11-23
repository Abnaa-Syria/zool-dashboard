import * as React from 'react';
import { DeleteEntityDialog } from '../../../components/shared/DeleteEntityDialog';
import {
  useDeleteAmenity,
  useDeleteCity,
  useDeleteStation,
  useUpdateCity,
  useUpdateStation,
  type Amenity,
  type City,
  type Station,
} from '../api';

type Props<T> = { record: T | null; onClose: () => void; onDeleted?: () => void };

/** Delete a city; when it still has stations (409 ENTITY_IN_USE) offer deactivation instead. */
export const CityDeleteDialog: React.FC<Props<City>> = ({ record, onClose, onDeleted }) => {
  const del = useDeleteCity();
  const update = useUpdateCity();
  return (
    <DeleteEntityDialog
      open={record !== null}
      onOpenChange={(o) => !o && onClose()}
      entityLabel="المدينة"
      name={record?.nameAr ?? ''}
      description={<p>تُحذف معها عمليات البحث الأخيرة للمسافرين عن هذه المدينة.</p>}
      onDelete={() => del.mutateAsync(record!.id)}
      onDeleted={onDeleted}
      alternative={
        record?.isActive
          ? {
              label: 'إلغاء تفعيل المدينة',
              description: 'إلغاء تفعيل المدينة يخفيها من البيانات المرجعية مع إبقاء محطاتها ورحلاتها وحجوزاتها كما هي.',
              run: () => update.mutateAsync({ id: record.id, patch: { isActive: false } }),
            }
          : undefined
      }
    />
  );
};

/** Delete a station; when routes or trips use it offer deactivation instead. */
export const StationDeleteDialog: React.FC<Props<Station>> = ({ record, onClose, onDeleted }) => {
  const del = useDeleteStation();
  const update = useUpdateStation();
  return (
    <DeleteEntityDialog
      open={record !== null}
      onOpenChange={(o) => !o && onClose()}
      entityLabel="المحطة"
      name={record?.nameAr ?? ''}
      onDelete={() => del.mutateAsync(record!.id)}
      onDeleted={onDeleted}
      alternative={
        record?.isActive
          ? {
              label: 'إلغاء تفعيل المحطة',
              description: 'إلغاء تفعيل المحطة يمنع استخدامها في مسارات جديدة مع إبقاء الرحلات والحجوزات القائمة كما هي.',
              run: () => update.mutateAsync({ id: record.id, patch: { isActive: false } }),
            }
          : undefined
      }
    />
  );
};

/** Delete an amenity; the backend refuses while vehicles still carry it (no deactivate flag exists). */
export const AmenityDeleteDialog: React.FC<Props<Amenity>> = ({ record, onClose, onDeleted }) => {
  const del = useDeleteAmenity();
  return (
    <DeleteEntityDialog
      open={record !== null}
      onOpenChange={(o) => !o && onClose()}
      entityLabel="الميزة"
      name={record?.nameAr ?? ''}
      description={<p>إن كانت الميزة مُسندة إلى حافلات فأزلها من تلك الحافلات أولًا (من صفحة تعديل الحافلة).</p>}
      onDelete={() => del.mutateAsync(record!.id)}
      onDeleted={onDeleted}
    />
  );
};
