import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { DateRangePreset } from '../../../components/ui/PageHeader';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { OverviewHeader } from '../components/OverviewHeader';
import { OverviewMetricsRow } from '../components/OverviewMetricsRow';
import { FinancialSeparationSummary } from '../components/FinancialSeparationSummary';
import { ImmediateActionsQueue } from '../components/ImmediateActionsQueue';
import { BookingDistributionCharts } from '../components/BookingDistributionCharts';
import { RecentBookingsTable } from '../components/RecentBookingsTable';
import { OverviewSkeleton } from '../components/OverviewSkeleton';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { fetchOverviewData } from '../../../services/overviewService';
import type { SimulatedState } from '../../../services/overviewService';

export const OverviewPage: React.FC = () => {
  const [dateRange, setDateRange] = React.useState<DateRangePreset>('today');
  const [simulatedState, setSimulatedState] = React.useState<SimulatedState>('populated');

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['overviewData', dateRange, simulatedState],
    queryFn: () => fetchOverviewData({ dateRange, simulatedState }),
    retry: 1,
  });

  const handleResetTo30Days = () => {
    setDateRange('30days');
    setSimulatedState('populated');
  };

  const handleRetry = () => {
    setSimulatedState('populated');
    refetch();
  };

  const showSkeleton = isLoading || simulatedState === 'loading';
  const showError = isError || simulatedState === 'error';
  const showEmpty = !showSkeleton && !showError && (data?.totalBookings === 0 || simulatedState === 'empty');

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Contextual Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'الرئيسية والعمليات', path: '/overview' }, { label: 'نظرة عامة' }]} />

      {/* Header with Live Sync Banner and Dev Inspector */}
      <OverviewHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={() => refetch()}
        isFetching={isFetching}
        simulatedState={simulatedState}
        onSimulatedStateChange={setSimulatedState}
      />

      {/* Render Appropriate State */}
      {showSkeleton ? (
        <OverviewSkeleton />
      ) : showError ? (
        <ErrorState
          title="تعذّر تحميل بيانات لوحة التحكم المركزية"
          message={error instanceof Error ? error.message : 'فشل جلب المؤشرات التشغيلية من خوادم زولغو المركزية.'}
          diagnosticCode="ERR_ZOOLGO_DISPATCH_TIMEOUT (HTTP 504)"
          onRetry={handleRetry}
        />
      ) : showEmpty ? (
        <EmptyState
          title="لا توجد أنشطة أو حجوزات مسجلة في هذا النطاق الزمني"
          description="لم تسجل أي حركة تذاكر أو إيداعات في النطاق المحدد. يمكنك إعادة التعيين لآخر 30 يوماً لعرض البيانات التاريخية."
          icon="calendar_month"
          actionText="إعادة تعيين إلى آخر 30 يوماً"
          onAction={handleResetTo30Days}
          secondaryActionText="العودة لليوم"
          onSecondaryAction={() => setDateRange('today')}
        />
      ) : data ? (
        <div className="flex flex-col gap-space-lg">
          {/* Primary 4 KPI Metrics */}
          <OverviewMetricsRow metrics={data} />

          {/* Immediate Action Items Required */}
          <ImmediateActionsQueue actions={data.immediateActions} />

          {/* Financial Float & Commission Separation Summary */}
          <FinancialSeparationSummary financials={data.financialSummary} />

          {/* Channels & Booking Status Breakdown */}
          <BookingDistributionCharts
            channelSplit={data.channelSplit}
            statusDistribution={data.statusDistribution}
          />

          {/* Recent Bookings Table */}
          <RecentBookingsTable bookings={data.recentBookings} />
        </div>
      ) : null}
    </div>
  );
};
