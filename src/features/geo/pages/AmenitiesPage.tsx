import * as React from 'react';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { useAuth } from '../../auth/auth-context';
import { useAmenities, type Amenity } from '../api';
import { AmenityModal } from '../components/AmenityModal';
import { Icon, Panel, TableShell, Td, Th } from '../components/common';

export const AmenitiesPage: React.FC = () => {
  const { can } = useAuth();
  const canManage = can('geo.manage');
  const amenities = useAmenities();
  const [modal, setModal] = React.useState<{ amenity?: Amenity } | null>(null);
  const rows = amenities.data ?? [];

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'الشبكة والأسطول' }, { label: 'مزايا الحافلات' }]} />
      <PageHeader
        title="مزايا الحافلات"
        subtitle="كتالوج المزايا (واي فاي، تكييف، أمتعة...) التي تُسند إلى الحافلات وتظهر للمسافرين."
        className="mb-0"
        actions={canManage ? <Button icon="add" onClick={() => setModal({})}>إضافة ميزة</Button> : null}
      />

      <Panel>
        {amenities.isLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : amenities.isError ? (
          <ErrorState title="تعذّر تحميل المزايا" message={errorMessage(amenities.error)} onRetry={() => amenities.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState title="لا توجد مزايا بعد" description="أضف أول ميزة لإسنادها إلى الحافلات." icon="featured_seasonal_and_gifts" />
        ) : (
          <TableShell
            head={
              <>
                <Th className="w-12">الأيقونة</Th>
                <Th>الرمز</Th>
                <Th>الاسم</Th>
                <Th>الترتيب</Th>
                {canManage && <Th className="text-left">إجراءات</Th>}
              </>
            }
          >
            {rows.map((a) => (
              <tr key={a.id} className="border-t border-surface-container hover:bg-surface-container/50">
                <Td>
                  <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary" title={a.icon}>
                    <Icon name={a.icon} className="text-[20px]" />
                  </div>
                </Td>
                <Td className="font-mono text-xs" dir="ltr">{a.code}</Td>
                <Td>
                  <div className="font-semibold">{a.nameAr}</div>
                  <div className="text-xs text-on-surface-variant" dir="ltr">{a.nameEn}</div>
                </Td>
                <Td className="tabular-nums">{a.sortOrder}</Td>
                {canManage && (
                  <Td className="text-left">
                    <Button size="sm" variant="ghost" icon="edit" onClick={() => setModal({ amenity: a })}>تعديل</Button>
                  </Td>
                )}
              </tr>
            ))}
          </TableShell>
        )}
        <p className="text-xs text-on-surface-variant mt-space-sm">لا يوجد حذف للمزايا عبر الواجهة البرمجية حاليًا؛ عدّل الاسم أو الأيقونة عند الحاجة.</p>
      </Panel>

      <AmenityModal amenity={modal?.amenity} open={modal !== null} onOpenChange={(o) => !o && setModal(null)} />
    </div>
  );
};
