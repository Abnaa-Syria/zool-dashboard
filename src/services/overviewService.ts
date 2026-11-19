import type { OverviewMetrics } from '../types/overview';
import type { DateRangePreset } from '../components/ui/PageHeader';
import {
  mockOverviewDataByPreset,
  mockEmptyOverviewData,
} from '../mocks/fixtures/overviewFixtures';

export type SimulatedState = 'populated' | 'loading' | 'empty' | 'error';

export interface OverviewServiceOptions {
  dateRange: DateRangePreset;
  simulatedState?: SimulatedState;
}

/**
 * Replaceable data service for fetching the Overview dashboard data
 * Simulates async server-latency and supports development state inspection
 */
export async function fetchOverviewData({
  dateRange,
  simulatedState = 'populated',
}: OverviewServiceOptions): Promise<OverviewMetrics> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, simulatedState === 'loading' ? 999999 : 350));

  if (simulatedState === 'error') {
    throw new Error('فشل جلب المؤشرات التشغيلية: خطأ غير متوقع في خادم البيانات المركزي.');
  }

  if (simulatedState === 'empty' || dateRange === 'custom') {
    return mockEmptyOverviewData;
  }

  // Return preset matching the selected date range
  return mockOverviewDataByPreset[dateRange] || mockOverviewDataByPreset.today;
}
