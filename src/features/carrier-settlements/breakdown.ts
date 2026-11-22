import type { CarrierSettlement, SettlementConfig, SettlementDirection, StatementPreview } from './api';

/** Statement totals in minor units, whatever the source (stored `*Minor` or preview `*Amount`). */
export type StatementTotals = {
  config: SettlementConfig;
  ticketsCount: number;
  onlineMinor: number;
  brokerMinor: number;
  cashMinor: number;
  refundsMinor: number;
  platformDiscountMinor: number;
  platformFeeMinor: number;
  brokerCommissionMinor: number;
  /** As reported by the backend. */
  netMinor: number;
};

export function totalsFromSettlement(s: CarrierSettlement): StatementTotals {
  return {
    config: s.config,
    ticketsCount: s.ticketsCount,
    onlineMinor: s.onlineSalesMinor,
    brokerMinor: s.brokerSalesMinor,
    cashMinor: s.cashSalesMinor,
    refundsMinor: s.refundsMinor,
    platformDiscountMinor: s.platformDiscountMinor,
    platformFeeMinor: s.platformFeeMinor,
    brokerCommissionMinor: s.brokerCommissionMinor,
    netMinor: s.netPayableMinor,
  };
}

export function totalsFromPreview(p: StatementPreview): StatementTotals {
  return {
    config: p.config,
    ticketsCount: p.ticketsCount,
    onlineMinor: p.onlineSalesAmount,
    brokerMinor: p.brokerSalesAmount,
    cashMinor: p.cashSalesAmount,
    refundsMinor: p.refundsAmount,
    platformDiscountMinor: p.platformDiscountAmount,
    platformFeeMinor: p.platformFeeAmount,
    brokerCommissionMinor: p.brokerCommissionAmount,
    netMinor: p.netPayableAmount,
  };
}

export type BreakdownRow = {
  key: 'online' | 'broker' | 'platformDiscount' | 'refunds' | 'platformFee' | 'brokerCommission';
  label: string;
  hint?: string;
  /** Signed contribution to net (negative = deducted). 0 for an excluded row. */
  signedMinor: number;
  /** Raw amount (always ≥ 0) — shown even when excluded. */
  amountMinor: number;
  /** Shown for information but not part of the net (broker commission borne by the platform). */
  excluded?: boolean;
};

export type NetBreakdown = {
  rows: BreakdownRow[];
  /** Sum of the rows (should equal `reportedNetMinor`). */
  netMinor: number;
  reportedNetMinor: number;
  /** Driver cash already held by the carrier — informational, never part of the net. */
  cashInHandMinor: number;
  direction: SettlementDirection;
  /** True when our sum disagrees with the backend's net (shown as a warning). */
  mismatch: boolean;
};

/**
 * D-REV-02: net = online + broker + platform-funded discounts − refunds − platform fee
 * − broker commission (only when the carrier bears it). Driver cash stays out of the net.
 */
export function netBreakdown(t: StatementTotals): NetBreakdown {
  const carrierBears = t.config.commissionBearer === 'CARRIER';
  const rows: BreakdownRow[] = [
    { key: 'online', label: 'مبيعات الدفع الإلكتروني', hint: 'مدفوعات العملاء عبر التطبيق (تحتفظ بها المنصة)', signedMinor: t.onlineMinor, amountMinor: t.onlineMinor },
    { key: 'broker', label: 'مبيعات مكاتب الوكلاء', hint: 'مخصومة من محافظ المكاتب (تحتفظ بها المنصة)', signedMinor: t.brokerMinor, amountMinor: t.brokerMinor },
    { key: 'platformDiscount', label: 'خصومات تموّلها المنصة', hint: 'كوبونات المنصة تُعوَّض للشركة', signedMinor: t.platformDiscountMinor, amountMinor: t.platformDiscountMinor },
    { key: 'refunds', label: 'المبالغ المستردة', hint: 'استرداد مدفوعات إلكترونية للعملاء', signedMinor: -t.refundsMinor, amountMinor: t.refundsMinor },
    { key: 'platformFee', label: 'رسوم المنصة', hint: 'على كل تذكرة مباعة بأي قناة', signedMinor: -t.platformFeeMinor, amountMinor: t.platformFeeMinor },
    {
      key: 'brokerCommission',
      label: 'عمولة الوكلاء',
      hint: carrierBears ? 'تتحملها الشركة' : 'تتحملها المنصة — لا تُخصم من الشركة',
      signedMinor: carrierBears ? -t.brokerCommissionMinor : 0,
      amountMinor: t.brokerCommissionMinor,
      excluded: !carrierBears,
    },
  ];
  const netMinor = rows.reduce((n, r) => n + r.signedMinor, 0);
  return {
    rows,
    netMinor,
    reportedNetMinor: t.netMinor,
    cashInHandMinor: t.cashMinor,
    direction: t.netMinor >= 0 ? 'PLATFORM_PAYS_CARRIER' : 'CARRIER_PAYS_PLATFORM',
    mismatch: netMinor !== t.netMinor,
  };
}

export const DIRECTION_LABEL: Record<SettlementDirection, string> = {
  PLATFORM_PAYS_CARRIER: 'المنصة تدفع للشركة',
  CARRIER_PAYS_PLATFORM: 'الشركة تدفع للمنصة',
};
