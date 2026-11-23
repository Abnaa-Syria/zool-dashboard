import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { Pager, Section } from '../../admin/components/AdminUi';
import { SETTLEMENT_STATUS_LABEL, useSettlements } from '../../settlements/api';

/** Commission settlements of one office (GET /admin/commissions/settlements?officeId=…). */
export const OfficeSettlementsSection: React.FC<{ officeId: string }> = ({ officeId }) => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const q = useSettlements({ officeId, page, pageSize: 10 });
  const rows = q.data?.data ?? [];
  const meta = q.data?.meta;
  return (
    <Section title={`تسويات العمولة${meta ? ` (${meta.total.toLocaleString('en-US')})` : ''}`}>
      {q.isLoading ? (
        <Skeleton className="h-24 rounded-lg" />
      ) : q.isError ? (
        <p className="text-xs text-error">{errorMessage(q.error)}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-on-surface-variant">لا توجد تسويات عمولة لهذا المكتب.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الفترة</TableHead>
              <TableHead>العمولات</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.id} className="cursor-pointer" onClick={() => navigate(`/financials/settlements/${s.id}`)}>
                <TableCell>{formatDateTime(s.periodFrom)} — {formatDateTime(s.periodTo)}</TableCell>
                <TableCell className="tabular-nums">{s.accrualCount ?? '—'}</TableCell>
                <TableCell className="tabular-nums">{formatSdg(s.totalAmountMinor)}</TableCell>
                <TableCell><Badge variant="neutral">{SETTLEMENT_STATUS_LABEL[s.status]}</Badge></TableCell>
                <TableCell>
                  <Link to={`/financials/settlements/${s.id}`} className="text-secondary font-medium" onClick={(e) => e.stopPropagation()}>عرض</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pager meta={meta && meta.totalPages > 1 ? meta : undefined} onPage={setPage} disabled={q.isFetching} />
    </Section>
  );
};
