import * as React from 'react';
import { Card } from '../../../components/ui/Card';
import type { ImmediateActionItem } from '../../../types/overview';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';

export interface ImmediateActionsQueueProps {
  actions: ImmediateActionItem[];
}

export const ImmediateActionsQueue: React.FC<ImmediateActionsQueueProps> = ({ actions }) => {
  if (actions.length === 0) return null;

  return (
    <Card className="mb-space-lg text-right">
      <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30 mb-space-sm">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-error animate-ping" />
          <h3 className="text-sm font-bold text-on-surface">عمليات تتطلب التدخل الفوري</h3>
          <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold">
            {actions.length} مهام
          </span>
        </div>
        <span className="text-xs text-on-surface-variant">طابور المراجعة الإدارية</span>
      </div>

      <div className="divide-y divide-outline-variant/20">
        {actions.map((action) => {
          const severityColors = {
            high: 'bg-error-container/40 border-r-4 border-error',
            medium: 'bg-secondary-fixed/30 border-r-4 border-secondary',
            info: 'bg-surface-container/60 border-r-4 border-outline',
          };

          const icons = {
            bank_transfer: 'receipt_long',
            cancellation_request: 'assignment_return',
            bus_delay: 'schedule',
            broker_low_balance: 'account_balance_wallet',
          };

          return (
            <div
              key={action.id}
              className={cn(
                'p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm my-1 transition-colors hover:bg-surface-container-high/40',
                severityColors[action.severity]
              )}
            >
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
                  {icons[action.type]}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface">{action.title}</span>
                    <span className="text-[10px] text-outline tabular-nums font-mono">
                      {action.timestamp}
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant mt-0.5">
                    {action.description}
                  </span>
                </div>
              </div>

              <Link
                to={action.linkTo}
                className="self-end sm:self-auto shrink-0 inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-surface-container-lowest text-secondary hover:bg-surface-container border border-outline-variant/40 shadow-xs transition-colors"
              >
                <span>{action.actionText}</span>
                <span className="material-symbols-outlined text-[14px]">chevron_left</span>
              </Link>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
