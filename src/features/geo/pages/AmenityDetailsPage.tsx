import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Field, FieldGrid, Mono } from '../../../components/shared/DetailFields';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { Section } from '../../admin/components/AdminUi';
import { useAuth } from '../../auth/auth-context';
import { useAmenity } from '../api';
import { AmenityModal } from '../components/AmenityModal';
import { Icon } from '../components/common';
import { AmenityDeleteDialog } from '../components/GeoDeleteDialogs';

export const AmenityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const canManage = can('geo.manage');
  const amenity = useAmenity(id);
  const [modal, setModal] = React.useState<'edit' | 'delete' | null>(null);
  const a = amenity.data;

  const crumbs = [
    { label: 'الشبكة والأسطول' },
    { label: 'مزايا الحافلات', path: '/network/amenities' },
    { label: a?.nameAr ?? '...' },
  ];

  if (amenity.isLoading) return <Skeleton className="h-72 rounded-xl" />;
  if (amenity.isError || !a) {
    return (
      <div className="flex flex-col gap-space-md">
        <Breadcrumbs items={crumbs} />
        <ErrorState title="تعذّر تحميل الميزة" message={errorMessage(amenity.error)} onRetry={() => amenity.refetch()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={crumbs} />
      <PageHeader
        title={a.nameAr}
        subtitle={`${a.nameEn} · ${a.code}`}
        className="mb-0"
        actions={
          canManage ? (
            <>
              <Button variant="outline" icon="edit" onClick={() => setModal('edit')}>تعديل</Button>
              <Button variant="danger" icon="delete" onClick={() => setModal('delete')}>حذف</Button>
            </>
          ) : null
        }
      />

      <Section title="بيانات الميزة">
        <div className="flex items-start gap-space-md">
          <div className="w-14 h-14 shrink-0 rounded-xl bg-surface-container flex items-center justify-center text-secondary" title={a.icon}>
            <Icon name={a.icon} className="text-[30px]" />
          </div>
          <FieldGrid className="flex-1">
            <Field label="الرمز"><Mono>{a.code}</Mono></Field>
            <Field label="الاسم بالعربية">{a.nameAr}</Field>
            <Field label="الاسم بالإنجليزية"><span dir="ltr">{a.nameEn}</span></Field>
            <Field label="الأيقونة"><Mono>{a.icon}</Mono></Field>
            <Field label="ترتيب العرض"><span className="tabular-nums">{a.sortOrder}</span></Field>
            <Field label="المعرّف"><Mono>{a.id}</Mono></Field>
          </FieldGrid>
        </div>
      </Section>

      <Section title="الحافلات التي تحمل الميزة">
        <p className="text-xs text-on-surface-variant leading-relaxed">
          لا تتيح الواجهة البرمجية عرض الحافلات حسب الميزة. تظهر مزايا كل حافلة في صفحة تفاصيلها. لا يمكن حذف ميزة ما زالت مُسندة إلى
          حافلات — أزلها من تلك الحافلات أولًا.
        </p>
      </Section>

      <AmenityModal amenity={a} open={modal === 'edit'} onOpenChange={(o) => !o && setModal(null)} />
      <AmenityDeleteDialog record={modal === 'delete' ? a : null} onClose={() => setModal(null)} onDeleted={() => navigate('/network/amenities')} />
    </div>
  );
};
