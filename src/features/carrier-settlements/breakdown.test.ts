import { describe, expect, it } from 'vitest';
import type { CarrierSettlement, StatementPreview } from './api';
import { netBreakdown, totalsFromPreview, totalsFromSettlement, type StatementTotals } from './breakdown';

const base: StatementTotals = {
  config: { feeType: 'PERCENT', feeValue: 500, commissionBearer: 'CARRIER' },
  ticketsCount: 10,
  onlineMinor: 100_000,
  brokerMinor: 50_000,
  cashMinor: 30_000,
  refundsMinor: 10_000,
  platformDiscountMinor: 2_000,
  platformFeeMinor: 9_100,
  brokerCommissionMinor: 2_500,
  netMinor: 130_400,
};

describe('carrier statement net breakdown', () => {
  it('deducts the broker commission when the carrier bears it', () => {
    const b = netBreakdown(base);
    expect(b.netMinor).toBe(100_000 + 50_000 + 2_000 - 10_000 - 9_100 - 2_500);
    expect(b.mismatch).toBe(false);
    expect(b.direction).toBe('PLATFORM_PAYS_CARRIER');
    expect(b.rows.find((r) => r.key === 'brokerCommission')).toMatchObject({ signedMinor: -2_500, excluded: false });
  });

  it('shows but excludes the broker commission when the platform bears it', () => {
    const b = netBreakdown({ ...base, config: { ...base.config, commissionBearer: 'PLATFORM' }, netMinor: 132_900 });
    expect(b.netMinor).toBe(132_900);
    expect(b.mismatch).toBe(false);
    expect(b.rows.find((r) => r.key === 'brokerCommission')).toMatchObject({ signedMinor: 0, amountMinor: 2_500, excluded: true });
  });

  it('keeps driver cash out of the net', () => {
    const b = netBreakdown({ ...base, cashMinor: 999_999 });
    expect(b.cashInHandMinor).toBe(999_999);
    expect(b.netMinor).toBe(130_400);
  });

  it('reports a negative net as the carrier paying the platform', () => {
    const t: StatementTotals = { ...base, onlineMinor: 0, brokerMinor: 0, platformDiscountMinor: 0, refundsMinor: 0, platformFeeMinor: 5_000, brokerCommissionMinor: 0, netMinor: -5_000 };
    const b = netBreakdown(t);
    expect(b.netMinor).toBe(-5_000);
    expect(b.direction).toBe('CARRIER_PAYS_PLATFORM');
  });

  it('flags a disagreement with the backend net', () => {
    expect(netBreakdown({ ...base, netMinor: 1 }).mismatch).toBe(true);
  });

  it('normalizes preview (*Amount) and stored (*Minor) names to the same totals', () => {
    const preview: StatementPreview = {
      periodFrom: '2026-10-31T22:00:00.000Z',
      periodTo: '2026-11-21T22:00:00.000Z',
      config: base.config,
      ticketsCount: 10,
      onlineSalesAmount: 100_000,
      brokerSalesAmount: 50_000,
      cashSalesAmount: 30_000,
      refundsAmount: 10_000,
      platformDiscountAmount: 2_000,
      platformFeeAmount: 9_100,
      brokerCommissionAmount: 2_500,
      netPayableAmount: 130_400,
      lines: [],
    };
    const stored = {
      config: base.config,
      ticketsCount: 10,
      onlineSalesMinor: 100_000,
      brokerSalesMinor: 50_000,
      cashSalesMinor: 30_000,
      refundsMinor: 10_000,
      platformDiscountMinor: 2_000,
      platformFeeMinor: 9_100,
      brokerCommissionMinor: 2_500,
      netPayableMinor: 130_400,
    } as CarrierSettlement;
    expect(totalsFromPreview(preview)).toEqual(base);
    expect(totalsFromSettlement(stored)).toEqual(base);
  });
});
