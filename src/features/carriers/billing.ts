import { formatSdg } from '../../lib/money';
import type { CommissionBearer, PlatformFeeType } from './api';

/** D-REV-02: PERCENT is stored in basis points (500 = 5%), capped at 100%. */
export const MAX_BASIS_POINTS = 10_000;
/** Backend cap for platformFeeValue (minor units for FIXED). */
export const MAX_FEE_VALUE = 100_000_000;

export const FEE_TYPE_LABEL: Record<PlatformFeeType, string> = {
  NONE: 'بدون رسوم',
  PERCENT: 'نسبة من قيمة التذكرة',
  FIXED: 'مبلغ ثابت لكل تذكرة',
};

export const COMMISSION_BEARER_LABEL: Record<CommissionBearer, string> = {
  PLATFORM: 'المنصة',
  CARRIER: 'شركة النقل',
};

/** "5%" / "2.5%" from basis points. */
export function formatBasisPoints(bp: number): string {
  const pct = bp / 100;
  return `${pct.toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
}

/** Human summary of the platform fee: "5% من كل تذكرة" / "500 ج.س لكل تذكرة" / "بدون رسوم". */
export function describeFee(type: PlatformFeeType, value: number): string {
  if (type === 'PERCENT') return `${formatBasisPoints(value)} من قيمة كل تذكرة`;
  if (type === 'FIXED') return `${formatSdg(value)} لكل تذكرة`;
  return FEE_TYPE_LABEL.NONE;
}

/** Stored value → the text the admin edits (percentage for PERCENT, SDG for FIXED). */
export function feeValueToInput(type: PlatformFeeType, value: number): string {
  if (type === 'NONE') return '';
  return String(value / 100);
}

/**
 * Edited text → stored value (basis points for PERCENT, minor units for FIXED).
 * Returns an Arabic error instead when the input is invalid. NONE always maps to 0.
 */
export function feeInputToValue(type: PlatformFeeType, input: string): { value: number } | { error: string } {
  if (type === 'NONE') return { value: 0 };
  const text = input.trim();
  if (!text) return { error: 'أدخل قيمة الرسوم' };
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return { error: 'رقم موجب بحد أقصى منزلتين عشريتين' };
  const value = Math.round(Number(text) * 100);
  if (type === 'PERCENT' && value > MAX_BASIS_POINTS) return { error: 'النسبة لا تتجاوز 100%' };
  if (value > MAX_FEE_VALUE) return { error: 'المبلغ كبير جدًا' };
  return { value };
}
