import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import type { PageMeta } from '../../../lib/api/client';

/** Server pagination footer (meta from the API envelope). Hidden for a single page. */
export const Pager: React.FC<{ meta: PageMeta | undefined; busy?: boolean; onPage: (page: number) => void }> = ({ meta, busy, onPage }) => {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-space-sm mt-space-sm border-t border-surface-container text-xs text-on-surface-variant">
      <span>
        صفحة {meta.page} من {meta.totalPages} · {meta.total.toLocaleString('en-US')} سجل
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={meta.page <= 1 || busy} onClick={() => onPage(meta.page - 1)}>السابق</Button>
        <Button size="sm" variant="outline" disabled={meta.page >= meta.totalPages || busy} onClick={() => onPage(meta.page + 1)}>التالي</Button>
      </div>
    </div>
  );
};
