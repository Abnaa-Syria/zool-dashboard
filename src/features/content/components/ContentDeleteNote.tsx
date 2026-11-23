import * as React from 'react';
import { KNOWN_PAGES } from '../api';

/** Consequences of deleting a content page (list + editor). */
export const ContentDeleteNote: React.FC<{ slug: string }> = ({ slug }) => (
  <p>
    ستختفي الصفحة من التطبيقات فورًا (<span dir="ltr" className="font-mono">/public/content/{slug}</span> يعيد «غير موجود»).
    {KNOWN_PAGES.some((k) => k.slug === slug) ? ' هذه صفحة تربطها التطبيقات مباشرة؛ يمكن إعادة نشرها لاحقًا بنفس المعرّف.' : ''}
  </p>
);
