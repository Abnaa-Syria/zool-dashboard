import { describe, it, expect } from 'vitest';
import { fetchOverviewData } from './overviewService';

describe('Overview Service', () => {
  it('returns today metrics with coherent Sudanese data', async () => {
    const data = await fetchOverviewData({ dateRange: 'today', simulatedState: 'populated' });
    expect(data.totalBookings).toBe(142);
    expect(data.totalRevenue).toBe(4890000);
    expect(data.financialSummary.currency).toBe('ج.س');
    expect(data.recentBookings.length).toBeGreaterThan(0);
    expect(data.recentBookings[0].id).toBe('ZL-854921');
  });

  it('updates metrics when switching to 7 days', async () => {
    const data = await fetchOverviewData({ dateRange: '7days', simulatedState: 'populated' });
    expect(data.totalBookings).toBe(1024);
    expect(data.totalRevenue).toBe(34200000);
  });

  it('updates metrics when switching to 30 days', async () => {
    const data = await fetchOverviewData({ dateRange: '30days', simulatedState: 'populated' });
    expect(data.totalBookings).toBe(4380);
    expect(data.totalRevenue).toBe(148600000);
  });

  it('returns zero metrics for empty state', async () => {
    const data = await fetchOverviewData({ dateRange: 'today', simulatedState: 'empty' });
    expect(data.totalBookings).toBe(0);
    expect(data.totalRevenue).toBe(0);
    expect(data.recentBookings).toEqual([]);
  });

  it('throws an error when simulated state is error', async () => {
    await expect(
      fetchOverviewData({ dateRange: 'today', simulatedState: 'error' })
    ).rejects.toThrow('فشل جلب المؤشرات التشغيلية');
  });
});
