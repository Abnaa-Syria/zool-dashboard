import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button, IconButton } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { KNOWN_PAGES, SLUG_RE, usePublishContent, useContentPages, validateContent, type ContentPage, type ContentSection } from '../api';

type DraftSection = ContentSection & { key: number };

let nextKey = 1;
const blankSection = (): DraftSection => ({ key: nextKey++, titleAr: '', titleEn: '', bodyAr: '', bodyEn: '' });

const textareaCls =
  'w-full min-h-[120px] rounded-lg bg-surface-container-lowest text-on-surface text-sm border border-outline-variant/60 p-3 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary';

const TextArea: React.FC<{ label: string; value: string; onChange: (v: string) => void; dir: 'rtl' | 'ltr' }> = ({ label, value, onChange, dir }) => {
  const id = React.useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-on-surface">{label}</label>
      <textarea id={id} dir={dir} value={value} onChange={(e) => onChange(e.target.value)} maxLength={20_000} className={textareaCls} />
    </div>
  );
};

/** Form state is seeded once from the published page (component is keyed by slug + updatedAt). */
const Editor: React.FC<{ slug: string; page: ContentPage | undefined; defaultTitle?: string }> = ({ slug, page, defaultTitle }) => {
  const publish = usePublishContent(slug);
  const [titleAr, setTitleAr] = React.useState(page?.titleAr ?? defaultTitle ?? '');
  const [titleEn, setTitleEn] = React.useState(page?.titleEn ?? '');
  const [sections, setSections] = React.useState<DraftSection[]>(() =>
    page ? page.sections.map((s) => ({ ...s, key: nextKey++ })) : [blankSection()],
  );

  const draft = {
    titleAr: titleAr.trim(),
    titleEn: titleEn.trim(),
    sections: sections.map((s) => ({ titleAr: s.titleAr.trim(), titleEn: s.titleEn.trim(), bodyAr: s.bodyAr.trim(), bodyEn: s.bodyEn.trim() })),
  };
  const error = validateContent(draft);
  const dirty = !page || JSON.stringify(draft) !== JSON.stringify({ titleAr: page.titleAr, titleEn: page.titleEn, sections: page.sections });

  const patch = (key: number, field: keyof ContentSection, value: string) =>
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)));
  const move = (index: number, delta: -1 | 1) =>
    setSections((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item!);
      return next;
    });
  const remove = (key: number) => setSections((prev) => prev.filter((s) => s.key !== key));

  return (
    <>
      <PageHeader
        title={page?.titleAr ?? defaultTitle ?? slug}
        subtitle={page ? `آخر نشر: ${formatDateTime(page.publishedAt)}` : 'صفحة جديدة — لم تُنشر بعد'}
        className="mb-0"
        badge={dirty && page ? <Badge variant="warning" dot>تغييرات غير منشورة</Badge> : undefined}
        actions={
          <Button icon="publish" disabled={Boolean(error) || !dirty} isLoading={publish.isPending} onClick={() => publish.mutate(draft)}>
            نشر
          </Button>
        }
      />
      {error && dirty && <p className="text-xs text-on-surface-variant">لا يمكن النشر بعد: {error}</p>}
      {publish.isError && <p className="text-xs text-error">{errorMessage(publish.error)}</p>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-md items-start">
        <div className="flex flex-col gap-space-md">
          <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="العنوان (عربي)" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} maxLength={160} />
            <Input label="Title (English)" dir="ltr" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} maxLength={160} />
          </section>

          {sections.map((s, i) => (
            <section key={s.key} className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-on-surface">القسم {i + 1}</h2>
                <div className="flex items-center gap-1">
                  <IconButton size="sm" icon="arrow_upward" label="تحريك لأعلى" disabled={i === 0} onClick={() => move(i, -1)} />
                  <IconButton size="sm" icon="arrow_downward" label="تحريك لأسفل" disabled={i === sections.length - 1} onClick={() => move(i, 1)} />
                  <IconButton size="sm" icon="delete" label="حذف القسم" disabled={sections.length <= 1} onClick={() => remove(s.key)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="عنوان القسم (عربي)" value={s.titleAr} onChange={(e) => patch(s.key, 'titleAr', e.target.value)} maxLength={200} />
                <Input label="Section title (English)" dir="ltr" value={s.titleEn} onChange={(e) => patch(s.key, 'titleEn', e.target.value)} maxLength={200} />
                <TextArea label="النص (عربي)" dir="rtl" value={s.bodyAr} onChange={(v) => patch(s.key, 'bodyAr', v)} />
                <TextArea label="Body (English)" dir="ltr" value={s.bodyEn} onChange={(v) => patch(s.key, 'bodyEn', v)} />
              </div>
            </section>
          ))}

          <Button variant="outline" icon="add" disabled={sections.length >= 50} onClick={() => setSections((prev) => [...prev, blankSection()])} className="self-start">
            إضافة قسم
          </Button>
        </div>

        <aside className="xl:sticky xl:top-4 bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md">
          <div className="flex items-center justify-between mb-space-sm">
            <h2 className="text-xs font-semibold text-on-surface-variant">معاينة النسخة العربية</h2>
            <span dir="ltr" className="font-mono text-xs text-on-surface-variant">/public/content/{slug}</span>
          </div>
          <article dir="rtl" className="flex flex-col gap-4 text-right">
            <h1 className="text-xl font-bold text-on-surface">{titleAr || 'بدون عنوان'}</h1>
            {sections.map((s) => (
              <div key={s.key} className="flex flex-col gap-1">
                <h3 className="font-semibold text-on-surface">{s.titleAr || '—'}</h3>
                <p className="text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">{s.bodyAr || '—'}</p>
              </div>
            ))}
          </article>
        </aside>
      </div>
    </>
  );
};

export const ContentEditorPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const pages = useContentPages();
  const page = pages.data?.find((p) => p.slug === slug);
  const known = KNOWN_PAGES.find((k) => k.slug === slug);

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'التسويق والمحتوى' }, { label: 'صفحات المحتوى', path: '/content' }, { label: page?.titleAr ?? known?.label ?? slug }]} />
      {!SLUG_RE.test(slug) ? (
        <ErrorState title="معرّف صفحة غير صالح" message="المعرّف: حروف إنجليزية صغيرة وأرقام و - (2–64)، يبدأ بحرف." />
      ) : pages.isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : pages.isError ? (
        <ErrorState title="تعذّر تحميل الصفحة" message={errorMessage(pages.error)} onRetry={() => pages.refetch()} />
      ) : (
        <Editor key={`${slug}|${page?.updatedAt ?? 'new'}`} slug={slug} page={page} defaultTitle={known?.label} />
      )}
    </div>
  );
};
