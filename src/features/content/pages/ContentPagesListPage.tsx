import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { KNOWN_PAGES, SLUG_RE, useContentPages, type ContentPage } from '../api';

type Row = { slug: string; label?: string; page?: ContentPage };

export const ContentPagesListPage: React.FC = () => {
  const navigate = useNavigate();
  const pages = useContentPages();
  const [newSlug, setNewSlug] = React.useState('');

  const rows: Row[] = React.useMemo(() => {
    const bySlug = new Map((pages.data ?? []).map((p) => [p.slug, p]));
    const known = KNOWN_PAGES.map((k) => ({ slug: k.slug, label: k.label, page: bySlug.get(k.slug) }));
    const others = (pages.data ?? []).filter((p) => !KNOWN_PAGES.some((k) => k.slug === p.slug)).map((p) => ({ slug: p.slug, page: p }));
    return [...known, ...others];
  }, [pages.data]);

  const slugTaken = rows.some((r) => r.slug === newSlug && r.page);
  const slugError = newSlug && !SLUG_RE.test(newSlug) ? 'حروف إنجليزية صغيرة وأرقام و - (2–64)، تبدأ بحرف' : slugTaken ? 'الصفحة موجودة — افتحها من الجدول' : undefined;

  const createNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (SLUG_RE.test(newSlug) && !slugTaken) navigate(`/content/${newSlug}`);
  };

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'التسويق والمحتوى' }, { label: 'صفحات المحتوى' }]} />
      <PageHeader
        title="صفحات المحتوى"
        subtitle="الصفحات الثابتة في تطبيقات المسافر والوكلاء (الخصوصية، الشروط، المساعدة). النشر يحل محل النسخة الحالية فورًا."
        className="mb-0"
      />

      <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md">
        {pages.isLoading ? (
          <Skeleton className="h-40 rounded-lg" />
        ) : pages.isError ? (
          <ErrorState title="تعذّر تحميل الصفحات" message={errorMessage(pages.error)} onRetry={() => pages.refetch()} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-on-surface-variant text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">الصفحة</th>
                  <th className="py-2 px-2 font-medium">المعرّف (slug)</th>
                  <th className="py-2 px-2 font-medium">العنوان الإنجليزي</th>
                  <th className="py-2 px-2 font-medium">الأقسام</th>
                  <th className="py-2 px-2 font-medium">آخر نشر</th>
                  <th className="py-2 px-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.slug} className="border-t border-surface-container hover:bg-surface-container/50">
                    <td className="py-2 px-2">
                      <Link to={`/content/${r.slug}`} className="font-semibold text-secondary">{r.page?.titleAr ?? r.label}</Link>
                    </td>
                    <td className="py-2 px-2 font-mono text-xs" dir="ltr">{r.slug}</td>
                    <td className="py-2 px-2 text-xs" dir="ltr">{r.page?.titleEn ?? '—'}</td>
                    <td className="py-2 px-2 tabular-nums">{r.page ? r.page.sections.length : '—'}</td>
                    <td className="py-2 px-2 text-on-surface-variant">
                      {r.page ? formatDateTime(r.page.publishedAt) : <Badge variant="warning" dot>غير منشورة</Badge>}
                    </td>
                    <td className="py-2 px-2">
                      <Button size="sm" variant="outline" icon={r.page ? 'edit' : 'add'} onClick={() => navigate(`/content/${r.slug}`)}>
                        {r.page ? 'تحرير' : 'إنشاء'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md">
        <h2 className="font-bold text-on-surface mb-space-sm">صفحة جديدة</h2>
        <form onSubmit={createNew} className="flex flex-wrap items-start gap-space-sm">
          <div className="w-full sm:w-80">
            <Input dir="ltr" value={newSlug} onChange={(e) => setNewSlug(e.target.value.trim().toLowerCase())} placeholder="refund-policy" error={slugError} maxLength={64} aria-label="معرّف الصفحة" />
          </div>
          <Button type="submit" icon="arrow_back" disabled={!SLUG_RE.test(newSlug) || slugTaken}>متابعة للتحرير</Button>
        </form>
        <p className="text-xs text-on-surface-variant mt-2">
          المعرّف ثابت ويُستخدم في رابط التطبيق (<span dir="ltr" className="font-mono">/public/content/&lt;slug&gt;</span>). لا يمكن حذف صفحة بعد نشرها.
        </p>
      </section>
    </div>
  );
};
