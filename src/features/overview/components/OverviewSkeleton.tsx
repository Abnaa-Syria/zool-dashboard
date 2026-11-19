import * as React from 'react';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Card } from '../../../components/ui/Card';

export const OverviewSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-space-lg w-full animate-in fade-in-0 duration-200">
      {/* 4 KPI Cards Skeleton Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-space-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-sm">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <div className="space-y-2 my-space-xs">
              <Skeleton className="h-8 w-36 rounded-lg" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="mt-space-md pt-space-xs border-t border-outline-variant/30 flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </Card>
        ))}
      </div>

      {/* Immediate Actions Queue Skeleton */}
      <Card className="p-space-md space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </Card>

      {/* Financial Liquidity & Float Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        <Skeleton className="h-48 rounded-xl" />
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>

      {/* Charts & Split Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>

      {/* Recent Bookings Table Skeleton */}
      <Card className="p-space-md space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-outline-variant/10">
            <Skeleton className="h-6 w-24 rounded" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </Card>
    </div>
  );
};
