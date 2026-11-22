import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api/client';

export type ContentSection = { titleAr: string; titleEn: string; bodyAr: string; bodyEn: string };

/** GET /admin/content row; also the PUT result (backend content.service `toDto`). */
export type ContentPage = {
  slug: string;
  titleAr: string;
  titleEn: string;
  sections: ContentSection[];
  publishedAt: string;
  updatedAt: string;
};

export type ContentInput = { titleAr: string; titleEn: string; sections: ContentSection[] };

export const SLUG_RE = /^[a-z][a-z0-9-]{1,63}$/;

/** Pages the apps link to (shown even before their first publish). */
export const KNOWN_PAGES: Array<{ slug: string; label: string }> = [
  { slug: 'privacy', label: 'سياسة الخصوصية' },
  { slug: 'terms', label: 'الشروط والأحكام' },
  { slug: 'help', label: 'المساعدة' },
];

/** Backend limits (content.routes `upsertSchema`). */
export const CONTENT_LIMITS = { pageTitle: [2, 160], sectionTitle: [1, 200], body: [1, 20_000], sections: [1, 50] } as const;

export const contentKeys = { all: ['admin-content'] as const };

export function useContentPages() {
  return useQuery({
    queryKey: contentKeys.all,
    queryFn: ({ signal }) => api.get<ContentPage[]>('/admin/content', undefined, signal).then((r) => r.data),
  });
}

/** PUT /admin/content/:slug — creates or replaces the page and publishes it immediately. */
export function usePublishContent(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ContentInput) => api.put<ContentPage>(`/admin/content/${slug}`, input).then((r) => r.data),
    onSuccess: (page) => {
      qc.setQueryData<ContentPage[]>(contentKeys.all, (prev) =>
        prev ? [...prev.filter((p) => p.slug !== page.slug), page].sort((a, b) => a.slug.localeCompare(b.slug)) : prev,
      );
      return qc.invalidateQueries({ queryKey: contentKeys.all });
    },
  });
}

/** Returns an Arabic error for a draft, or null when it satisfies the backend schema. */
export function validateContent(input: ContentInput): string | null {
  const len = (s: string) => s.trim().length;
  const [tMin, tMax] = CONTENT_LIMITS.pageTitle;
  if (len(input.titleAr) < tMin || len(input.titleAr) > tMax) return `العنوان العربي بين ${tMin} و ${tMax} حرفًا.`;
  if (len(input.titleEn) < tMin || len(input.titleEn) > tMax) return `العنوان الإنجليزي بين ${tMin} و ${tMax} حرفًا.`;
  const [sMin, sMax] = CONTENT_LIMITS.sections;
  if (input.sections.length < sMin || input.sections.length > sMax) return `عدد الأقسام بين ${sMin} و ${sMax}.`;
  for (const [i, s] of input.sections.entries()) {
    const n = i + 1;
    if (len(s.titleAr) < 1 || len(s.titleAr) > 200 || len(s.titleEn) < 1 || len(s.titleEn) > 200) return `القسم ${n}: العنوانان مطلوبان (حتى 200 حرف).`;
    if (len(s.bodyAr) < 1 || len(s.bodyAr) > 20_000 || len(s.bodyEn) < 1 || len(s.bodyEn) > 20_000) return `القسم ${n}: النصان العربي والإنجليزي مطلوبان (حتى 20,000 حرف).`;
  }
  return null;
}
